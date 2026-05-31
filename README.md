RecBot remembers what it showed you and answers follow-ups without re-searching Amazon.

**Session context** — the sidebar shows your detected category, budget, and key needs. Click **New Session** to start fresh.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/recommend` | Main recommendation endpoint. Body: `{ "query": string, "context": object }` |
| `GET` | `/health` | Health check. Returns `{ "status": "online" }` |

---

## How Streaming Works

The `/recommend` endpoint returns a `StreamingResponse` in two parts:

1. **First chunk** — `PRODUCTS:{json}` header containing product cards and updated session context
2. **Subsequent chunks** — raw recommendation text from Mistral, word by word

The React frontend uses the Fetch API with `ReadableStream` to consume chunks incrementally, rendering product cards immediately and filling in recommendation text as it arrives.

---

## Known Limitations

- **Response speed** — Mistral 7B on CPU takes 30–60s per response. GPU acceleration or a cloud LLM would reduce this significantly
- **Broad searches** — Amazon occasionally returns off-topic results. Category keyword filtering can reduce this
- **API free tiers** — RapidAPI and SerpAPI free tiers limit production usage (100 req/month each)
- **Session persistence** — context resets on browser refresh (in-memory only)

---

## Future Improvements

- [ ] GPU-accelerated Ollama or cloud LLM for faster responses
- [ ] Vector database (ChromaDB/FAISS) for semantic product similarity search
- [ ] Sentiment analysis on YouTube transcripts and Reddit comments
- [ ] Price history tracking and deal alerts via Keepa API
- [ ] Side-by-side specification comparison table
- [ ] Persistent session storage across browser refreshes
- [ ] Voice input for hands-free queries

---

## Authors


**Rhitav Gangopadhyay**
