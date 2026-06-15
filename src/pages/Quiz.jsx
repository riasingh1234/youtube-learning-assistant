import { useState } from "react";
import "../App.css";

function Quiz() {
  const [topic, setTopic] = useState("");
  const [quizDeck, setQuizDeck] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const generateQuiz = async () => {
    if (!topic.trim()) return alert("Please enter a topic!");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await response.json();
      setQuizDeck(data.quiz);
      setScore(0);
      setCurrentQuestion(0);
      setQuizFinished(false);
    } catch (err) {
      alert("Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (selectedOption === quizDeck[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    if (currentQuestion < quizDeck.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
    }
  };

  if (quizFinished) {
    return (
      <div className="quiz-container" style={{ textAlign: "center" }}>
        <h2>Quiz Completed! 🎉</h2>
        <p>Score: {score} / {quizDeck.length}</p>
        <button onClick={() => setQuizDeck([])} style={{ padding: "10px 20px", background: "#764ba2", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
          New Topic
        </button>
      </div>
    );
  }

  // Input view if no quiz is loaded
  if (quizDeck.length === 0) {
    return (
      <div className="quiz-container">
        <h2>Generate AI Quiz</h2>
        <input 
          value={topic} 
          onChange={(e) => setTopic(e.target.value)} 
          placeholder="Enter topic (e.g. Machine Learning)"
          style={{ width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <button onClick={generateQuiz} disabled={loading} style={{ width: "100%", padding: "12px", background: "#764ba2", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
          {loading ? "Generating..." : "Generate Quiz"}
        </button>
      </div>
    );
  }

  // Active quiz view
  return (
    <div className="quiz-container">
      <h3>{quizDeck[currentQuestion].question}</h3>
      <div className="options-list">
        {quizDeck[currentQuestion].options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedOption(idx)}
            className={`option-btn ${selectedOption === idx ? "selected" : ""}`}
          >
            {option}
          </button>
        ))}
      </div>
      <button onClick={handleNextQuestion} disabled={selectedOption === null} style={{ width: "100%", marginTop: "20px", padding: "12px", background: selectedOption === null ? "#ccc" : "#764ba2", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
        {currentQuestion === quizDeck.length - 1 ? "Finish" : "Next →"}
      </button>
    </div>
  );
}

export default Quiz;