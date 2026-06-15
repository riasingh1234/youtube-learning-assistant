import { useState } from "react";
import ReactMarkdown from 'react-markdown'; 
import "../App.css";

function Chat() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I'm your study assistant. Ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Updated endpoint path to target the live Render backend service
      const response = await fetch("https://youtube-learning-assistant.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, I couldn't reach the AI." }]);
    } finally {
      setMessages((prev) => [...prev].filter(m => m.text !== "Sorry, I couldn't reach the AI.")); 
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#1a202c" }}>Study Assistant Chat</h2>
      
      <div style={{ height: "400px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", marginBottom: "20px", backgroundColor: "#f7fafc" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: "15px", textAlign: msg.role === "user" ? "right" : "left" }}>
            <div style={{ 
              display: "inline-block", 
              padding: "10px 15px", 
              borderRadius: "12px", 
              backgroundColor: msg.role === "user" ? "#764ba2" : "#ffffff", 
              color: msg.role === "user" ? "#ffffff" : "#2d3748",
              border: msg.role === "ai" ? "1px solid #e2e8f0" : "none",
              textAlign: "left" 
            }}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && <div style={{ color: "#718096", fontSize: "0.9rem" }}>AI is typing...</div>}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask a question..."
          style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e0", outline: "none" }}
        />
        <button onClick={sendMessage} disabled={loading} style={{ padding: "10px 20px", background: "#764ba2", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;