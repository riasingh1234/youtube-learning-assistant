import { useState } from "react";
import Flashcard from "../components/Flashcard"; 
import "../App.css"; 

function Home() {
  const [url, setUrl] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    if (!url.trim()) return;
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:5000/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: url }),
      });

      const data = await response.json();

      if (!data || !data.flashcards) {
        alert("No structured flashcards returned from the server.");
        setLoading(false);
        return;
      }

      setFlashcards(data.flashcards);
      setCurrentCard(0);

      // Save to localStorage for History tab tracking
      const existingHistory = JSON.parse(localStorage.getItem("studyHistory")) || [];
      const newHistoryItem = {
        id: Date.now(),
        topic: url,
        date: new Date().toLocaleDateString(),
        cards: data.flashcards
      };
      localStorage.setItem("studyHistory", JSON.stringify([newHistoryItem, ...existingHistory]));

    } catch (error) {
      console.log("Error fetching summary:", error);
      alert("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#1a202c", marginBottom: "10px" }}>
        YouTube Learning Assistant
      </h1>
      <p style={{ textAlign: "center", color: "#718096", marginBottom: "30px" }}>
        Convert video lectures into smart, interactive study decks instantly.
      </p>

      <div style={{ display: "flex", gap: "12px", marginBottom: "40px" }}>
        <input
          type="text"
          placeholder="Paste YouTube Link or Topic Here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "10px",
            border: "2px solid #e2e8f0",
            fontSize: "1rem",
            outline: "none"
          }}
        />
        <button
          onClick={generateSummary}
          disabled={loading}
          style={{
            padding: "12px 24px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: loading ? "#a0aec0" : "#764ba2",
            color: "#ffffff",
            fontWeight: "600",
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Generating..." : "Generate Deck"}
        </button>
      </div>

      {flashcards.length > 0 && (
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#718096", fontWeight: "500" }}>
            Card {currentCard + 1} of {flashcards.length}
          </p>

          <Flashcard 
            key={currentCard} 
            question={flashcards[currentCard].q} 
            answer={flashcards[currentCard].a} 
          />

          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "24px" }}>
            <button 
              onClick={prevCard} 
              disabled={currentCard === 0}
              style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #cbd5e0", backgroundColor: currentCard === 0 ? "#edf2f7" : "#ffffff", color: currentCard === 0 ? "#a0aec0" : "#4a5568", fontWeight: "600", cursor: currentCard === 0 ? "not-allowed" : "pointer" }}
            >
              ← Previous
            </button>
            <button 
              onClick={nextCard} 
              disabled={currentCard === flashcards.length - 1}
              style={{ padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: currentCard === flashcards.length - 1 ? "#e2e8f0" : "#764ba2", color: currentCard === flashcards.length - 1 ? "#a0aec0" : "#ffffff", fontWeight: "600", cursor: currentCard === flashcards.length - 1 ? "not-allowed" : "pointer" }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;