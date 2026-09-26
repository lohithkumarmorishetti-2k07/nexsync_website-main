import React from "react";
import { Link } from "react-router-dom";
import { formatImageUrl, getDriveFallbackUrl } from "@/utils/imageUrl";

const ProjectCard = ({ project }) => {
  if (!project) return null;

  const projId = project._id || project.projectId || project.id;
  const rawCover = project.coverImage || project.thumbnail;
  const coverImage = formatImageUrl(rawCover);
  const headerText = (project.projectHeader && project.projectHeader.trim()) || project.projectName || "UNTITLED PROJECT";

  return (
    <div className="cyber-project-card hover-lift hover-trigger">
      {coverImage && (
        <div className="project-thumbnail-wrapper">
          <Link to={`/projects/${projId}`} className="project-thumb-link">
            <img
              src={coverImage}
              alt={headerText}
              className="project-thumb-img"
              onError={(e) => {
                const fallback = getDriveFallbackUrl(rawCover);
                if (fallback && e.target.src !== fallback) {
                  e.target.src = fallback;
                } else {
                  e.target.parentElement.parentElement.style.display = "none";
                }
              }}
            />
          </Link>
        </div>
      )}

      {projId ? (
        <Link to={`/projects/${projId}`} className="project-title-link">
          <h3 className="project-name project-header-clamped">{headerText}</h3>
        </Link>
      ) : (
        <h3 className="project-name project-header-clamped">{headerText}</h3>
      )}

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

        .project-thumbnail-wrapper {
          width: 100%;
          height: 180px;
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
          opacity: 0.85;
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

        .project-name.project-header-clamped {
          font-family: var(--font-display);
          font-size: 1.8rem;
          line-height: 1.2;
          color: #ffffff;
          margin-bottom: 20px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          max-height: 2.4em;
          word-break: break-word;
        }

        .project-card-footer {
          margin-top: auto;
          display: flex;
          width: 100%;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .project-card-footer .detail-btn {
          width: 100%;
          padding: 10px 16px;
          font-size: 0.78rem;
          gap: 8px;
          box-sizing: border-box;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          letter-spacing: 1px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .project-card-footer .detail-btn:hover {
          background: rgba(209, 255, 0, 0.1);
          border-color: var(--neon);
          color: var(--neon);
        }
      `}</style>
    </div>
  );
};

export default ProjectCard;
