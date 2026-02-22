import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await login({ email, password });
      if ((result.role || "").includes("ADMIN")) {
        navigate("/admin", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      window.alert(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page container auth-shell">
      <form className="panel auth-panel auth-card" onSubmit={handleSubmit}>
        <h1>Welcome Back</h1>
        <p>Access your Hemspire account</p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
        <p>
          New user? <Link to="/register" className="btn-link">Register</Link>
        </p>
      </form>
    </section>
  );
}
