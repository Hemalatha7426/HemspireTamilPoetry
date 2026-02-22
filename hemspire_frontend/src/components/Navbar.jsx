import { NavLink, useNavigate } from "react-router-dom";
import { NAV_LINKS } from "../utils/constants";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useState } from "react";

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [logoFailed, setLogoFailed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="top-nav-wrap">
      <nav className="top-nav container">
        <NavLink to="/" className="brand">
          {!logoFailed ? (
            <img
              src="/hemspire-logo.png"
              alt="Hemspire Poems"
              className="brand-logo"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <>
              <span className="brand-mark" aria-hidden="true">H</span>
              <span className="brand-text">Hemspire</span>
            </>
          )}
        </NavLink>

        <div className="nav-links">
          {NAV_LINKS.map((item) => (
            <NavLink key={item.path} to={item.path} className="nav-link">
              {item.label}
            </NavLink>
          ))}

          {isAuthenticated && (
            <>
              <NavLink to="/profile" className="nav-link">
                Profile
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className="nav-link">
                  Admin
                </NavLink>
              )}
              <button className="btn ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <NavLink to="/login" className="nav-link">
                Login
              </NavLink>
              <NavLink to="/register" className="btn small">
                Register
              </NavLink>
            </>
          )}

          <button className="btn ghost small" onClick={toggleTheme}>
            {theme === "light" ? "Dark" : "Light"}
          </button>
        </div>
      </nav>
    </header>
  );
}
