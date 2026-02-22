import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitContact } from "../api/contactApi";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await submitContact(form);
      window.alert("Message sent successfully");
      setForm({ name: "", email: "", subject: "", message: "" });
      navigate("/");
    } catch (err) {
      window.alert(err.message || "Unable to submit contact form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page container contact-page">
      <div className="page-heading">
        <h1>Contact</h1>
        <p>Send your feedback, collaboration ideas or questions.</p>
      </div>

      <div className="contact-layout">
        <article className="panel contact-card">
          <form className="form-stack contact-form-panel" onSubmit={handleSubmit}>
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
              type="text"
              placeholder="Subject"
              value={form.subject}
              onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
              required
            />
            <textarea
              rows="5"
              placeholder="Message"
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              required
            />
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Submit"}
            </button>
          </form>

          <aside className="contact-visual" aria-hidden="true">
            <img src="/contact-image.png" alt="Contact Hemspire" />
          </aside>
        </article>
      </div>
    </section>
  );
}
