# RecBot Architecture Documentation

# Overview

RecBot is a multi-agent AI recommendation system designed to help users discover products through conversational interactions.

The platform combines:

* Large Language Models (LLMs)
* Live Amazon product retrieval
* Reddit community discussions
* YouTube review insights
* Conversational memory
* Streaming responses

to generate grounded and explainable product recommendations.

---

# Architectural Goals

The system was designed with the following objectives:

* Generate trustworthy recommendations
* Reduce hallucinations
* Support follow-up conversations
* Provide explainable reasoning
* Stream responses in real time
* Maintain modular agent separation
* Support future scalability

---

# High-Level System Architecture

```text
┌───────────────────────────────────────────────┐
│                    USER                       │
└───────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│               React Frontend                  │
└───────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│               FastAPI Backend                 │
└───────────────────────────────────────────────┘
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
 Query Type      Intent Classifier   Session Context
 Classifier
        │
        ▼
 Product Search Agent
        │
        ▼
 Web Review Agent
        │
        ▼
 Recommendation Writer
        │
        ▼
 Streaming Response Engine
        │
        ▼
 Frontend UI
```

---

# System Components

## Frontend Layer

Technology:

* React
* Vite
* Fetch API
* ReadableStream

Responsibilities:

* Accept user queries
* Display streamed responses
* Maintain chat history
* Handle follow-up questions
* Render recommendation results

---

## Backend Layer

Technology:

* FastAPI
* Python

Responsibilities:

* Request routing
* Agent orchestration
* Session management
* API integrations
* Response streaming

---

## LLM Layer

Technology:

* Ollama
* Mistral 7B

Responsibilities:

* Intent extraction
* Product reasoning
* Recommendation generation
* Follow-up conversation handling

---

# Agent Architecture

RecBot follows a Supervisor + Specialist Agent design pattern.

## Agent Execution Flow

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
Intent Agent   Follow-up Agent
 │
 ▼
Product Search Agent
 │
 ▼
Web Review Agent
 │
 ▼
Recommendation Writer
 │
 ▼
Response
```

---

# Query Type Classifier

Purpose:

Determine whether the incoming request is:

* New recommendation search
* Follow-up question

Examples:

New Search:

"Recommend a gaming laptop under ₹80,000"

Follow-up:

"Compare the first and third option"

Output:

```json
{
  "query_type": "new_search"
}
```

or

```json
{
  "query_type": "follow_up"
}
```

---

# Intent Classifier Agent

Purpose:

Extract recommendation constraints.

Responsibilities:

* Product category detection
* Budget extraction
* Brand preferences
* Use case understanding

Example:

Input:

"Best Marshall amplifier under ₹15,000 for home practice"

Output:

```json
{
  "category": "amplifier",
  "brand": "Marshall",
  "budget": 15000,
  "use_case": "home practice"
}
```

---

# Product Search Agent

Purpose:

Retrieve products from Amazon.

Data Source:

Amazon Product Data API (RapidAPI)

Filtering Rules:

* Rating >= 3.5
* Reviews >= 10

Responsibilities:

* Search products
* Rank products
* Remove low-quality products
* Return candidate recommendations

---

# Web Review Agent

Purpose:

Validate recommendations using external sources.

Sources:

* Reddit
* YouTube

Responsibilities:

* Gather community opinions
* Identify recurring issues
* Extract positive feedback
* Support recommendation generation

Benefits:

* Improves trustworthiness
* Reduces platform bias

---

# Recommendation Writer Agent

Purpose:

Generate final recommendation response.

Inputs:

* User intent
* Product list
* Web review insights

Output Example:

```text
1. Marshall MG15

Pros:
- Excellent practice amplifier
- Strong community feedback

Cons:
- Limited effects

Best For:
Home practice
```

---

# Follow-Up Agent

Purpose:

Handle contextual conversations.

Examples:

* Compare products
* Explain recommendations
* Summarize options

Restrictions:

The follow-up agent may only access:

* Previous products
* Conversation history

The agent cannot initiate a new product search.

This significantly reduces hallucination risk.

---

# Session Memory Architecture

Session context is maintained per conversation.

Structure:

```json
{
  "category": "",
  "budget": 0,
  "preferences": [],
  "conversation_history": [],
  "last_shown_products": []
}
```

Stored Information:

* User requirements
* Product candidates
* Follow-up context

---

# Streaming Architecture

RecBot streams recommendations progressively.

Benefits:

* Faster perceived performance
* Better user experience
* ChatGPT-style interactions

Flow:

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

# External Integrations

## Amazon Product API

Provider:

RapidAPI

Purpose:

* Product retrieval
* Pricing
* Ratings
* Review counts

---

## SerpAPI

Purpose:

Search:

* Reddit discussions
* YouTube reviews

Provides:

* Reviewer opinions
* Community sentiment

---

## Ollama

Purpose:

Local LLM execution.

Model:

```text
Mistral 7B
```

Benefits:

* Privacy
* Lower cost
* Local deployment

---

# Data Flow Diagram

```text
User Query
     │
     ▼
Frontend
     │
     ▼
FastAPI
     │
     ▼
Intent Extraction
     │
     ▼
Amazon Search
     │
     ▼
Review Validation
     │
     ▼
Recommendation Generation
     │
     ▼
Streaming Response
     │
     ▼
Frontend Display
```

---

# Hallucination Prevention Strategy

The system implements multiple safeguards.

## Grounded Product Retrieval

Recommendations are generated only from:

* Amazon results
* Verified products

---

## Review Validation

Recommendations are cross-checked against:

* Reddit
* YouTube

---

## Follow-Up Restrictions

Follow-up agent operates exclusively on:

* Existing conversation context
* Previously retrieved products

No additional product generation is permitted.

---

# Deployment Architecture

```text
┌─────────────────────────────┐
│          Browser            │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      React Frontend         │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       FastAPI Backend       │
└───────┬───────────┬─────────┘
        │           │
        ▼           ▼
   Ollama      External APIs

   Mistral     Amazon + SerpAPI
```

---

# Performance Characteristics

| Metric              | Value     |
| ------------------- | --------- |
| Initial Search      | 30–60 sec |
| Follow-Up Query     | 20–40 sec |
| First Token Latency | 15–20 sec |
| Products Returned   | Up to 5   |

---

# Security Considerations

Current protections:

* API key isolation
* Session separation
* Input validation
* Controlled external API access

Future enhancements:

* Authentication
* Rate limiting
* Persistent encrypted sessions

---

# Future Enhancements

## Vector Database

Potential technologies:

* ChromaDB
* FAISS
* Pinecone

Benefits:

* Semantic retrieval
* Faster follow-up reasoning

---

## Recommendation Ranking Layer

Additional ranking signals:

* Sentiment score
* Review confidence
* Price-to-value ratio

---

## Voice Interface

Future support:

* Speech-to-text
* Voice recommendations

---

## Mobile Application

Potential platforms:

* React Native
* Flutter

---

# Conclusion

RecBot demonstrates a production-style multi-agent recommendation architecture that combines LLM reasoning, live product retrieval, external review validation, conversational memory, and response streaming to deliver trustworthy and explainable product recommendations.
