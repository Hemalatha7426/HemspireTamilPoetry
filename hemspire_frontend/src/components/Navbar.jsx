import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { NAV_LINKS } from "../utils/constants";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoFailed, setLogoFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

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

        <button
          type="button"
          className="nav-toggle btn ghost small"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-controls="site-nav-links"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        <div id="site-nav-links" className={`nav-links ${menuOpen ? "open" : ""}`}>
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
