import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await register(form);
      window.alert("Registration successful. Please login.");
      navigate("/login");
    } catch (err) {
      window.alert(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page container auth-shell">
      <form className="panel auth-panel auth-card" onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <p>Create your user account</p>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          minLength={6}
          required
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>
        <p>
          Have an account? <Link to="/login" className="btn-link">Login</Link>
        </p>
      </form>
    </section>
  );
}
