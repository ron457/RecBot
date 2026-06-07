# 🤖 RecBot

<div align="center">

AI-Powered Multi-Agent Product Recommendation System

Built with LangChain • FastAPI • React • Ollama • Mistral 7B

</div>

---

## Overview

RecBot is a production-style AI recommendation assistant that helps users discover products using conversational natural language.

Unlike traditional recommendation engines that rely only on marketplace ratings, RecBot combines:

- Live Amazon product data
- Reddit discussions
- YouTube review signals
- Multi-agent reasoning
- Conversational memory

to generate trustworthy and explainable recommendations.

---

## Key Features

### Multi-Agent Architecture

RecBot uses specialized agents that collaborate to generate recommendations.

| Agent | Responsibility |
|---------|---------------|
| Query Type Classifier | Detects new search vs follow-up |
| Intent Classifier | Extracts budget, category, preferences |
| Product Search Agent | Retrieves live Amazon products |
| Web Review Agent | Collects Reddit + YouTube review signals |
| Recommendation Writer | Generates recommendation response |
| Follow-up Agent | Handles comparisons and follow-up questions |

---

### Real-Time Product Search

RecBot retrieves products directly from Amazon India using RapidAPI.

Quality filters:

- Rating >= 3.5
- Reviews >= 10

This removes low-quality products and improves recommendation reliability.

---

### Cross-Platform Validation

Recommendations are verified using:

- Amazon Reviews
- Reddit Discussions
- YouTube Review Signals

This reduces marketplace bias and improves trustworthiness.

---

### Conversational Memory

RecBot remembers:

- Category
- Budget
- User requirements
- Previously shown products

Example:

User:

> Recommend Marshall amplifiers under ₹15,000

Follow-up:

> Compare the first and third options

RecBot answers without performing another product search.

---

### Streaming Responses

Responses stream token-by-token similar to ChatGPT.

Benefits:

- Faster perceived response time
- Improved user experience
- Live recommendation generation

---

## Technology Stack

### Backend

- Python
- FastAPI
- LangChain
- Ollama
- Mistral 7B

### Frontend

- React
- Vite
- ReadableStream
- Fetch API

### External Services

- Amazon Product Data API (RapidAPI)
- SerpAPI

---

## Architecture

See:

```text
docs/ARCHITECTURE.md
```

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-org/recbot.git

cd recbot
```

---

### 2. Install Ollama

Download:

https://ollama.com

Pull model:

```bash
ollama pull mistral
```

Verify:

```bash
ollama run mistral
```

---

### 3. Backend Setup

```bash
cd backend

python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Mac/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create:

```env
RAPIDAPI_KEY=<YOUR_KEY>
SERPAPI_KEY=<YOUR_KEY>
OLLAMA_MODEL=mistral
```

Run:

```bash
uvicorn main:app --reload
```

Backend URL:

```text
http://localhost:8000
```

---

### 4. Frontend Setup

```bash
cd frontend

npm install
```

Run:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## Running RecBot

Start:

1. Ollama
2. FastAPI
3. React Frontend

Open:

```text
http://localhost:5173
```

Try:

```text
Best gaming laptop under ₹80,000
```

or

```text
Best Marshall amplifier under ₹15,000
```

---

## Hallucination Prevention

RecBot implements multiple safeguards:

- Follow-up grounding
- Product grounding
- Rating filters
- Review-count filters
- Explicit context restrictions

The Follow-up Agent is only allowed to reason over previously shown products.

---

## Performance

| Metric | Value |
|----------|---------|
| Initial Search | 30–60 sec |
| Follow-up Query | 20–40 sec |
| First Token Latency | 15–20 sec |
| Products Returned | Up to 5 |

---

## Future Roadmap

### Phase 2

- ChromaDB Integration
- Semantic Product Search
- Persistent Conversations

### Phase 3

- Sentiment Analysis Pipeline
- Price Tracking
- Deal Alerts

### Phase 4

- Voice Assistant
- Mobile Application
- Personalized User Profiles

---

## Contributors

- Anshuman Anand Nayak
- Piyush Pravakar Nayak
- Rhitav Gangopadhyay

---

## License

MIT License
