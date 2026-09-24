import React from "react";
import { Link } from "react-router-dom";

const ProjectCard = ({ project }) => {
  if (!project) return null;

  const projId = project._id || project.projectId || project.id;
  const coverImage = project.coverImage || project.thumbnail;

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
      case "PAST":
        return "status-done";
      case "ACTIVE":
      case "IN PROGRESS":
        return "status-wip";
      case "FUTURE":
      case "PLANNING":
        return "status-planning";
      case "ALUMNI":
        return "status-alumni";
      default:
        return "status-wip";
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
      case "PAST":
        return "DEPLOYED // OPERATIONAL";
      case "ACTIVE":
      case "IN PROGRESS":
        return "ACTIVE R&D // IN PROGRESS";
      case "FUTURE":
      case "PLANNING":
        return "ARCHITECTURE // PLANNING";
      case "ALUMNI":
        return "LEGACY // ALUMNI BUILD";
      default:
        return status ? `${status.toUpperCase()} // BUILD` : "ACTIVE";
    }
  };

  return (
    <div className="cyber-project-card hover-lift hover-trigger">
      <div className="project-top-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="project-code">{project.projectId || "SYS-NODE"}</span>
          {project.videoUrl && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--neon)', border: '1px solid rgba(209, 255, 0, 0.4)', padding: '1px 6px', background: 'rgba(209, 255, 0, 0.08)' }}>
              ▶ VIDEO
            </span>
          )}
        </div>
        <span className={`project-status-pill ${getStatusClass(project.status)}`}>
          <span className="status-indicator-dot"></span>
          {getStatusLabel(project.status)}
        </span>
      </div>

      {coverImage && (
        <div className="project-thumbnail-wrapper">
          <Link to={`/projects/${projId}`} className="project-thumb-link">
            <img
              src={coverImage}
              alt={project.projectName}
              className="project-thumb-img"
              onError={(e) => {
                e.target.parentElement.parentElement.style.display = "none";
              }}
            />
          </Link>
        </div>
      )}

      {projId ? (
        <Link to={`/projects/${projId}`} className="project-title-link">
          <h3 className="project-name">{project.projectName}</h3>
        </Link>
      ) : (
        <h3 className="project-name">{project.projectName}</h3>
      )}
      <p className="project-description">{project.description}</p>

      {project.techStack && project.techStack.length > 0 && (
        <div className="project-tech-stack">
          {project.techStack.map((tech, i) => (
            <span key={i} className="tech-pill">
              {String(tech).toUpperCase()}
            </span>
          ))}
        </div>
      )}

      <div className="project-card-footer">
        <div className="project-links-row">
          {projId && (
            <Link
              to={`/projects/${projId}`}
              className="proj-link-item details-link"
              aria-label="View Details"
            >
              <i className="fas fa-arrow-right"></i>
              <span>DETAILS</span>
            </Link>
          )}
          {project.repoLink && (
            <a
              href={project.repoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="proj-link-item"
              aria-label="Repository"
            >
              <i className="fab fa-github"></i>
              <span>CODE</span>
            </a>
          )}
          {project.demoLink && (
            <a
              href={project.demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="proj-link-item demo-link"
              aria-label="Demo"
            >
              <i className="fas fa-play"></i>
              <span>DEMO</span>
            </a>
          )}
          {project.docLink && (
            <a
              href={project.docLink}
              target="_blank"
              rel="noopener noreferrer"
              className="proj-link-item"
              aria-label="Docs"
            >
              <i className="fas fa-book"></i>
              <span>DOCS</span>
            </a>
          )}
        </div>
        <i className="fas fa-microchip chip-icon"></i>
      </div>

      <style>{`
        .cyber-project-card {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 32px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          transition: all 0.35s var(--ease);
          height: 100%;
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
          margin-bottom: 16px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .project-code {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--neon);
          letter-spacing: 1.5px;
          font-weight: 700;
        }

        .project-status-pill {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          padding: 4px 10px;
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

        .project-thumbnail-wrapper {
          width: 100%;
          height: 160px;
          overflow: hidden;
          margin-bottom: 16px;
          background: #000;
          border: 1px solid var(--border);
        }

        .project-thumb-link {
          display: block;
          width: 100%;
          height: 100%;
        }

        .project-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.8;
          transition: transform 0.4s;
        }

        .cyber-project-card:hover .project-thumb-img {
          transform: scale(1.05);
          opacity: 1;
        }

        .project-title-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .project-title-link:hover .project-name {
          color: var(--neon);
        }

        .project-name {
          font-family: var(--font-display);
          font-size: 2.2rem;
          line-height: 1.05;
          color: #ffffff;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .project-description {
          font-family: var(--font-body);
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 20px;
          flex-grow: 1;
        }

        .project-tech-stack {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 18px;
        }

        .tech-pill {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          padding: 3px 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          color: #cccccc;
          letter-spacing: 0.5px;
        }

        .project-team-row {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--text-secondary);
          margin-bottom: 18px;
          line-height: 1.4;
        }

        .team-lead-label {
          color: var(--neon);
          margin-right: 6px;
        }

        .project-card-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .project-links-row {
          display: flex;
          gap: 12px;
        }

        .proj-link-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-secondary);
          transition: color 0.2s;
        }

        .proj-link-item:hover {
          color: var(--neon);
        }

        .proj-link-item.demo-link:hover {
          color: #00dcff;
        }

        .chip-icon {
          color: #444;
          font-size: 0.9rem;
          transition: color 0.3s;
        }

        .cyber-project-card:hover .chip-icon {
          color: var(--neon);
        }
      `}</style>
    </div>
  );
};

export default ProjectCard;
