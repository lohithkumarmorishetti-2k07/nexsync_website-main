import React from "react";
import { getDomainLabel } from "@/constants/teamConstants";

const MemberCard = ({ member }) => {
  if (!member) return null;

  const linkedInUrl = member.linkedinUrl || member.linkedIn;
  const githubUrl = member.githubUrl;
  const portfolioUrl = member.portfolioUrl;
  const imageUrl = member.image || member.imgUrl;
  const name = member.name || "Member";
  const isAlumni = Boolean(member.isAlumni);
  const domainDisplay = getDomainLabel(member.domain) || member.wing || "Autonomous Systems";

  return (
    <div className={`member-card-wrapper hover-lift hover-trigger ${isAlumni ? "card-alumni" : "card-active"}`}>
      <div className="member-card">
        <div className="member-visual">
          <img
            src={
              imageUrl ||
              `https://placehold.co/320x380/0a0a0a/333?text=${encodeURIComponent(name.split(" ")[0])}`
            }
            alt={name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://placehold.co/320x380/0a0a0a/333?text=${encodeURIComponent(name.split(" ")[0])}`;
            }}
          />
          <div className="visual-scanline"></div>

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
                  <i className="fas fa-graduation-cap"></i> ALUMNI
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
          display: block;
          height: 100%;
        }

        .member-card {
          background: #050505;
          border: 1px solid var(--border);
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          height: 100%;
          display: flex;
          flex-direction: column;
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
          height: 280px;
          width: 100%;
          position: relative;
          overflow: hidden;
          background: #000;
        }

        .member-visual img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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
          transform: scale(1.08);
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
          padding: 18px 20px;
          background: var(--surface);
          border-top: 1px solid var(--border);
          position: relative;
          z-index: 5;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: background 0.3s;
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
          font-size: 1.35rem;
          color: #ffffff;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          transition: color 0.3s;
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
          gap: 4px;
          margin-bottom: 8px;
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
          margin-top: 10px;
          padding-top: 12px;
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
      `}</style>
    </div>
  );
};

export default MemberCard;
