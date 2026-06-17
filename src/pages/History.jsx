import { useState } from "react";
import Flashcard from "../components/Flashcard";
import "../App.css";

function loadHistory() {
  try {
    const savedData = localStorage.getItem("studyHistory");
    return savedData ? JSON.parse(savedData) : [];
  } catch (error) {
    console.error("Error reading localStorage:", error);
    return [];
  }
}

function History() {
  const [historyItems, setHistoryItems] = useState(loadHistory);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [currentCard, setCurrentCard] = useState(0);

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

  // Lets you try the deck viewer instantly without generating a real deck first.
  const handleAddMockSession = () => {
    const mockSession = {
      id: Date.now(),
      topic: "Cloud Computing Lecture",
      date: new Date().toLocaleDateString(),
      cards: [
        { q: "Core Definition", a: "Cloud computing delivers computing services like storage, servers, and databases over the internet." },
        { q: "Main Advantage", a: "It eliminates the upfront capital expense of buying hardware and setting up on-premise data centers." },
        { q: "Key Model", a: "Infrastructure as a Service (IaaS), Platform as a Service (PaaS), and Software as a Service (SaaS)." },
      ],
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
    if (currentCard > 0) setCurrentCard(currentCard - 1);
  };

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.9rem" }}>Study Vault</h1>
          <p style={{ margin: "6px 0 0", color: "var(--text-secondary)" }}>Review past generated decks anytime.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleAddMockSession} className="btn btn-secondary">
            + Add Test Deck
          </button>
          {historyItems.length > 0 && (
            <button onClick={handleClearHistory} className="btn btn-danger">
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="history-layout">
        <div className="history-list-col">
          <h3 style={{ margin: "0 0 4px", color: "var(--text-secondary)", fontSize: "0.95rem" }}>Saved Sessions</h3>

          {historyItems.length === 0 ? (
            <div className="history-empty">No study history yet. Generate a deck on the Home page, or add a test deck above.</div>
          ) : (
            historyItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectDeck(item)}
                className={`history-item ${selectedDeck?.id === item.id ? "active" : ""}`}
              >
                <div className="history-item-title">{item.topic}</div>
                <div className="history-item-meta">
                  <span>📅 {item.date}</span>
                  <span>📇 {item.cards?.length || 0} cards</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="history-preview-col">
          {selectedDeck && selectedDeck.cards && selectedDeck.cards.length > 0 ? (
            <div style={{ textAlign: "center" }}>
              <h3 style={{ margin: "0 0 4px" }}>Reviewing Deck</h3>
              <p className="deck-progress">
                Card {currentCard + 1} of {selectedDeck.cards.length}
              </p>

              <Flashcard
                key={`${selectedDeck.id}-${currentCard}`}
                question={selectedDeck.cards[currentCard].q}
                answer={selectedDeck.cards[currentCard].a}
              />

              <div className="deck-nav">
                <button onClick={prevCard} disabled={currentCard === 0} className="btn btn-secondary">
                  ← Prev
                </button>
                <button onClick={nextCard} disabled={currentCard === selectedDeck.cards.length - 1} className="btn btn-secondary">
                  Next →
                </button>
              </div>
            </div>
          ) : (
            <div className="history-preview-empty">Select a saved session from the left to preview its cards.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default History;