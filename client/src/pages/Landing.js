import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Landing.css';

const FEATURES = [
  { emoji: '📊', title: 'Track Everything', desc: 'Log expenses in seconds with smart categories and natural language input.' },
  { emoji: '🧠', title: 'Smart Insights', desc: 'Get smart weekly and monthly insights that tell the story behind your money.' },
  { emoji: '🎯', title: 'Set Goals', desc: 'Create savings goals and watch your progress with beautiful visual trackers.' },
  { emoji: '❤️', title: 'Health Score', desc: 'Know your financial health at a glance with a personalized 0–100 score.' },
];

function Landing() {
  const { toggleTheme, isDark } = useTheme();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 92, 255, ${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="landing">
      {/* Canvas background */}
      <canvas ref={canvasRef} className="landing-canvas" />

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="landing-logo-icon">F</div>
          <span className="landing-logo-name">Finzee</span>
        </div>
        <div className="landing-nav-actions">
          <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
            {isDark ? '☀️' : '🌙'}
          </button>
          <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-badge">✨ Smart Personal Finance</div>
        <h1 className="hero-title">
          Your wallet has<br />
          <span className="hero-gradient">a story.</span><br />
          We tell it.
        </h1>
        <p className="hero-desc">
          Know where your money goes — before it's gone.
        </p>
        <div className="hero-cta">
          <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
          
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-num">10K+</span>
            <span className="hero-stat-label">Users Tracking</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-num">₹2Cr+</span>
            <span className="hero-stat-label">Expenses Logged</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-num">4.9★</span>
            <span className="hero-stat-label">User Rating</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <div className="features-label">WHAT WE OFFER</div>
        <h2 className="features-title">Everything you need to<br />master your money</h2>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-emoji">{f.emoji}</div>
              <h3 className="feature-name">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="landing-cta-section">
        <div className="cta-card">
          <h2>Start your financial story today</h2>
          <p>Free forever. No credit card required.</p>
          <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-logo">
          <div className="landing-logo-icon" style={{ width: 28, height: 28, fontSize: '0.9rem' }}>F</div>
          <span>Finzee</span>
        </div>
        <p className="footer-copy">© 2026 Finzee. Your wallet's best friend.</p>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
}

export default Landing;