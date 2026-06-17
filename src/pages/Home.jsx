import React, { useState } from "react";

const Home = () => {
  const [inputValue, setInputValue] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerate = async () => {
    if (!inputValue.trim()) return;
    
    setLoading(true);
    setErrorMsg("");
    setFlashcards([]);
    setCurrentIndex(0);
    setIsFlipped(false);

    try {
      // FORCED LIVE BACKEND CONNECTION
      const response = await fetch("https://youtube-learning-assistant.onrender.com/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputValue }),
      });

      if (!response.ok) {
        throw new Error("Server responded with an error status.");
      }

      const data = await response.json();
      
      if (data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
      } else {
        throw new Error("No flashcards found in the server response.");
      }
    } catch (error) {
      console.error("Frontend Generation Error:", error);
      setErrorMsg("Failed to connect to the live AI engine. Please check your network or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "10px", color: "#1e293b" }}>YouTube Learning Assistant</h1>
      <p style={{ color: "#64748b", marginBottom: "30px" }}>Convert video lectures into smart, interactive study decks instantly.</p>

      <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Paste YouTube Link or Study Topic Here..."
          style={{ flex: 1, padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "1rem" }}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{ padding: "12px 24px", borderRadius: "8px", border: "none", backgroundColor: "#6366f1", color: "#fff", fontSize: "1rem", fontWeight: "600", cursor: "pointer" }}
        >
          {loading ? "Generating..." : "Generate Deck"}
        </button>
      </div>

      {errorMsg && <p style={{ color: "#ef4444", fontWeight: "500" }}>{errorMsg}</p>}

      {flashcards.length > 0 && (
        <div>
          <p style={{ color: "#64748b", fontWeight: "600" }}>Card {currentIndex + 1} of {flashcards.length}</p>
          
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ minHeight: "200px", background: "#f8fafc", border: "2px solid #6366f1", borderRadius: "12px", padding: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", margin: "20px 0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
          >
            <h3 style={{ color: "#0f172a", fontSize: "1.25rem" }}>
              {isFlipped ? flashcards[currentIndex].a : flashcards[currentIndex].q}
            </h3>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#94a3b8" }}>Click the card to flip it</p>

          <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" }}>
            <button 
              disabled={currentIndex === 0}
              onClick={() => { setCurrentIndex(prev => prev - 1); setIsFlipped(false); }}
              style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
            >
              Previous
            </button>
            <button 
              disabled={currentIndex === flashcards.length - 1}
              onClick={() => { setCurrentIndex(prev => prev + 1); setIsFlipped(false); }}
              style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;