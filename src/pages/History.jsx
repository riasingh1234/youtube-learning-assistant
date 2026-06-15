import { useState, useEffect } from "react";
import Flashcard from "../components/Flashcard";
import "../App.css";

function History() {
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [currentCard, setCurrentCard] = useState(0);

  // Safely load history from localStorage on component mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("studyHistory");
      if (savedData) {
        setHistoryItems(JSON.parse(savedData));
      } else {
        setHistoryItems([]);
      }
    } catch (error) {
      console.error("Error reading localStorage:", error);
      setHistoryItems([]);
    }
  }, []);

  const handleSelectDeck = (deck) => {
    setSelectedDeck(deck);
    setCurrentCard(0);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to delete your entire study history?")) {
      localStorage.removeItem("studyHistory");
      setHistoryItems([]);
      setSelectedDeck(null);
    }
  };

  // HELPER FUNCTION: Adds mock data immediately so you can test without using the home page input
  const handleAddMockSession = () => {
    const mockSession = {
      id: Date.now(),
      topic: "Cloud Computing Lecture",
      date: new Date().toLocaleDateString(),
      cards: [
        { q: "Core Definition", a: "Cloud computing delivers computing services like storage, servers, and databases over the internet." },
        { q: "Main Advantage", a: "It eliminates the upfront capital expense of buying hardware and setting up on-premise data centers." },
        { q: "Key Model", a: "Infrastructure as a Service (IaaS), Platform as a Service (PaaS), and Software as a Service (SaaS)." }
      ]
    };

    const updatedHistory = [mockSession, ...historyItems];
    setHistoryItems(updatedHistory);
    localStorage.setItem("studyHistory", JSON.stringify(updatedHistory));
  };

  const nextCard = () => {
    if (selectedDeck && currentCard < selectedDeck.cards.length - 1) {
      setCurrentCard(currentCard + 1);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      
      {/* Header Container */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ margin: 0, color: "#1a202c" }}>Study Vault</h1>
          <p style={{ margin: "5px 0 0 0", color: "#718096" }}>Review past generated material anytime.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={handleAddMockSession}
            style={{ padding: "10px 16px", border: "1px solid #764ba2", color: "#764ba2", backgroundColor: "#f3ebff", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
          >
            + Quick Add Test Deck
          </button>
          {historyItems.length > 0 && (
            <button 
              onClick={handleClearHistory}
              style={{ padding: "10px 16px", border: "1px solid #e53e3e", color: "#e53e3e", backgroundColor: "transparent", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
            >
              Clear All Logs
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "30px", marginTop: "20px" }}>
        
        {/* LEFT COLUMN: LIST OF SESSIONS */}
        <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#4a5568" }}>Saved Sessions</h3>
          
          {historyItems.length === 0 ? (
            <div style={{ padding: "20px", border: "1px dashed #cbd5e0", borderRadius: "12px", backgroundColor: "#f7fafc", color: "#a0aec0", fontStyle: "italic", textAlign: "center" }}>
              No study history found yet. Click "+ Quick Add Test Deck" above to test it instantly!
            </div>
          ) : (
            historyItems.map((item) => (
              <div 
                key={item.id}
                onClick={() => handleSelectDeck(item)}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: selectedDeck?.id === item.id ? "2px solid #764ba2" : "1px solid #e2e8f0",
                  backgroundColor: selectedDeck?.id === item.id ? "#f3ebff" : "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ fontWeight: "600", color: "#2d3748", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {item.topic}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#718096", marginTop: "6px", display: "flex", justifyContent: "space-between" }}>
                  <span>📅 {item.date}</span>
                  <span>📇 {item.cards?.length || 0} Cards</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT COLUMN: REVIEWS VISUALIZER CARD */}
        <div style={{ flex: "1.5", borderLeft: "1px solid #edf2f7", paddingLeft: "30px" }}>
          {selectedDeck && selectedDeck.cards && selectedDeck.cards.length > 0 ? (
            <div style={{ textAlign: "center" }}>
              <h3 style={{ color: "#2d3748", marginBottom: "4px" }}>Reviewing Deck</h3>
              <p style={{ color: "#718096", margin: "0 0 20px 0", fontSize: "0.9rem" }}>
                Card {currentCard + 1} of {selectedDeck.cards.length}
              </p>

              <Flashcard 
                key={`${selectedDeck.id}-${currentCard}`}
                question={selectedDeck.cards[currentCard].q}
                answer={selectedDeck.cards[currentCard].a}
              />

              <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "24px" }}>
                <button 
                  onClick={prevCard} 
                  disabled={currentCard === 0}
                  style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #cbd5e0", backgroundColor: currentCard === 0 ? "#edf2f7" : "#ffffff", color: currentCard === 0 ? "#a0aec0" : "#4a5568", fontWeight: "600", cursor: currentCard === 0 ? "not-allowed" : "pointer" }}
                >
                  ← Prev
                </button>
                <button 
                  onClick={nextCard} 
                  disabled={currentCard === selectedDeck.cards.length - 1}
                  style={{ padding: "10px 18px", borderRadius: "8px", border: "none", backgroundColor: currentCard === selectedDeck.cards.length - 1 ? "#e2e8f0" : "#764ba2", color: currentCard === selectedDeck.cards.length - 1 ? "#a0aec0" : "#ffffff", fontWeight: "600", cursor: currentCard === selectedDeck.cards.length - 1 ? "not-allowed" : "pointer" }}
                >
                  Next →
                </button>
              </div>
            </div>
          ) : (
            <div style={{ height: "100%", minHeight: "250px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #e2e8f0", borderRadius: "16px", padding: "40px", color: "#a0aec0", textAlign: "center" }}>
              Select a saved session from the left column to preview cards.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default History;