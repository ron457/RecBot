import requests
import os
from dotenv import load_dotenv

load_dotenv()

def search_amazon_products(query, min_price=None, max_price=None):
    url = "https://real-time-amazon-data.p.rapidapi.com/search"
    
    params = {
        "query": query,
        "page": "1",
        "country": "IN",
        "sort_by": "REVIEWS",
        "product_condition": "ALL"
    }
    
    if min_price:
        params["min_price"] = str(min_price)
    if max_price:
        params["max_price"] = str(max_price)

    headers = {
        "X-RapidAPI-Key": os.getenv("RAPIDAPI_KEY"),
        "X-RapidAPI-Host": "real-time-amazon-data.p.rapidapi.com"
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        data = response.json()
        
        products = []
        for item in data.get("data", {}).get("products", [])[:5]:
            # Skip products with no reviews
            reviews = item.get("product_num_ratings", 0)
            if isinstance(reviews, str):
                reviews = int(reviews.replace(",", "")) if reviews else 0
            rating = float(item.get("product_star_rating") or 0)
            if reviews < 10 or rating < 3.5:
                continue
            products.append({
                "name": item.get("product_title", ""),
                "price": item.get("product_price", "N/A"),
                "rating": item.get("product_star_rating", "N/A"),
                "reviews": reviews,
                "url": item.get("product_url", ""),
                "image": item.get("product_photo", "")
            })
        return products[:5]

    except Exception as e:
        print(f"Search error: {e}")
        return []


def search_web_reviews(product_name):
    """Search YouTube + Reddit for reviews of a product"""
    api_key = os.getenv("SERPAPI_KEY")
    if not api_key:
        return "No web reviews available."

    results_text = []

    # YouTube reviews
    try:
        yt_response = requests.get("https://serpapi.com/search", params={
            "engine": "youtube",
            "search_query": f"{product_name} review",
            "api_key": api_key
        })
        yt_data = yt_response.json()
        videos = yt_data.get("video_results", [])[:3]
        if videos:
            results_text.append("YouTube Reviews:")
            for v in videos:
                results_text.append(f"- {v.get('title')} ({v.get('views', 'N/A')} views)")
    except Exception as e:
        print(f"YouTube search error: {e}")

    # Reddit reviews
    try:
        reddit_response = requests.get("https://serpapi.com/search", params={
            "engine": "google",
            "q": f"{product_name} review site:reddit.com",
            "api_key": api_key,
            "num": 3
        })
        reddit_data = reddit_response.json()
        results = reddit_data.get("organic_results", [])[:3]
        if results:
            results_text.append("\nReddit Reviews:")
            for r in results:
                results_text.append(f"- {r.get('title')}: {r.get('snippet', '')[:100]}")
    except Exception as e:
        print(f"Reddit search error: {e}")

    return "\n".join(results_text) if results_text else "No web reviews found."