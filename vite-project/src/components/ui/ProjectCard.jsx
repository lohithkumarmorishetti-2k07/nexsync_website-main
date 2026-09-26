import React from "react";
import { Link } from "react-router-dom";
import { formatImageUrl, getDriveFallbackUrl } from "@/utils/imageUrl";

/**
 * Generates an SVG data URI avatar based on project title and code.
 * Serves as an instant, zero-network-dependency offline fallback.
 */
const getProjectFallback = (title, code) => {
  const safeCode = (code || "NEX-PRJ").toUpperCase();
  const initials = (title || "PRJ")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 3)
    .join("")
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 240" width="480" height="240">
    <rect width="480" height="240" fill="#080808"/>
    <defs>
      <linearGradient id="projBg_${initials}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141414"/>
        <stop offset="100%" stop-color="#050505"/>
      </linearGradient>
      <pattern id="projGrid_${initials}" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#202020" stroke-width="0.5"/>
      </pattern>
    </defs>
    <rect width="480" height="240" fill="url(#projBg_${initials})"/>
    <rect width="480" height="240" fill="url(#projGrid_${initials})" opacity="0.6"/>
    <rect x="24" y="24" width="432" height="192" fill="none" stroke="#262626" stroke-width="1" stroke-dasharray="4 4"/>
    <circle cx="240" cy="100" r="38" fill="#101010" stroke="#d1ff00" stroke-width="1.5" stroke-opacity="0.4"/>
    <path d="M224 100 L256 100 M240 84 L240 116" stroke="#d1ff00" stroke-width="1.5" stroke-opacity="0.8"/>
    <rect x="170" y="152" width="140" height="26" rx="2" fill="rgba(209, 255, 0, 0.08)" stroke="#d1ff00" stroke-width="1" stroke-opacity="0.4"/>
    <text x="240" y="169" fill="#d1ff00" font-family="monospace" font-size="11" font-weight="bold" letter-spacing="2" text-anchor="middle">${safeCode}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const ProjectCard = ({ project }) => {
  if (!project) return null;

  const projId = project._id || project.projectId || project.id;
  const rawCover = project.coverImage || project.thumbnail;
  const coverImage = formatImageUrl(rawCover);
  const title = project.projectName || "UNTITLED PROJECT";
  const header = project.projectHeader && project.projectHeader.trim() ? project.projectHeader.trim() : "";
  const fallbackVisual = getProjectFallback(title, project.projectCode || "NEX-PRJ");

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
      case "IN PROGRESS": // legacy alias, kept for backward compat
      case "WIP":
        return "status-wip";
      case "COMPLETED":
        return "status-done";
      case "FUTURE":
      case "PLANNING":
        return "status-planning";
      case "ALUMNI":
        return "status-alumni";
      default:
        return "status-wip";
    }
  };

  return (
    <div className="cyber-project-card hover-lift hover-trigger">
      {/* TOP ROW: CODE & STATUS */}
      <div className="project-top-row">
        <span className="project-code">{project.projectCode || "NEX-PRJ"}</span>
        <span className={`project-status-pill ${getStatusClass(project.status)}`}>
          <span className="status-indicator-dot"></span>
          {project.status || "WIP"}
        </span>
      </div>

      {/* THUMBNAIL WITH IMAGE SCALING STRATEGY REUSED FROM MEMBERCARD */}
      <div className="project-thumbnail-wrapper">
        <Link to={`/projects/${projId}`} className="project-thumb-link">
          <img
            src={coverImage || fallbackVisual}
            alt={title}
            className="project-thumb-img"
            loading="lazy"
            onError={(e) => {
              const fallback = getDriveFallbackUrl(rawCover);
              if (fallback && e.target.src !== fallback) {
                e.target.src = fallback;
              } else {
                e.target.onerror = null;
                e.target.src = fallbackVisual;
              }
            }}
          />
          <div className="visual-scanline"></div>
          <div className="visual-gradient-vignette"></div>
        </Link>
      </div>

      {/* PROJECT TITLE */}
      {projId ? (
        <Link to={`/projects/${projId}`} className="project-title-link">
          <h3 className="project-name">{title}</h3>
        </Link>
      ) : (
        <h3 className="project-name">{title}</h3>
      )}

      {/* PROJECT HEADER */}
      {header && <p className="project-header-sub">{header}</p>}

      {/* CARD FOOTER: VIEW DETAILS */}
      <div className="project-card-footer">
        {projId && (
          <Link
            to={`/projects/${projId}`}
            className="btn btn-secondary detail-btn hover-trigger"
            aria-label="View Details"
          >
            <span>VIEW DETAILS</span>
            <i className="fas fa-arrow-right"></i>
          </Link>
        )}
        <i className="fas fa-microchip chip-icon"></i>
      </div>

      <style>{`
        .cyber-project-card {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 24px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          transition: all 0.35s var(--ease);
          height: 100%;
          box-sizing: border-box;
        }

        .cyber-project-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 0%;
          height: 2px;
          background: var(--neon);
          transition: width 0.35s var(--ease);
        }

        .cyber-project-card:hover {
          border-color: var(--neon);
          transform: translateY(-6px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(209, 255, 0, 0.12);
        }

        .cyber-project-card:hover::before {
          width: 100%;
        }

        .project-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .project-code {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: var(--neon);
          letter-spacing: 1.5px;
          font-weight: 700;
        }

        .project-status-pill {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          padding: 3px 8px;
          border-radius: 2px;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
        }

        .status-wip {
          background: rgba(209, 255, 0, 0.1);
          color: var(--neon);
          border: 1px solid rgba(209, 255, 0, 0.3);
        }

        .status-done {
          background: rgba(100, 255, 100, 0.1);
          color: #64ff64;
          border: 1px solid rgba(100, 255, 100, 0.3);
        }

        .status-planning {
          background: rgba(0, 220, 255, 0.1);
          color: #00dcff;
          border: 1px solid rgba(0, 220, 255, 0.3);
        }

        .status-alumni {
          background: rgba(180, 120, 255, 0.1);
          color: #c084fc;
          border: 1px solid rgba(180, 120, 255, 0.3);
        }

        .status-indicator-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        /* IMAGE SCALING STRATEGY REUSED FROM MEMBERCARD */
        .project-thumbnail-wrapper {
          width: 100%;
          height: 180px;
          overflow: hidden;
          margin-bottom: 16px;
          background: #000;
          border: 1px solid var(--border);
          position: relative;
          flex-shrink: 0;
        }

        .project-thumb-link {
          display: block;
          width: 100%;
          height: 100%;
        }

        .project-thumb-img {
          width: 100%;
          height: 100%;
          max-width: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          opacity: 0.85;
          transition: transform 0.4s ease, opacity 0.4s ease;
        }

        .cyber-project-card:hover .project-thumb-img {
          transform: scale(1.05);
          opacity: 1;
        }

        .visual-scanline {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.4) 51%);
          background-size: 100% 4px;
          pointer-events: none;
          z-index: 2;
          opacity: 0.25;
        }

        .visual-gradient-vignette {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 50px;
          background: linear-gradient(to top, rgba(5, 5, 5, 0.8) 0%, rgba(5, 5, 5, 0) 100%);
          pointer-events: none;
          z-index: 3;
        }

        .project-title-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .project-name {
          font-family: var(--font-display);
          font-size: 1.5rem;
          line-height: 1.2;
          color: #ffffff;
          margin-bottom: 6px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-word;
          transition: color 0.3s;
        }

        .project-title-link:hover .project-name {
          color: var(--neon);
        }

        .project-header-sub {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          line-height: 1.4;
          color: var(--neon);
          margin-bottom: 16px;
          letter-spacing: 0.5px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-word;
          opacity: 0.9;
        }

        .project-card-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .project-card-footer .detail-btn {
          flex: 1;
          padding: 9px 14px;
          font-size: 0.75rem;
          gap: 6px;
          box-sizing: border-box;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          letter-spacing: 0.8px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .project-card-footer .detail-btn:hover {
          background: rgba(209, 255, 0, 0.1);
          border-color: var(--neon);
          color: var(--neon);
        }

        .chip-icon {
          color: #444;
          font-size: 0.9rem;
          transition: color 0.3s;
          flex-shrink: 0;
        }

        .cyber-project-card:hover .chip-icon {
          color: var(--neon);
        }
      `}</style>
    </div>
  );
};

export default ProjectCard;
