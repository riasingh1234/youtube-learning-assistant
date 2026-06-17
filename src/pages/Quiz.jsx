import { useState } from "react";
import "../App.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://youtube-learning-assistant.onrender.com";
function Quiz() {
  const [topic, setTopic] = useState("");
  const [quizDeck, setQuizDeck] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const generateQuiz = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch(`${BACKEND_URL}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate quiz");

      setQuizDeck(data.quiz);
      setScore(0);
      setCurrentQuestion(0);
      setQuizFinished(false);
      setSelectedOption(null);
    } catch (err) {
      setErrorMsg(err.message || "Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (idx) => {
    if (selectedOption !== null) return; // lock after first pick
    setSelectedOption(idx);
    if (idx === quizDeck[currentQuestion].correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizDeck.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
    }
  };

  const optionClass = (idx) => {
    const q = quizDeck[currentQuestion];
    if (selectedOption === null) return "option-btn";
    if (idx === q.correctAnswer) return "option-btn correct";
    if (idx === selectedOption) return "option-btn incorrect";
    return "option-btn";
  };

  if (quizFinished) {
    return (
      <div className="page page-narrow">
        <div className="quiz-container fade-in" style={{ textAlign: "center" }}>
          <div className="score-circle">
            {score}/{quizDeck.length}
          </div>
          <h2 style={{ margin: "0 0 6px" }}>Quiz Completed 🎉</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
            {score === quizDeck.length
              ? "Perfect score — nice work!"
              : "Review the topic and try again to improve your score."}
          </p>
          <button onClick={() => setQuizDeck([])} className="btn btn-primary">
            New Topic
          </button>
        </div>
      </div>
    );
  }

  if (quizDeck.length === 0) {
    return (
      <div className="page page-narrow">
        <div className="hero">
          <span className="hero-eyebrow">Test Yourself</span>
          <h1 className="hero-title" style={{ fontSize: "1.9rem" }}>
            Generate an AI Quiz
          </h1>
          <p className="hero-subtitle">Type a topic and get a 5-question multiple-choice quiz instantly.</p>
        </div>

        <div className="quiz-container">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generateQuiz()}
            placeholder="Enter topic (e.g. Machine Learning)"
            className="input-field"
            style={{ marginBottom: "14px" }}
          />
          <button onClick={generateQuiz} disabled={loading} className="btn btn-primary" style={{ width: "100%" }}>
            {loading && <span className="spinner" />}
            {loading ? "Generating…" : "Generate Quiz"}
          </button>
          {errorMsg && <div className="banner banner-danger fade-in">⚠️ {errorMsg}</div>}
        </div>
      </div>
    );
  }

  const progressPct = ((currentQuestion + (selectedOption !== null ? 1 : 0)) / quizDeck.length) * 100;

  return (
    <div className="page page-narrow">
      <div className="quiz-container fade-in">
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="deck-progress">
          Question {currentQuestion + 1} of {quizDeck.length}
        </p>
        <h3 className="quiz-question">{quizDeck[currentQuestion].question}</h3>

        <div className="options-list">
          {quizDeck[currentQuestion].options.map((option, idx) => (
            <button key={idx} onClick={() => handleSelect(idx)} disabled={selectedOption !== null} className={optionClass(idx)}>
              {option}
              {selectedOption !== null && idx === quizDeck[currentQuestion].correctAnswer && <span>✓</span>}
              {selectedOption === idx && idx !== quizDeck[currentQuestion].correctAnswer && <span>✕</span>}
            </button>
          ))}
        </div>

        <button onClick={handleNextQuestion} disabled={selectedOption === null} className="btn btn-primary" style={{ width: "100%" }}>
          {currentQuestion === quizDeck.length - 1 ? "Finish" : "Next →"}
        </button>
      </div>
    </div>
  );
}

export default Quiz;