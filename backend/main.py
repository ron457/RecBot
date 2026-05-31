from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from agents import intent_chain, rec_chain, followup_chain, query_type_chain
from search import search_amazon_products, search_web_reviews
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    context: Optional[dict] = None

@app.post("/recommend")
async def recommend(request: QueryRequest):
    last_shown = request.context.get("last_shown_products", []) if request.context else []

    # Step 1: Detect followup vs new search
    query_type = "new_search"
    if last_shown:
        raw_type = query_type_chain.invoke({"user_query": request.query}).strip().lower()
        query_type = "followup" if "followup" in raw_type else "new_search"

    # FOLLOWUP PATH
    if query_type == "followup":
        last_shown_text = "\n".join(last_shown)
        def stream_followup():
            yield f"PRODUCTS:{json.dumps({'products': [], 'context': request.context})}\n"
            for chunk in followup_chain.stream({
                "user_query": request.query,
                "last_shown_products": last_shown_text
            }):
                yield chunk
        return StreamingResponse(stream_followup(), media_type="text/plain")

    # NEW SEARCH PATH
    context_str = ""
    if request.context:
        context_str = f"\nSession context: previously searched {request.context.get('product_category','')} budget ₹{request.context.get('max_price','unknown')}."

    intent_raw = intent_chain.invoke({"user_query": request.query + context_str}).strip()

    try:
        intent = json.loads(intent_raw)
    except:
        start = intent_raw.find('{')
        end = intent_raw.rfind('}') + 1
        intent = json.loads(intent_raw[start:end])

    # Inherit budget from context if not in new query
    if request.context and not intent.get("max_price"):
        intent["max_price"] = request.context.get("max_price")

    # Search Amazon
    products = search_amazon_products(
        query=intent.get("search_query", request.query),
        min_price=intent.get("min_price"),
        max_price=intent.get("max_price")
    )

    budget_note = ""
    if not products and intent.get("max_price"):
        products = search_amazon_products(query=intent.get("search_query", request.query))
        budget_note = f"I couldn't find well-reviewed options within ₹{intent.get('max_price')} — if you'd consider stretching your budget slightly, here are the top-rated options:\n\n"

    if not products:
        return StreamingResponse(
            iter([f"PRODUCTS:{json.dumps({'products': [], 'context': intent})}\n",
                  "Sorry, no matching products found on Amazon right now."]),
            media_type="text/plain"
        )

    # Get web reviews for top product
    top_product = products[0]["name"] if products else ""
    web_reviews = search_web_reviews(top_product)

    products_text = "\n".join([
        f"- {p['name']} | Price: {p['price']} | Rating: {p['rating']}⭐ ({p['reviews']} reviews)"
        for p in products
    ])

    def stream():
        yield f"PRODUCTS:{json.dumps({'products': products, 'context': {**intent, 'last_shown_products': [p['name'] for p in products]}})}\n"
        if budget_note:
            yield budget_note
        for chunk in rec_chain.stream({
            "user_query": request.query,
            "products": products_text,
            "web_reviews": web_reviews,
            "last_shown": "\n".join(request.context.get("last_shown_products", [])) if request.context else "None",
            "max_price": str(intent.get("max_price", "not specified"))
        }):
            yield chunk

    return StreamingResponse(stream(), media_type="text/plain")

@app.get("/health")
async def health():
    return {"status": "online"}