import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "../App.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://youtube-learning-assistant.onrender.com";
function Chat() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I'm your study assistant. Ask me anything!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const windowRef = useRef(null);

  useEffect(() => {
    if (windowRef.current) {
      windowRef.current.scrollTop = windowRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Chat request failed");
      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, I couldn't reach the AI. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-page">
      <div className="hero">
        <span className="hero-eyebrow">Ask Anything</span>
        <h1 className="hero-title" style={{ fontSize: "1.9rem" }}>
          Study Assistant Chat
        </h1>
      </div>

      <div className="chat-window" ref={windowRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-row ${msg.role}`}>
            <div className={`chat-bubble ${msg.role}`}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && <div className="chat-typing">AI is typing…</div>}
      </div>

      <div className="chat-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask a question…"
          className="input-field"
        />
        <button onClick={sendMessage} disabled={loading} className="btn btn-primary">
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;