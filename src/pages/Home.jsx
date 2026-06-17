import { useState } from "react";
import Flashcard from "../components/Flashcard";
import "../App.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://youtube-learning-assistant.onrender.com";
function saveToHistory(topic, cards) {
  try {
    const existing = JSON.parse(localStorage.getItem("studyHistory") || "[]");
    const entry = {
      id: Date.now(),
      topic,
      date: new Date().toLocaleDateString(),
      cards,
    };
    localStorage.setItem("studyHistory", JSON.stringify([entry, ...existing]));
  } catch (e) {
    console.warn("Couldn't save session to history:", e);
  }
}

const Home = () => {
  const [inputValue, setInputValue] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [fallbackNote, setFallbackNote] = useState("");

  const handleGenerate = async () => {
    if (!inputValue.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setFallbackNote("");
    setFlashcards([]);
    setCurrentIndex(0);

    try {
      const response = await fetch(`${BACKEND_URL}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server responded with an error status.");
      }

      if (data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);

        const topicLabel =
          data.meta?.videoTitle || (inputValue.length > 60 ? `${inputValue.slice(0, 60)}…` : inputValue);
        saveToHistory(topicLabel, data.flashcards);

        if (data.meta?.source === "title") {
          setFallbackNote(
            `Heads up: captions weren't available for this video, so this deck is based on its title ("${data.meta.videoTitle}") rather than the full transcript. It may be less precise — worth a quick review.`
          );
        }
      } else {
        throw new Error("No flashcards found in the server response.");
      }
    } catch (error) {
      console.error("Frontend Generation Error:", error);
      setErrorMsg(error.message || "Failed to connect to the live AI engine. Please check your network or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="hero">
        <span className="hero-eyebrow">AI Study Deck Generator</span>
        <h1 className="hero-title">YouTube Learning Assistant</h1>
        <p className="hero-subtitle">
          Paste a YouTube link or type any topic — get an instant set of flashcards to study with.
        </p>
      </div>

      <div className="generate-row">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          placeholder="Paste YouTube link or study topic here…"
          className="input-field"
        />
        <button onClick={handleGenerate} disabled={loading} className="btn btn-primary">
          {loading && <span className="spinner" />}
          {loading ? "Generating…" : "Generate Deck"}
        </button>
      </div>

      {errorMsg && (
        <div className="banner banner-danger fade-in">⚠️ {errorMsg}</div>
      )}

      {fallbackNote && (
        <div className="banner banner-warning fade-in">ℹ️ {fallbackNote}</div>
      )}

      {loading && <div className="skeleton-card" />}

      {flashcards.length > 0 && (
        <div className="fade-in">
          <p className="deck-progress">
            Card {currentIndex + 1} of {flashcards.length}
          </p>

          <Flashcard
            key={currentIndex}
            question={flashcards[currentIndex].q}
            answer={flashcards[currentIndex].a}
          />

          <div className="deck-dots">
            {flashcards.map((_, idx) => (
              <span key={idx} className={`deck-dot ${idx === currentIndex ? "active" : ""}`} />
            ))}
          </div>
          <p className="flip-hint">Click the card to flip it</p>

          <div className="deck-nav">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="btn btn-secondary"
            >
              ← Previous
            </button>
            <button
              disabled={currentIndex === flashcards.length - 1}
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="btn btn-secondary"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;