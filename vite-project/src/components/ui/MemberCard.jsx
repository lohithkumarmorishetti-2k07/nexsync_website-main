import React from "react";
import { getDomainLabel } from "@/constants/teamConstants";
import { formatImageUrl, getDriveFallbackUrl } from "@/utils/imageUrl";

/**
 * Generates an SVG data URI avatar based on member name initials and status.
 * Serves as an instant, zero-network-dependency offline fallback.
 */
const getInitialsAvatar = (name, isAlumni) => {
  const initials = (name || "Member")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const accentColor = isAlumni ? "#c084fc" : "#d1ff00";
  const accentGlow = isAlumni ? "rgba(192, 132, 252, 0.15)" : "rgba(209, 255, 0, 0.15)";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 380" width="320" height="380">
    <rect width="320" height="380" fill="#080808"/>
    <defs>
      <linearGradient id="cyberBg_${initials}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141414"/>
        <stop offset="100%" stop-color="#050505"/>
      </linearGradient>
    </defs>
    <rect width="320" height="380" fill="url(#cyberBg_${initials})"/>
    <circle cx="160" cy="135" r="56" fill="#141414" stroke="${accentColor}" stroke-width="1.5" stroke-opacity="0.4"/>
    <path d="M85 285 C85 215 125 195 160 195 C195 195 235 215 235 285 Z" fill="#141414" stroke="${accentColor}" stroke-width="1.5" stroke-opacity="0.4"/>
    <rect x="110" y="315" width="100" height="26" rx="3" fill="${accentGlow}" stroke="${accentColor}" stroke-width="1" stroke-opacity="0.4"/>
    <text x="160" y="333" fill="${accentColor}" font-family="monospace" font-size="14" font-weight="bold" letter-spacing="3" text-anchor="middle">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const MemberCard = ({ member }) => {
  if (!member) return null;

  const linkedInUrl = member.linkedinUrl || member.linkedIn;
  const githubUrl = member.githubUrl;
  const portfolioUrl = member.portfolioUrl;
  const rawImage = member.image || member.imgUrl || "";
  const imageUrl = formatImageUrl(rawImage);
  const name = member.name || "Member";
  const isAlumni = Boolean(member.isAlumni);
  const domainDisplay = getDomainLabel(member.domain) || member.wing || "Autonomous Systems";
  const fallbackAvatar = getInitialsAvatar(name, isAlumni);

  return (
    <div className={`member-card-wrapper hover-lift hover-trigger ${isAlumni ? "card-alumni" : "card-active"}`}>
      <div className="member-card">
        <div className="member-visual">
          <img
            src={imageUrl || fallbackAvatar}
            alt={name}
            loading="lazy"
            onError={(e) => {
              const driveFallback = getDriveFallbackUrl(rawImage);
              if (driveFallback && e.target.src !== driveFallback) {
                e.target.src = driveFallback;
              } else {
                e.target.onerror = null;
                e.target.src = fallbackAvatar;
              }
            }}
          />
          <div className="visual-scanline"></div>
          <div className="visual-gradient-vignette"></div>

          {/* Domain overlay chip */}
          <span className="visual-type-badge">{domainDisplay}</span>

          {/* Status overlay badge */}
          <span className={`visual-status-pill ${isAlumni ? "pill-alumni" : "pill-active"}`}>
            {isAlumni ? "ALUMNI" : "ACTIVE"}
          </span>
        </div>

        <div className="member-info">
          <div className="member-info-top">
            <h4 className="member-name">{name}</h4>

            {isAlumni ? (
              <div className="member-meta-row">
                <span className="status-alumni-badge">
                  <i className="fas fa-graduation-cap"></i> {member.role || "Alumni"}
                </span>
                <span className="domain-sub-label">{domainDisplay}</span>
              </div>
            ) : (
              <div className="member-meta-row">
                <span className="member-type-badge">
                  {member.role || member.memberType || "Present Member"}
                </span>
                <span className="domain-sub-label">{domainDisplay}</span>
              </div>
            )}
          </div>

          {/* Social and Contact Links */}
          <div className="member-social-links">
            {linkedInUrl && (
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label={`${name} LinkedIn`}
              >
                <i className="fab fa-linkedin"></i>
              </a>
            )}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label={`${name} GitHub`}
              >
                <i className="fab fa-github"></i>
              </a>
            )}
            {portfolioUrl && (
              <a
                href={portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label={`${name} Portfolio`}
              >
                <i className="fas fa-globe"></i>
              </a>
            )}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="social-icon-btn"
                aria-label={`Email ${name}`}
              >
                <i className="fas fa-envelope"></i>
              </a>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .member-card-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          min-width: 0;
        }

        .member-card {
          background: #050505;
          border: 1px solid var(--border);
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .card-active .member-card:hover {
          border-color: var(--neon);
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7), 0 0 20px rgba(209, 255, 0, 0.15);
        }

        .card-alumni .member-card:hover {
          border-color: #c084fc;
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7), 0 0 20px rgba(192, 132, 252, 0.15);
        }

        .member-visual {
          height: 330px;
          width: 100%;
          position: relative;
          overflow: hidden;
          background: #080808;
          flex-shrink: 0;
        }

        .member-visual img {
          width: 100%;
          height: 100%;
          max-width: 100%;
          object-fit: cover;
          object-position: center 20%;
          display: block;
          filter: grayscale(100%) sepia(80%) hue-rotate(80deg) brightness(0.8) contrast(1.2);
          opacity: 0.85;
          transition: all 0.5s ease-out;
          transform: scale(1.0);
        }

        .card-alumni .member-visual img {
          filter: grayscale(100%) brightness(0.85) contrast(1.1);
        }

        .member-card:hover .member-visual img {
          filter: grayscale(0%) sepia(0%) brightness(1.05) contrast(1);
          opacity: 1;
          transform: scale(1.06);
        }

        .visual-gradient-vignette {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 60px;
          background: linear-gradient(to top, rgba(5, 5, 5, 0.85) 0%, rgba(5, 5, 5, 0) 100%);
          pointer-events: none;
          z-index: 3;
        }

        .visual-type-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(0, 0, 0, 0.88);
          color: var(--neon);
          font-family: var(--font-mono);
          font-size: 0.65rem;
          padding: 3px 8px;
          border: 1px solid rgba(209, 255, 0, 0.3);
          border-radius: 2px;
          letter-spacing: 1px;
          text-transform: uppercase;
          z-index: 4;
          max-width: calc(100% - 24px);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-alumni .visual-type-badge {
          color: #c084fc;
          border-color: rgba(192, 132, 252, 0.35);
        }

        .visual-status-pill {
          position: absolute;
          top: 12px;
          right: 12px;
          font-family: var(--font-mono);
          font-size: 0.6rem;
          padding: 2px 7px;
          border-radius: 2px;
          letter-spacing: 1px;
          font-weight: 700;
          z-index: 4;
          text-transform: uppercase;
        }

        .pill-active {
          background: rgba(209, 255, 0, 0.15);
          color: var(--neon);
          border: 1px solid rgba(209, 255, 0, 0.4);
        }

        .pill-alumni {
          background: rgba(192, 132, 252, 0.15);
          color: #c084fc;
          border: 1px solid rgba(192, 132, 252, 0.4);
        }

        .visual-scanline {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.5) 51%);
          background-size: 100% 4px;
          pointer-events: none;
          z-index: 2;
          opacity: 0.3;
        }

        .member-visual::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
          transform: skewX(-25deg);
          transition: 0s;
          pointer-events: none;
          z-index: 3;
        }

        .member-card:hover .member-visual::after {
          left: 200%;
          transition: 0.6s ease-in-out;
        }

        .member-info {
          padding: 14px 18px 16px;
          background: var(--surface);
          border-top: 1px solid var(--border);
          position: relative;
          z-index: 5;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: background 0.3s;
          min-height: 0;
        }

        .card-active .member-card:hover .member-info {
          background: #080808;
          border-top-color: var(--neon);
        }

        .card-alumni .member-card:hover .member-info {
          background: #080808;
          border-top-color: #c084fc;
        }

        .member-name {
          font-family: var(--font-display);
          font-size: 1.3rem;
          line-height: 1.15;
          color: #ffffff;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          transition: color 0.3s;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-break: break-word;
        }

        .card-active .member-card:hover .member-name {
          color: var(--neon);
        }

        .card-alumni .member-card:hover .member-name {
          color: #c084fc;
        }

        .member-meta-row {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 6px;
        }

        .member-type-badge {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--neon);
          letter-spacing: 0.8px;
          text-transform: uppercase;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
        }

        .member-type-badge::before {
          content: '';
          display: inline-block;
          width: 5px;
          height: 5px;
          background: var(--neon);
          margin-right: 6px;
          border-radius: 50%;
        }

        .status-alumni-badge {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: #c084fc;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .domain-sub-label {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-secondary);
          letter-spacing: 0.5px;
        }

        .member-social-links {
          display: flex;
          gap: 12px;
          margin-top: 8px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .social-icon-btn {
          color: var(--text-secondary);
          font-size: 0.95rem;
          transition: color 0.2s, transform 0.2s;
        }

        .card-active .social-icon-btn:hover {
          color: var(--neon);
          transform: translateY(-2px);
        }

        .card-alumni .social-icon-btn:hover {
          color: #c084fc;
          transform: translateY(-2px);
        }

        @media (max-width: 640px) {
          .member-visual {
            height: 300px;
          }
          .member-name {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MemberCard;
