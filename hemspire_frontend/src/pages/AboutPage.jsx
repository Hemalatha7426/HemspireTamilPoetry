import React, { useEffect } from "react";
import "./AboutPage.css";

export default function AboutPage() {
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const onScroll = () => {
      reveals.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 70) el.classList.add("revealed");
      });
    };
    window.addEventListener("scroll", onScroll);
    onScroll();

    function spawnPetal() {
      const p = document.createElement("span");
      p.className = "petal";
      const left = Math.random() * 100;
      const time = 8 + Math.random() * 8;
      const drift = (Math.random() < 0.5 ? -1 : 1) * (30 + Math.random() * 60);
      p.style.left = left + "vw";
      p.style.animationDuration = time + "s";
      p.style.setProperty("--dx", drift + "px");
      document.body.appendChild(p);
      setTimeout(() => p.remove(), time * 1000);
    }

    function startPetals() {
      for (let i = 0; i < 10; i++) setTimeout(spawnPetal, i * 400);
      const interval = setInterval(spawnPetal, 1200);
      return interval;
    }

    const petalInterval = startPetals();

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearInterval(petalInterval);
    };
  }, []);

  return (
    <div className="about-wrapper">
      <section className="about-page section-py">
        <div className="about-content reveal">
          <h2>Our Story</h2>
          <p>
            <b>Hemspire Poems</b> is a space where words carry emotions, stories, and inspiration.
            Our poems are available as <b>text, audio, and video</b>, letting readers experience
            them in multiple ways.
          </p>
          <p>
            Our goal is to create a lasting impact through words to inspire people to write,
            express themselves, and carry the beauty of poetry to the next generation.
          </p>
          <p>
            Every poem on Hemspire is crafted to spark reflection, positivity, and connection.
            We believe that words have the power to heal, motivate, and ignite creativity in every heart.
          </p>
          <p>
            We invite you to explore our collection, connect with the poems, and share your own voice.
            If you have any questions or would like to submit your creations, please
            <a href="/contact" className="link"> contact us</a>. We'd love to hear from you.
          </p>
        </div>

        <div className="about-image reveal">
          <img src="/about-image.png" alt="About Hemspire" />
        </div>
      </section>

      <section className="creator-section section-py">
        <div className="about-image reveal">
          <img src="/creator-image.png" alt="Creator" />
        </div>
        <div className="about-content reveal">
          <h2>Meet the Creator</h2>
          <p>
            Hi, I'm the soul behind <b>Hemspire Poems</b>. I'm an IT student with a deep passion
            for writing my own poems. Writing has always been my way to express emotions, reflect,
            and inspire others through words.
          </p>
          <h3>From Passion to Profession</h3>
          <p>
            What began as scribbles in my notebook grew into <b>Hemspire</b>, a heartfelt project
            where I combined my passion for poetry with my love for technology. Today, Hemspire
            continues to inspire, motivate, and connect people, encouraging everyone to explore and
            share their own words.
          </p>
        </div>
      </section>

      <section className="submit section-py reveal">
        <h2>Share Your Voice</h2>
        <div className="submit-grid">
          <div className="dos">
            <h4>Do</h4>
            <ul>
              <li>Send original and heartfelt work.</li>
              <li>Keep it simple and expressive.</li>
              <li>Include 2-3 lines describing your poem.</li>
            </ul>
          </div>
          <div className="donts">
            <h4>Don't</h4>
            <ul>
              <li>Plagiarize or copy others' work.</li>
              <li>Submit hateful or explicit content.</li>
              <li>Spam multiple submissions at once.</li>
            </ul>
          </div>
        </div>
        <a href="/contact" className="btn-pill submit-cta">
          Submit a Poem
        </a>
      </section>

      <section className="faq section-py reveal">
        <h2>FAQs</h2>
        <div className="faq-container">
          <div className="faq-left">
            <details>
              <summary>Can I submit poems in Tamil or English?</summary>
              <p>Yes. We welcome both Tamil and English poems. Keep them honest and simple.</p>
            </details>

            <details>
              <summary>Do I retain rights to my poem?</summary>
              <p>You always keep your rights. Hemspire only displays your poem with proper credit.</p>
            </details>

            <details>
              <summary>Can I request a custom poem?</summary>
              <p>Of course. Contact us with your theme or occasion and we love personal creations.</p>
            </details>

            <details>
              <summary>Do you accept collaborations?</summary>
              <p>Yes. If you're a writer or artist, reach out via our Contact page.</p>
            </details>
          </div>

          <div className="faq-right">
            <details>
              <summary>Can I share Hemspire poems on social media?</summary>
              <p>Yes, just give credit to Hemspire. We encourage sharing positive art widely.</p>
            </details>

            <details>
              <summary>Do you offer feedback on submitted poems?</summary>
              <p>We do. Selected poems get personalized feedback before publication.</p>
            </details>

            <details>
              <summary>Can I delete my published poem later?</summary>
              <p>Yes, just contact us anytime and we'll respectfully remove it.</p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
