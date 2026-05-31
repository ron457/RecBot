from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from search import search_amazon_products, search_web_reviews
import json

llm = OllamaLLM(model="mistral", temperature=0.5)

# Query type classifier
query_type_prompt = PromptTemplate(
    input_variables=["user_query"],
    template="""Classify this user query into one of two types:
- "new_search": user wants to find new products
- "followup": user is asking about, comparing, or discussing products already shown

Respond with ONLY one word: new_search or followup

User query: {user_query}"""
)
query_type_chain = query_type_prompt | llm

# Intent Classifier
intent_prompt = PromptTemplate(
    input_variables=["user_query"],
    template="""You are an intent classifier for a product recommendation system.

Given the user query, extract:
1. product_category: exact product type (e.g. marshall guitar amplifier, smartphone, laptop)
2. brand: specific brand if mentioned (e.g. Marshall, Sony, Samsung), else null
3. min_price: INR amount ONLY if user says "above/more than", else null
4. max_price: INR amount ONLY if user says "under/below/within/less than", else null
5. key_needs: up to 3 keywords (e.g. tone, portability, battery)
6. search_query: specific Amazon India search string. If brand mentioned, ALWAYS include brand name.

RULES:
- "under X" / "below X" / "within X" = max_price only, min_price = null
- "above X" = min_price only, max_price = null  
- If brand is mentioned, search_query MUST start with brand name
- Focus on products with good user reviews

Respond ONLY in this exact JSON format:
{{"product_category": "...", "brand": null, "min_price": null, "max_price": null, "key_needs": ["..."], "search_query": "..."}}

User query: {user_query}"""
)
intent_chain = intent_prompt | llm

# Recommendation Writer with web reviews
rec_prompt = PromptTemplate(
    input_variables=["user_query", "products", "web_reviews", "last_shown", "max_price"],
    template="""You are an expert product recommendation assistant with access to Amazon data and web reviews.

User asked: {user_query}
Budget: ₹{max_price}

Amazon products found (sorted by reviews):
{products}

Web reviews from YouTube and Reddit:
{web_reviews}

Previously shown products:
{last_shown}

Instructions:
- Only recommend products that have strong positive reviews confirmed across Amazon AND web sources
- If a product has many Amazon reviews AND positive YouTube/Reddit mentions, highlight that
- If the best product slightly exceeds budget, mention it with "if you'd consider stretching your budget slightly..."
- Be specific — mention wattage, features, ratings, review count
- Give ONE clear top recommendation with reasons, then mention 1-2 alternatives
- Keep it to 5-6 sentences max"""
)
rec_chain = rec_prompt | llm

# Followup responder
followup_prompt = PromptTemplate(
    input_variables=["user_query", "last_shown_products"],
    template="""You are a knowledgeable product assistant. The user was shown these products:

{last_shown_products}

The user is now asking: {user_query}

Answer directly using only the products listed above.
Compare specifications if asked. Give a clear personal recommendation at the end.
Keep it to 4-6 sentences. Do not recommend products not in the list."""
)
followup_chain = followup_prompt | llm