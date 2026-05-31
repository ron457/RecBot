import { useState, useRef, useEffect } from "react"

export default function App() {
  const [query, setQuery] = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [context, setContext] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleSend = async () => {
    if (!query.trim() || loading) return
    const userMessage = { role: "user", text: query }
    setMessages(prev => [...prev, userMessage])
    setQuery("")
    setLoading(true)

    try {
      const response = await fetch("http://127.0.0.1:8000/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage.text, context })
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let products = []
      let recommendation = ""
      let firstChunk = true
      let buffer = ""

      setMessages(prev => [...prev, { role: "bot", text: "", products: [] }])
      setLoading(false)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value)

        if (firstChunk) {
          const newline = buffer.indexOf('\n')
          if (newline === -1) continue
          const firstLine = buffer.slice(0, newline)
          if (firstLine.startsWith("PRODUCTS:")) {
            const parsed = JSON.parse(firstLine.slice(9))
            products = parsed.products
            const newContext = parsed.context
            setContext(newContext)
            buffer = buffer.slice(newline + 1)
            firstChunk = false
            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1].products = products
              return updated
            })
          }
        } else {
          recommendation += buffer
          buffer = ""
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1].text = recommendation
            return updated
          })
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "bot",
        text: "Backend unreachable. Make sure uvicorn is running."
      }])
      setLoading(false)
    }
  }

  const handleSuggestion = (q) => {
    setQuery(q)
  }

  const handleReset = () => {
    setMessages([])
    setContext(null)
  }

  return (
    <div style={s.page}>
      <div style={s.sidebar}>
        <div style={s.logo}>⬡ RECBOT</div>
        <div style={s.tagline}>AI Product Assistant</div>
        <div style={s.divider} />
        <p style={s.hint}>Try asking:</p>
        {["best phone under ₹20k", "gaming laptop under ₹80k", "wireless earphones with long battery"].map((q, i) => (
          <div key={i} style={s.suggestion} onClick={() => handleSuggestion(q)}>{q}</div>
        ))}
        {context && (
          <>
            <div style={s.divider} />
            <p style={s.hint}>Current Session</p>
            <div style={s.contextBox}>
              {context.product_category && <p style={s.contextItem}>📦 {context.product_category}</p>}
              {context.max_price && <p style={s.contextItem}>💰 Budget: ₹{context.max_price}</p>}
              {context.key_needs?.length > 0 && <p style={s.contextItem}>🎯 {context.key_needs.join(", ")}</p>}
            </div>
            <button style={s.resetBtn} onClick={handleReset}>New Session</button>
          </>
        )}
        <div style={s.footer}>
          <span style={s.pill}>Mistral</span>
          <span style={s.pill}>LangChain</span>
          <span style={s.pill}>Amazon</span>
        </div>
      </div>

      <div style={s.main}>
        <div style={s.chatArea}>
          {messages.length === 0 && (
            <div style={s.empty}>
              <div style={s.emptyIcon}>⬡</div>
              <p style={s.emptyTitle}>What are you looking for?</p>
              <p style={s.emptySubtitle}>I'll search Amazon live and recommend the best options.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i}>
              <div style={msg.role === "user" ? s.userBubble : s.botBubble}>
                {msg.role === "bot" && <span style={s.botLabel}>RECBOT</span>}
                <p style={s.bubbleText}>{msg.text}</p>
              </div>
              {msg.products && msg.products.length > 0 && (
                <div style={s.grid}>
                  {msg.products.map((p, j) => (
                    <a key={j} href={p.url} target="_blank" rel="noreferrer" style={s.card}>
                      <div style={s.imgWrap}>
                        <img src={p.image} alt={p.name} style={s.img} />
                      </div>
                      <div style={s.cardBody}>
                        <p style={s.cardName}>{p.name.slice(0, 55)}...</p>
                        <p style={s.cardPrice}>{p.price}</p>
                        <p style={s.cardRating}>⭐ {p.rating} · {p.reviews} reviews</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={s.botBubble}>
              <span style={s.botLabel}>RECBOT</span>
              <p style={s.bubbleText}>🔍 Searching Amazon + reasoning...</p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={s.inputRow}>
          <input
            style={s.input}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Ask for a recommendation..."
          />
          <button style={s.btn} onClick={handleSend} disabled={loading}>
            {loading ? "..." : "→"}
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { display: "flex", height: "100vh", background: "#0a0a0a", color: "#e0e0e0", fontFamily: "'Inter', 'DM Sans', sans-serif", overflow: "hidden" },
  sidebar: { width: 220, borderRight: "1px solid #1f1f1f", padding: "32px 20px", display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 },
  logo: { fontSize: 18, fontWeight: 700, letterSpacing: "0.15em", color: "#ffffff" },
  tagline: { fontSize: 10, letterSpacing: "0.2em", color: "#444", textTransform: "uppercase", marginBottom: 8 },
  divider: { height: 1, background: "#1a1a1a", margin: "8px 0" },
  hint: { fontSize: 10, color: "#333", textTransform: "uppercase", letterSpacing: "0.15em", margin: "4px 0" },
  suggestion: { fontSize: 12, color: "#555", padding: "8px 10px", borderRadius: 6, cursor: "pointer", border: "1px solid #1a1a1a", lineHeight: 1.4 },
  contextBox: { background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 },
  contextItem: { fontSize: 11, color: "#555", margin: 0, lineHeight: 1.4 },
  resetBtn: { fontSize: 10, color: "#333", background: "transparent", border: "1px solid #1f1f1f", borderRadius: 4, padding: "6px 10px", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase" },
  footer: { marginTop: "auto", display: "flex", flexDirection: "column", gap: 6 },
  pill: { fontSize: 10, color: "#333", border: "1px solid #1f1f1f", borderRadius: 4, padding: "3px 8px", letterSpacing: "0.1em", textTransform: "uppercase", width: "fit-content" },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  chatArea: { flex: 1, overflowY: "auto", padding: "40px 48px", display: "flex", flexDirection: "column", gap: 20 },
  empty: { margin: "auto", textAlign: "center", opacity: 0.3 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 600, letterSpacing: "0.05em", margin: "0 0 8px" },
  emptySubtitle: { fontSize: 13, color: "#555", margin: 0 },
  userBubble: { marginLeft: "auto", background: "#141414", border: "1px solid #222", borderRadius: "12px 12px 2px 12px", padding: "12px 16px", maxWidth: "60%" },
  botBubble: { background: "transparent", border: "1px solid #1a1a1a", borderRadius: "2px 12px 12px 12px", padding: "14px 18px", maxWidth: "85%" },
  botLabel: { fontSize: 9, letterSpacing: "0.2em", color: "#333", textTransform: "uppercase", display: "block", marginBottom: 6 },
  bubbleText: { margin: 0, fontSize: 13, lineHeight: 1.75, color: "#ccc" },
  grid: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12, marginLeft: 4 },
  card: { width: 150, background: "#0f0f0f", border: "1px solid #1c1c1c", borderRadius: 10, overflow: "hidden", textDecoration: "none", color: "inherit", display: "block" },
  imgWrap: { background: "#141414", padding: 10, display: "flex", alignItems: "center", justifyContent: "center", height: 110 },
  img: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" },
  cardBody: { padding: "10px 10px 12px" },
  cardName: { fontSize: 11, color: "#888", margin: "0 0 6px", lineHeight: 1.4 },
  cardPrice: { fontSize: 14, fontWeight: 600, color: "#ffffff", margin: "0 0 4px", letterSpacing: "0.02em" },
  cardRating: { fontSize: 10, color: "#444", margin: 0, letterSpacing: "0.05em" },
  inputRow: { padding: "20px 48px 28px", display: "flex", gap: 10, borderTop: "1px solid #111" },
  input: { flex: 1, background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: 8, padding: "13px 18px", color: "#e0e0e0", fontSize: 13, outline: "none", letterSpacing: "0.02em" },
  btn: { background: "#ffffff", color: "#000000", border: "none", borderRadius: 8, padding: "13px 22px", fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em" }
}