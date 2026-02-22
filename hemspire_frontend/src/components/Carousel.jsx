import { useEffect, useState } from "react";

export default function Carousel() {
  const slides = [
    {
      title: "Petals Of Poetry",
      caption: "Tamil lines for calm dawns and moonlit reflections.",
      image: "/carousal1.jpg",
    },
    {
      title: "Rhythm Of Heart",
      caption: "Image, audio and video poems from lived emotions.",
      image: "/carousal2.jpg",
    },
    {
      title: "Hemspire Signature",
      caption: "A personal collection of voice, feeling and imagination.",
      image: "/carousal3.jpg",
    },
    {
      title: "Echoes Of Light",
      caption: "Crafted verses that turn memories into timeless lines.",
      image: "/carousal4.jpg",
    },
  ];

  const [index, setIndex] = useState(0);
  const total = slides.length;

  const activeSlide = slides[index];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 3500);

    return () => clearInterval(timer);
  }, [total]);

  const goPrev = () => setIndex((prev) => (prev - 1 + total) % total);
  const goNext = () => setIndex((prev) => (prev + 1) % total);

  return (
    <section className="hero-carousel" aria-label="Featured poetry carousel">
      <article
        className="hero-card hero-card-carousel"
        style={{
          backgroundImage: `linear-gradient(rgba(34, 12, 30, 0.46), rgba(34, 12, 30, 0.46)), url(${activeSlide.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h3>{activeSlide.title}</h3>
        <p>{activeSlide.caption}</p>
      </article>

      <button type="button" className="hero-nav hero-nav-prev" onClick={goPrev} aria-label="Previous slide">
        &#8249;
      </button>
      <button type="button" className="hero-nav hero-nav-next" onClick={goNext} aria-label="Next slide">
        &#8250;
      </button>

      <div className="hero-dots">
        {slides.map((slide, dotIndex) => (
          <button
            key={slide.title}
            type="button"
            className={`hero-dot ${dotIndex === index ? "active" : ""}`}
            aria-label={`Go to ${slide.title}`}
            onClick={() => setIndex(dotIndex)}
          />
        ))}
      </div>
    </section>
  );
}
