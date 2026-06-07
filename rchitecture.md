# RecBot Architecture

---

# Overview

RecBot is a supervisor-driven multi-agent recommendation system that combines:

- LangChain agents
- External retrieval services
- Conversational memory
- Streaming responses
- Local LLM inference

to generate grounded product recommendations.

The system uses FastAPI as an orchestration layer while specialized agents and retrieval services execute sequentially.

---

# Architectural Goals

The system was designed to:

- Provide trustworthy recommendations
- Reduce hallucinations
- Support multi-turn conversations
- Maintain explainability
- Stream responses in real time
- Enable modular development

---

# High-Level System Architecture

```text
User
 │
 ▼
React Frontend
 │
 ▼
FastAPI Orchestrator
 │
 ▼
Query Type Classifier
 │
 ├────────────► Followup Agent
 │                    │
 │                    ▼
 │             Stream Response
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

# System Components

## FastAPI Orchestrator

Type:

Supervisor

Responsibilities:

- Route requests
- Invoke components
- Manage session context
- Coordinate streaming

---

# Component Architecture

| Component Name | Component Type | Tool Used | LLM Required |
|---------------|---------------|------------|-------------|
| Query Type Classifier | Agent / Chain | LangChain LCEL Prompt | Yes — Mistral |
| Intent Classifier | Agent / Chain | LangChain LCEL Prompt | Yes — Mistral |
| Product Search | Tool / Service | RapidAPI HTTP Call | No |
| Web Review Retrieval | Tool / Service | SerpAPI HTTP Call | No |
| Recommendation Writer | Agent / Chain | LangChain LCEL Prompt | Yes — Mistral |
| Followup Agent | Agent / Chain | LangChain LCEL Prompt | Yes — Mistral |

---

# Component Pipeline

```text
User Query
      │
      ▼
Query Type Classifier
      │
 ┌────┴──────────────┐
 │                   │
 ▼                   ▼
New Search       Follow-up
 │                   │
 ▼                   ▼
Intent Agent    Followup Agent
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
Stream Response
```

---

# Query Type Classifier

Purpose:

Determine whether a request is:

- New Search
- Follow-up

Example:

Input:

"Compare the first and third recommendation"

Output:

```json
{
  "query_type": "followup"
}
```

---

# Intent Classifier

Purpose:

Extract:

- Category
- Brand
- Budget
- Use case

Example:

```json
{
  "category": "amplifier",
  "brand": "Marshall",
  "budget": 15000,
  "use_case": "home practice"
}
```

---

# Product Search Service

Purpose:

Retrieve Amazon products.

Provider:

RapidAPI

Filtering Rules:

- Rating ≥ 3.5
- Reviews ≥ 10

Responsibilities:

- Product retrieval
- Ranking
- Filtering

---

# Web Review Retrieval Service

Purpose:

Retrieve external review signals.

Sources:

- Reddit
- YouTube

Provider:

SerpAPI

Responsibilities:

- Community validation
- Reviewer consensus extraction
- Supporting evidence generation

---

# Recommendation Writer

Purpose:

Generate recommendation responses.

Inputs:

- User intent
- Product data
- Review insights

Outputs:

- Ranked recommendations
- Pros and cons
- Justification

---

# Followup Agent

Purpose:

Handle multi-turn conversations.

Examples:

- Product comparisons
- Clarification questions
- Follow-up recommendations

Restrictions:

Only accesses:

- last_shown_products
- conversation_history

Cannot invoke product search.

---

# Session Context Architecture

```json
{
  "category": "",
  "budget": 0,
  "key_needs": [],
  "last_shown_products": [],
  "conversation_history": []
}
```

---

# Streaming Architecture

```text
LangChain Stream
       │
       ▼
Python Generator
       │
       ▼
StreamingResponse
       │
       ▼
HTTP Chunk Stream
       │
       ▼
ReadableStream
       │
       ▼
React Renderer
```

---

# Hallucination Prevention

RecBot implements multiple safeguards.

### Query Type Gating

Prevents unnecessary product searches.

### Product Grounding

Recommendation Writer only receives retrieved products.

### Followup Restrictions

Followup Agent only receives:

- conversation_history
- last_shown_products

### Product Filtering

Products must satisfy:

- Rating ≥ 3.5
- Reviews ≥ 10

---

# External Integrations

## RapidAPI

Provides:

- Product information
- Ratings
- Pricing
- Review counts

---

## SerpAPI

Provides:

- Reddit discussions
- YouTube review search results

---

## Ollama

Provides:

- Local model execution

Model:

```text
Mistral 7B
```

---

# Deployment Architecture

```text
Browser
   │
   ▼
React Frontend
   │
   ▼
FastAPI Backend
   │
   ├── Ollama (Mistral)
   │
   ├── RapidAPI
   │
   └── SerpAPI
```

---

# Performance Characteristics

| Metric | Observed |
|----------|----------|
| New Search | 30–60 sec |
| Follow-up | 20–40 sec |
| First Token Latency | 15–20 sec |
| Products Returned | Up to 5 |

---

# Future Architecture

```text
Current Pipeline
       │
       ▼
Vector Database
       │
       ▼
Semantic Search
       │
       ▼
Recommendation Ranking
       │
       ▼
Price Tracking
       │
       ▼
Voice Assistant
```

---

# Conclusion

RecBot demonstrates a production-style AI recommendation system that combines agent-based reasoning, live product retrieval, external review validation, conversational memory, and streaming inference to generate trustworthy and explainable product recommendations.
