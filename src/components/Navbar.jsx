import { Link } from "react-router-dom";

function Navbar() {
  const navStyle = {
    padding: "16px 24px",
    display: "flex",
    gap: "24px",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    fontFamily: "sans-serif",
    fontWeight: "600"
  };

  const linkStyle = {
    color: "#4a5568",
    textDecoration: "none",
    transition: "color 0.2s"
  };

  return (
    <nav style={navStyle}>
      <Link to="/" style={linkStyle}>Home</Link>
      <Link to="/quiz" style={linkStyle}>Quiz</Link>
      <Link to="/chat" style={linkStyle}>Chat</Link>
      <Link to="/history" style={linkStyle}>History</Link>
    </nav>
  );
}

export default Navbar;