import { useState } from "react";

function Flashcard({ question, answer }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className={`flashcard-container ${isFlipped ? 'is-flipped' : ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ minHeight: '280px', cursor: 'pointer' }} // Direct fallback height
    >
      <div className="flashcard-inner">
        
        {/* FRONT SIDE (Question) */}
        <div className="flashcard-front">
          <span className="card-label">🤔 Key Concept / Question</span>
          <p style={{ fontSize: '1.2rem', fontWeight: '600', lineHeight: '1.5', margin: 0 }}>
            {question || "No question provided"}
          </p>
          <span style={{ fontSize: '0.8rem', marginTop: 'auto', opacity: '0.7' }}>
            Click to reveal details
          </span>
        </div>

        {/* BACK SIDE (Answer) */}
        <div className="flashcard-back">
          <span className="card-label" style={{ color: '#764ba2' }}>💡 Explanation</span>
          <p style={{ fontSize: '1.05rem', fontWeight: '500', lineHeight: '1.6', margin: 0 }}>
            {answer || "No explanation provided"}
          </p>
          <span style={{ fontSize: '0.8rem', marginTop: 'auto', color: '#a0aec0' }}>
            Click to flip back
          </span>
        </div>

      </div>
    </div>
  );
}

export default Flashcard;