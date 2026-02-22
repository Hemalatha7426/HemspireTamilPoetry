import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Carousel from "../components/Carousel";
import { poemApi } from "../api/mediaApi";
import { formatDate, resolveMediaUrl } from "../utils/helpers";
import "./HomePage.css";

export default function HomePage() {
  const [poems, setPoems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function run() {
      try {
        const result = await poemApi.getAll();
        setPoems(Array.isArray(result) ? result : []);
      } catch (err) {
        setError(err.message || "Unable to load poems.");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return poems;
    return poems.filter((item) =>
      item.title.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [poems, search]);

  const featuredPoems = useMemo(
    () =>
      [...filtered]
        .sort((a, b) => Number(b.likes || 0) - Number(a.likes || 0))
        .slice(0, 6),
    [filtered]
  );

  const recentPoems = useMemo(
    () =>
      [...poems]
        .sort((a, b) => new Date(b.uploadDate || 0) - new Date(a.uploadDate || 0))
        .slice(0, 6),
    [poems]
  );

  return (
    <div className="home-page">
      <section className="page container">
        <div className="page-heading">
          <h1>Hemspire Tamil Poetry</h1>
          <p>Poems in image, audio and video crafted from your journey.</p>
        </div>

        <Carousel />

        <form className="search-row search-section" onSubmit={(event) => event.preventDefault()}>
          <input
            type="text"
            placeholder="Search featured poems"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </form>

        <div className="section-row section-header">
          <h2>Featured Poems</h2>
          <Link to="/poems" className="btn small">
            View More
          </Link>
        </div>

        {error && <p className="error-text">{error}</p>}
        {loading && <p>Loading...</p>}
        {!loading && (
          <>
            <div className="media-grid">
              {featuredPoems.length === 0 && <p>No poems found.</p>}
              {featuredPoems.map((poem) => (
                <article className="media-card" key={poem.id}>
                  <img src={resolveMediaUrl(poem.imagePath)} alt={poem.title} className="media-thumb" />
                  <div className="media-meta">
                    <h3>{poem.title}</h3>
                    <p>{poem.description}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="section-row section-header home-recent-header">
              <h2>Recently Uploaded</h2>
              <Link to="/poems" className="btn small">
                View More
              </Link>
            </div>

            <div className="media-grid">
              {recentPoems.length === 0 && <p>No recent uploads.</p>}
              {recentPoems.map((poem) => (
                <article className="media-card" key={`recent-${poem.id}`}>
                  <img src={resolveMediaUrl(poem.imagePath)} alt={poem.title} className="media-thumb" />
                  <div className="media-meta">
                    <h3>{poem.title}</h3>
                    <p>{poem.description}</p>
                    <div className="home-recent-meta">
                      <span>{formatDate(poem.uploadDate)}</span>
                      <span>Likes: {poem.likes || 0}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <footer className="home-footer">
        <div className="container home-footer-inner">
          <div className="home-footer-copy-row">
            <img src="/hemspire-logo.png" alt="Hemspire logo" />
            <p className="home-footer-copy">Copyright 2026 Hemspire. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
