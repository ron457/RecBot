# 🤖 RecBot

<div align="center">

### AI-Powered Multi-Agent Product Recommendation Assistant

Built with LangChain • FastAPI • React • Ollama • Mistral 7B

Live Amazon Product Search • Reddit & YouTube Validation • Conversational Memory • Streaming Responses

</div>

---

## Overview

RecBot is an AI-powered product recommendation assistant that helps users discover products through natural language conversations.

Unlike traditional recommendation engines that rely solely on marketplace ratings, RecBot combines:

- Live Amazon product retrieval
- Reddit community discussions
- YouTube review insights
- Conversational memory
- Multi-agent reasoning

to generate trustworthy and explainable recommendations.

The system is built using a supervisor-driven multi-agent architecture where specialized agents collaborate sequentially to understand user intent, retrieve products, validate recommendations using external review signals, and generate grounded responses.

---

## Key Features

### Multi-Agent Recommendation Pipeline

RecBot uses specialized agents that collaborate to generate recommendations.

| Component | Type |
|------------|------------|
| Query Type Classifier | Agent / Chain |
| Intent Classifier | Agent / Chain |
| Product Search | Tool / Service |
| Web Review Retrieval | Tool / Service |
| Recommendation Writer | Agent / Chain |
| Followup Agent | Agent / Chain |

---

### Live Amazon Product Search

RecBot retrieves real-time product data from Amazon India through RapidAPI.

Filtering Rules:

- Rating ≥ 3.5
- Reviews ≥ 10

This removes low-quality products and improves recommendation quality.

---

### Cross-Platform Review Validation

Recommendations are verified using:

- Amazon Reviews
- Reddit Discussions
- YouTube Review Signals

This reduces marketplace bias and improves recommendation trustworthiness.

---

### Conversational Memory

The system maintains session context including:

- Product category
- Budget constraints
- User preferences
- Previously shown products

Example:

User:

> Recommend Marshall amplifiers under ₹15,000

Follow-up:

> Compare the first and third option

RecBot answers using previously retrieved products without re-running product search.

---

### Streaming Responses

Responses are streamed token-by-token using:

- FastAPI StreamingResponse
- Python generators
- React ReadableStream

This provides a ChatGPT-style user experience.

---

## System Architecture

```text
User Query
     │
     ▼
FastAPI Orchestrator
     │
     ▼
Query Type Classifier
     │
     ├──────────────► Followup Agent
     │                       │
     │                       ▼
     │                 Stream Response
     │
     ▼
Intent Classifier
     │
     ▼
Product Search Service
     │
     ▼
Web Review Retrieval Service
     │
     ▼
Recommendation Writer
     │
     ▼
Streaming Response
     │
     ▼
Frontend
```

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
- Fetch API
- ReadableStream

### External Services

- Amazon Product Data API (RapidAPI)
- SerpAPI

---

## Project Structure

```text
recbot/
│
├── backend/
│   ├── agents/
│   │   ├── query_classifier.py
│   │   ├── intent_classifier.py
│   │   ├── recommendation_writer.py
│   │   └── followup_agent.py
│   │
│   ├── services/
│   │   ├── amazon_search.py
│   │   └── web_reviews.py
│   │
│   ├── prompts/
│   ├── models/
│   ├── utils/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   └── ARCHITECTURE.md
│
└── README.md
```

---

## Local Installation

### Prerequisites

Install:

- Python 3.11+
- Node.js 20+
- Git
- Ollama

---

### Clone Repository

```bash
git clone https://github.com/<username>/recbot.git

cd recbot
```

---

### Install Ollama

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

### Backend Setup

```bash
cd backend

python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Linux/Mac:

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

Run backend:

```bash
uvicorn main:app --reload
```

Backend URL:

```text
http://localhost:8000
```

---

### Frontend Setup

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

Example Query:

```text
Best Marshall amplifier under ₹15,000
```

---

## Hallucination Prevention

RecBot minimizes hallucinations through:

- Query Type routing
- Product grounding
- Followup restrictions
- Rating filters
- Review-count filters
- Context preservation

The Followup Agent only receives previously retrieved products and conversation context.

---

## Performance

| Metric | Observed |
|----------|----------|
| New Search | 30–60 sec |
| Follow-up | 20–40 sec |
| First Token Latency | 15–20 sec |
| Products Returned | Up to 5 |

---

## Future Enhancements

### Near-Term

- Category keyword filtering
- GPU acceleration
- Persistent sessions

### Long-Term

- ChromaDB / FAISS
- Semantic product search
- Sentiment analysis pipeline
- Price history tracking
- Voice input
- Mobile application

---

## Contributors

- Ron Gangopadhyay
- Anshuman Anand Nayak
- Piyush Pravakar Nayak
- Rhitav Gangopadhyay

---
