import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="main-footer" id="contact">
      <div className="footer-top-accent">
        <div className="accent-line"></div>
        <span className="accent-badge">NODE_END /// TERMINATION</span>
        <div className="accent-line"></div>
      </div>

      <div className="footer-content">
        {/* BRAND BLOCK */}
        <div className="footer-brand-block">
          <h2>
            NEX<span style={{ color: "var(--neon)" }}>SYNC</span>
          </h2>
          <p>
            Autonomous Systems & Smart Mobility R&D Node.
            <br />
            IIIT Sri City, Andhra Pradesh.
          </p>
          <div className="footer-coords">
            LAT: 13.5557° N // LONG: 80.0269° E
          </div>
        </div>

        {/* QUICK NAVIGATION */}
        <div className="footer-nav-block">
          <h4>SYSTEM DIRECTORY</h4>
          <ul>
            <li>
              <Link to="/">Home Terminal</Link>
            </li>
            <li>
              <Link to="/events">Operations & Events</Link>
            </li>
            <li>
              <Link to="/projects">System Builds</Link>
            </li>
            <li>
              <Link to="/team">Command Roster</Link>
            </li>
            <li>
              <Link to="/auth">Member Portal</Link>
            </li>
          </ul>
        </div>

        {/* CONTACT & TRANSMISSION */}
        <div className="footer-contact-block">
          <h4>TRANSMISSION LINES</h4>
          <div className="c-item">
            <span className="c-label">DIRECT EMAIL</span>
            <a href="mailto:nexsync@iiits.in" className="c-val hover-trigger">
              nexsync@iiits.in
            </a>
          </div>
          <div className="c-item">
            <span className="c-label">LAB LOCATION</span>
            <span className="c-val">Room 204, Academic Block, IIIT Sri City</span>
          </div>
          <div className="c-socials">
            <a
              href="https://www.linkedin.com/company/nexsync"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-icon hover-trigger"
              aria-label="LinkedIn"
            >
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-icon hover-trigger"
              aria-label="Instagram"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-icon hover-trigger"
              aria-label="GitHub"
            >
              <i className="fab fa-github"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-status-pill">
          <span className="status-dot"></span> SYSTEM ONLINE // V2X PROTOCOL ACTIVE
        </div>
        <p>© {new Date().getFullYear()} NexSync R&D. Built with precision for autonomous mobility.</p>
      </div>

      <style>{`
        .main-footer {
          background: #060606;
          border-top: 1px solid var(--border);
          position: relative;
          padding: 60px 5% 30px;
          margin-top: 80px;
          z-index: 10;
        }

        .footer-top-accent {
          display: flex;
          align-items: center;
          gap: 20px;
          max-width: 1400px;
          margin: 0 auto 50px;
        }

        .accent-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border), transparent);
        }

        .accent-badge {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--neon);
          letter-spacing: 2px;
          border: 1px solid var(--border-bright);
          padding: 4px 12px;
          background: rgba(209, 255, 0, 0.04);
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto 50px;
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 60px;
        }

        .footer-brand-block h2 {
          font-family: var(--font-display);
          font-size: 3.5rem;
          line-height: 1;
          margin-bottom: 12px;
        }

        .footer-brand-block p {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .footer-coords {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: #666;
          letter-spacing: 1px;
        }

        .footer-nav-block h4, .footer-contact-block h4 {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--neon);
          letter-spacing: 2px;
          margin-bottom: 20px;
          text-transform: uppercase;
        }

        .footer-nav-block ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-nav-block li a {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--text-secondary);
          transition: all 0.25s;
          display: inline-block;
        }

        .footer-nav-block li a:hover {
          color: var(--neon);
          transform: translateX(4px);
        }

        .footer-contact-block {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .c-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .c-label {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: #666;
          letter-spacing: 1px;
        }

        .c-val {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: #ccc;
          transition: color 0.25s;
        }

        .c-val:hover {
          color: var(--neon);
        }

        .c-socials {
          display: flex;
          gap: 12px;
          margin-top: 10px;
        }

        .footer-social-icon {
          width: 38px;
          height: 38px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: var(--text-secondary);
          font-size: 0.95rem;
          transition: all 0.3s;
        }

        .footer-social-icon:hover {
          color: #000;
          background: var(--neon);
          border-color: var(--neon);
          box-shadow: 0 0 15px var(--neon-glow);
          transform: translateY(-2px);
        }

        .footer-bottom {
          max-width: 1400px;
          margin: 0 auto;
          border-top: 1px solid var(--border);
          padding-top: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: #666;
        }

        .footer-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--neon);
          font-size: 0.7rem;
          letter-spacing: 1px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: var(--neon);
          border-radius: 50%;
          box-shadow: 0 0 6px var(--neon);
          animation: pulseDot 2s infinite;
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        @media (max-width: 1024px) {
          .footer-content {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 35px;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
