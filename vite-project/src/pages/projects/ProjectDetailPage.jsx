import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "@/api/axiosInstance";
import VideoPlayer from "@/components/ui/VideoPlayer";
import { formatImageUrl, getDriveFallbackUrl } from "@/utils/imageUrl";

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModalImage, setActiveModalImage] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`/api/projects/${id}`);
        if (res.data?.success && res.data?.data) {
          setProject(res.data.data);
        } else {
          setError("Project build record could not be retrieved.");
        }
      } catch (err) {
        console.error("Fetch project error:", err);
        setError(err.response?.data?.message || "Project not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

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

  if (loading) {
    return (
      <div className="project-detail-loading-container">
        <div className="telemetry-spinner"></div>
        <p className="loading-text">INTERROGATING PROJECT REPOSITORY // NODE: {id}</p>
        <style>{`
          .project-detail-loading-container {
            min-height: 70vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
          }
          .telemetry-spinner {
            width: 44px;
            height: 44px;
            border: 2px solid rgba(209, 255, 0, 0.2);
            border-top-color: var(--neon);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .loading-text {
            font-family: var(--font-mono);
            font-size: 0.85rem;
            color: var(--text-secondary);
            letter-spacing: 2px;
          }
        `}</style>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail-error-container">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">PROJECT NODE NOT FOUND</h2>
          <p className="error-msg">{error || "Requested project does not exist in repository index."}</p>
          <button onClick={() => navigate("/projects")} className="btn btn-primary">
            <span>RETURN TO PROJECTS DIRECTORY</span>
            <i className="fas fa-arrow-left"></i>
          </button>
        </div>
        <style>{`
          .project-detail-error-container {
            min-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }
          .error-card {
            background: var(--surface);
            border: 1px solid rgba(255, 60, 60, 0.4);
            padding: 40px;
            text-align: center;
            max-width: 520px;
            width: 100%;
          }
          .error-icon {
            font-size: 2.5rem;
            margin-bottom: 16px;
          }
          .error-title {
            font-family: var(--font-display);
            font-size: 1.8rem;
            color: #ff5555;
            margin-bottom: 12px;
            letter-spacing: 1px;
          }
          .error-msg {
            font-family: var(--font-mono);
            font-size: 0.85rem;
            color: var(--text-secondary);
            margin-bottom: 28px;
            line-height: 1.6;
          }
        `}</style>
      </div>
    );
  }

  const rawCover = project.coverImage || project.thumbnail;
  const cover = formatImageUrl(rawCover);
  const gallery = Array.isArray(project.galleryImages)
    ? project.galleryImages.map((g) => formatImageUrl(g)).filter(Boolean)
    : [];

  return (
    <div className="project-detail-page">
      {/* NAVIGATION CRUMBS */}
      <div className="detail-nav-crumb">
        <Link to="/projects" className="crumb-back-link">
          <i className="fas fa-chevron-left"></i>
          <span>ALL PROJECTS</span>
        </Link>
        <span className="crumb-separator">/</span>
        <span className="crumb-current">{project.projectName}</span>
      </div>

      {/* HEADER SECTION */}
      <div className="detail-hero-header">
        <div className="hero-top-badges">
          <span className="project-code-badge">{project.projectId || "SYS-NODE"}</span>
          <span className={`project-status-badge ${getStatusClass(project.status)}`}>
            <span className="status-dot"></span>
            {getStatusLabel(project.status)}
          </span>
        </div>

        <h1 className="project-main-title">{project.projectName}</h1>
      </div>

      {/* COVER BANNER (IF AVAILABLE) */}
      {cover && (
        <div className="detail-cover-wrapper">
          <img
            src={cover}
            alt={project.projectName}
            className="detail-cover-img"
            onError={(e) => {
              const fallback = getDriveFallbackUrl(rawCover);
              if (fallback && e.target.src !== fallback) {
                e.target.src = fallback;
              } else {
                e.target.parentElement.style.display = "none";
              }
            }}
          />
        </div>
      )}

      {/* TWO COLUMN GRID */}
      <div className="detail-content-grid">
        {/* MAIN BODY */}
        <div className="detail-main-column">
          <div className="content-card">
            <h3 className="section-title">
              <i className="fas fa-microchip title-icon"></i>
              SYSTEM ARCHITECTURE & BRIEFING
            </h3>
            <p className="detail-description-text">{project.description}</p>
          </div>

          {/* VIDEO MEDIA SECTION */}
          {project.videoUrl && (
            <div className="content-card video-section">
              <h3 className="section-title">
                <i className="fas fa-play-circle title-icon"></i>
                SYSTEM DEMO & VIDEO STREAM
              </h3>
              <VideoPlayer
                url={project.videoUrl}
                title={`${project.projectName} // Video Telemetry`}
                poster={cover}
              />
            </div>
          )}

          {/* TECH STACK SECTION */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="content-card">
              <h3 className="section-title">
                <i className="fas fa-layer-group title-icon"></i>
                DEPLOYED TECHNOLOGIES & FRAMEWORKS
              </h3>
              <div className="tech-stack-container">
                {project.techStack.map((tech, i) => (
                  <span key={i} className="tech-chip">
                    {String(tech).toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* GALLERY SECTION (STRICTLY OMITTED IF EMPTY) */}
          {gallery.length > 0 && (
            <div className="content-card gallery-section">
              <h3 className="section-title">
                <i className="fas fa-images title-icon"></i>
                PROJECT TELEMETRY & HARDWARE GALLERY ({gallery.length})
              </h3>
              <p className="gallery-caption">
                Captured field tests, prototype schematics, and system captures. Click to expand.
              </p>
              <div className="project-gallery-grid">
                {gallery.map((imgUrl, index) => (
                  <div
                    key={index}
                    className="gallery-grid-item"
                    onClick={() => setActiveModalImage(imgUrl)}
                  >
                    <img
                      src={imgUrl}
                      alt={`Project capture ${index + 1}`}
                      className="gallery-thumb-image"
                      onError={(e) => {
                        e.target.parentElement.style.display = "none";
                      }}
                    />
                    <div className="gallery-hover-overlay">
                      <i className="fas fa-search-plus"></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR METADATA */}
        <div className="detail-sidebar-column">
          <div className="telemetry-card">
            <h3 className="sidebar-title">NODE TELEMETRY</h3>

            <div className="telemetry-list">
              <div className="telemetry-item">
                <i className="fas fa-barcode item-icon"></i>
                <div className="item-content">
                  <span className="item-label">NODE IDENTIFIER</span>
                  <span className="item-val">{project.projectId || "SYS-NODE"}</span>
                </div>
              </div>

              <div className="telemetry-item">
                <i className="fas fa-info-circle item-icon"></i>
                <div className="item-content">
                  <span className="item-label">BUILD STATUS</span>
                  <span className="item-val">{project.status?.toUpperCase() || "ACTIVE"}</span>
                </div>
              </div>

              {project.startDate && (
                <div className="telemetry-item">
                  <i className="fas fa-calendar item-icon"></i>
                  <div className="item-content">
                    <span className="item-label">DEPLOYMENT TIMELINE</span>
                    <span className="item-val">
                      {formatDate(project.startDate)}
                      {project.endDate ? ` - ${formatDate(project.endDate)}` : " - PRESENT"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ACTION LINKS */}
            <div className="sidebar-action-wrap">
              {project.repoLink && (
                <a
                  href={project.repoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary link-cta hover-trigger"
                >
                  <i className="fab fa-github"></i>
                  <span>VIEW REPOSITORY</span>
                </a>
              )}

              {project.demoLink && (
                <a
                  href={project.demoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary link-cta demo-cta hover-trigger"
                >
                  <i className="fas fa-play"></i>
                  <span>LIVE DEMONSTRATION</span>
                </a>
              )}

              {project.docLink && (
                <a
                  href={project.docLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary link-cta hover-trigger"
                >
                  <i className="fas fa-book"></i>
                  <span>DOCUMENTATION</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => navigate("/projects")}
                className="btn btn-secondary return-cta"
              >
                <i className="fas fa-arrow-left"></i>
                <span>BACK TO PROJECTS</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL / LIGHTBOX FOR GALLERY */}
      {activeModalImage && (
        <div className="gallery-modal-backdrop" onClick={() => setActiveModalImage(null)}>
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setActiveModalImage(null)}
              aria-label="Close modal"
            >
              ✕
            </button>
            <img src={activeModalImage} alt="Expanded capture" className="modal-img" />
          </div>
        </div>
      )}

      <style>{`
        .project-detail-page {
          max-width: 1240px;
          margin: 0 auto;
          padding: 32px 24px 80px;
          color: #ffffff;
        }

        .detail-nav-crumb {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 28px;
        }

        .crumb-back-link {
          color: var(--neon);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s;
        }

        .crumb-back-link:hover {
          color: #ffffff;
        }

        .crumb-separator {
          color: #444;
        }

        .crumb-current {
          color: #aaaaaa;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 400px;
        }

        .detail-hero-header {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border);
        }

        .hero-top-badges {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .project-code-badge {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--neon);
          letter-spacing: 1.5px;
          font-weight: 700;
        }

        .project-status-badge {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          padding: 4px 10px;
          border-radius: 2px;
          letter-spacing: 1px;
          display: inline-flex;
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

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .project-main-title {
          font-family: var(--font-display);
          font-size: clamp(2rem, 4vw, 3.2rem);
          line-height: 1.05;
          color: #ffffff;
          margin-bottom: 16px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .project-crew-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--text-secondary);
          flex-wrap: wrap;
        }

        .crew-label {
          color: var(--neon);
          font-weight: 700;
        }

        .crew-members {
          color: #ffffff;
        }

        .detail-cover-wrapper {
          width: 100%;
          max-height: 480px;
          overflow: hidden;
          background: #000000;
          border: 1px solid var(--border);
          margin-bottom: 36px;
          position: relative;
        }

        .detail-cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .detail-content-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 32px;
        }

        @media (max-width: 900px) {
          .detail-content-grid {
            grid-template-columns: 1fr;
          }
        }

        .content-card {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 32px;
          margin-bottom: 28px;
        }

        .section-title {
          font-family: var(--font-mono);
          font-size: 1rem;
          color: var(--neon);
          letter-spacing: 1.5px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          text-transform: uppercase;
        }

        .title-icon {
          font-size: 0.9rem;
        }

        .detail-description-text {
          font-family: var(--font-body);
          font-size: 1.05rem;
          line-height: 1.8;
          color: #dddddd;
          white-space: pre-line;
        }

        .tech-stack-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .tech-chip {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          color: #ffffff;
          letter-spacing: 1px;
        }

        .gallery-caption {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        .project-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }

        .gallery-grid-item {
          position: relative;
          height: 140px;
          border: 1px solid var(--border);
          overflow: hidden;
          cursor: pointer;
          background: #0a0a0a;
          transition: border-color 0.3s;
        }

        .gallery-grid-item:hover {
          border-color: var(--neon);
        }

        .gallery-thumb-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .gallery-grid-item:hover .gallery-thumb-image {
          transform: scale(1.08);
        }

        .gallery-hover-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--neon);
          font-size: 1.2rem;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .gallery-grid-item:hover .gallery-hover-overlay {
          opacity: 1;
        }

        .telemetry-card {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 28px;
          position: sticky;
          top: 100px;
        }

        .sidebar-title {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          color: var(--neon);
          letter-spacing: 2px;
          margin-bottom: 22px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 12px;
        }

        .telemetry-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: 28px;
        }

        .telemetry-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .item-icon {
          color: var(--neon);
          font-size: 0.9rem;
          margin-top: 3px;
          width: 16px;
          text-align: center;
        }

        .item-content {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .item-label {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--text-secondary);
          letter-spacing: 1px;
        }

        .item-val {
          font-family: var(--font-mono);
          font-size: 0.88rem;
          color: #ffffff;
        }

        .sidebar-action-wrap {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .link-cta {
          width: 100%;
          padding: 12px 18px;
          font-size: 0.8rem;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          font-family: var(--font-mono);
          letter-spacing: 1px;
        }

        .demo-cta {
          border-color: #00dcff;
          color: #00dcff;
        }

        .demo-cta:hover {
          background: rgba(0, 220, 255, 0.1);
        }

        .return-cta {
          width: 100%;
          padding: 12px 18px;
          font-size: 0.8rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          color: #ffffff;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          font-family: var(--font-mono);
          letter-spacing: 1px;
          transition: all 0.3s;
        }

        .return-cta:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: #888;
        }

        /* LIGHTBOX MODAL */
        .gallery-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .gallery-modal-content {
          position: relative;
          max-width: 90vw;
          max-height: 85vh;
        }

        .modal-img {
          width: 100%;
          height: 100%;
          max-height: 85vh;
          object-fit: contain;
          border: 1px solid var(--neon);
          box-shadow: 0 0 30px rgba(209, 255, 0, 0.2);
        }

        .modal-close-btn {
          position: absolute;
          top: -16px;
          right: -16px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--neon);
          color: #000000;
          border: none;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }

        .modal-close-btn:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default ProjectDetailPage;
