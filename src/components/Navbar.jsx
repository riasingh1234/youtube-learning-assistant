import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/quiz", label: "Quiz" },
  { to: "/chat", label: "Chat" },
  { to: "/history", label: "History" },
];

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-brand-icon">🎓</span>
        StudyBuddy
      </Link>

      <div className="navbar-links">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`nav-link ${location.pathname === item.to ? "active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;