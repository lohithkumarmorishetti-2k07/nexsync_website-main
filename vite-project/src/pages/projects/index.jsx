import React, { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";
import ProjectCard from "../../components/ui/ProjectCard";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/projects");
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data)) {
        setProjects(data);
      }
    } catch (err) {
      console.error("Backend projects API failed:", err);
      setError("Failed to query project repository.");
    } finally {
      setLoading(false);
    }
  };

  // 'Active' is the canonical status; 'IN PROGRESS' kept as legacy alias
  const activeProjects = projects.filter(
    (p) => p.status === "Active" || p.status === "IN PROGRESS"
  );
  // 'Future' is canonical; 'PLANNING' kept as legacy alias
  const futureProjects = projects.filter(
    (p) => p.status === "Future" || p.status === "PLANNING"
  );
  // 'Completed' is canonical; 'PAST' kept as legacy alias
  const completedProjects = projects.filter(
    (p) => p.status === "Completed" || p.status === "PAST"
  );
  const alumniProjects = projects.filter((p) => p.status === "Alumni");

  return (
    <div className="projects-page-root">
      {/* HERO HEADER */}
      <section className="projects-hero-header">
        <div className="projects-header-inner">
          <span className="section-label">03 /// RESEARCH & DEVELOPMENT</span>
          <h1 className="page-hero-title">ENGINEERING BUILDS</h1>
          <p className="page-hero-subtitle">
            Autonomous vehicle architectures, V2X edge infrastructure, and ROS2 robot navigation stacks developed by NexSync engineers.
          </p>

          <div className="projects-quick-nav">
            <a href="#active-builds" className="quick-pill hover-trigger">
              Active Builds ({activeProjects.length})
            </a>
            <a href="#future-pipeline" className="quick-pill hover-trigger">
              Future Pipeline ({futureProjects.length})
            </a>
            <a href="#completed-builds" className="quick-pill hover-trigger">
              Completed Builds ({completedProjects.length})
            </a>
            <a href="#alumni-builds" className="quick-pill hover-trigger">
              Alumni Builds ({alumniProjects.length})
            </a>
          </div>
        </div>
      </section>

      <div className="projects-content-container">
        {loading ? (
          <div className="loading-state">
            <div className="telemetry-spinner"></div>
            <span>QUERYING SYSTEM BUILD REPOSITORIES FROM DATABASE...</span>
          </div>
        ) : error ? (
          <div className="error-state">⚠️ {error}</div>
        ) : (
          <>
            {/* SECTION 1: ACTIVE PROJECTS */}
            <section id="active-builds" className="projects-section-block">
              <div className="projects-section-header">
                <div className="header-meta">
                  <span className="badge-neon">ACTIVE OPERATIONS</span>
                  <h2>Active System Builds</h2>
                </div>
                <span className="count-label">{activeProjects.length} IN-FLIGHT REPOSITORIES</span>
              </div>
              {activeProjects.length === 0 ? (
                <p className="empty-projects-msg">No active builds currently in progress.</p>
              ) : (
                <div className="projects-cards-grid">
                  {activeProjects.map((p) => (
                    <ProjectCard key={p._id || p.projectId} project={p} />
                  ))}
                </div>
              )}
            </section>

            {/* SECTION 2: FUTURE PROJECTS */}
            <section id="future-pipeline" className="projects-section-block">
              <div className="projects-section-header">
                <div className="header-meta">
                  <span className="badge-neon" style={{ color: "#00dcff" }}>NEXT-GEN PIPELINE</span>
                  <h2>Future Architecture Projects</h2>
                </div>
                <span className="count-label">{futureProjects.length} ROADMAP INITIATIVES</span>
              </div>
              {futureProjects.length === 0 ? (
                <p className="empty-projects-msg">No future pipeline initiatives recorded.</p>
              ) : (
                <div className="projects-cards-grid">
                  {futureProjects.map((p) => (
                    <ProjectCard key={p._id || p.projectId} project={p} />
                  ))}
                </div>
              )}
            </section>

            {/* SECTION 3: COMPLETED PROJECTS */}
            <section id="completed-builds" className="projects-section-block">
              <div className="projects-section-header">
                <div className="header-meta">
                  <span className="badge-neon" style={{ color: "#64ff64" }}>FIELD TESTED</span>
                  <h2>Completed & Operational Builds</h2>
                </div>
                <span className="count-label">{completedProjects.length} DEPLOYED SYSTEMS</span>
              </div>
              {completedProjects.length === 0 ? (
                <p className="empty-projects-msg">No completed systems recorded.</p>
              ) : (
                <div className="projects-cards-grid">
                  {completedProjects.map((p) => (
                    <ProjectCard key={p._id || p.projectId} project={p} />
                  ))}
                </div>
              )}
            </section>

            {/* SECTION 4: ALUMNI PROJECTS */}
            <section id="alumni-builds" className="projects-section-block">
              <div className="projects-section-header">
                <div className="header-meta">
                  <span className="badge-neon" style={{ color: "#c084fc" }}>FOUNDATION HERITAGE</span>
                  <h2>Alumni Legacy Builds</h2>
                </div>
                <span className="count-label">{alumniProjects.length} FOUNDATION REPOSITORIES</span>
              </div>
              {alumniProjects.length === 0 ? (
                <p className="empty-projects-msg">No alumni legacy builds recorded.</p>
              ) : (
                <div className="projects-cards-grid">
                  {alumniProjects.map((p) => (
                    <ProjectCard key={p._id || p.projectId} project={p} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <style>{`
        .projects-page-root {
          min-height: 100vh;
          padding-top: 100px;
        }

        .projects-hero-header {
          padding: 60px 5% 40px;
          max-width: 1400px;
          margin: 0 auto;
          border-bottom: 1px solid var(--border);
        }

        .projects-header-inner {
          border-left: 3px solid var(--neon);
          padding-left: 28px;
        }

        .page-hero-title {
          font-family: var(--font-display);
          font-size: 4.5rem;
          line-height: 0.95;
          color: #ffffff;
          margin: 10px 0 16px;
          letter-spacing: 1px;
        }

        .page-hero-subtitle {
          font-family: var(--font-body);
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 700px;
          line-height: 1.6;
          margin-bottom: 30px;
        }

        .projects-quick-nav {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .quick-pill {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          padding: 8px 16px;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          transition: all 0.25s;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .quick-pill:hover {
          border-color: var(--neon);
          color: var(--neon);
          background: rgba(209, 255, 0, 0.05);
        }

        .projects-content-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 5% 80px;
          display: flex;
          flex-direction: column;
          gap: 80px;
        }

        .projects-section-block {
          scroll-margin-top: 120px;
        }

        .projects-section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 1px solid var(--border);
          padding-bottom: 16px;
          margin-bottom: 36px;
        }

        .header-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .badge-neon {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--neon);
          letter-spacing: 1.5px;
        }

        .projects-section-header h2 {
          font-family: var(--font-display);
          font-size: 2.8rem;
          color: #ffffff;
          line-height: 1;
        }

        .count-label {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-secondary);
          letter-spacing: 1px;
        }

        .projects-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 28px;
        }

        .empty-projects-msg {
          font-family: var(--font-mono);
          color: #666;
          font-size: 0.9rem;
          padding: 20px 0;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 80px 0;
          font-family: var(--font-mono);
          color: var(--neon);
          letter-spacing: 1.5px;
        }

        .telemetry-spinner {
          width: 32px;
          height: 32px;
          border: 2px solid rgba(209, 255, 0, 0.2);
          border-top-color: var(--neon);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .error-state {
          padding: 40px;
          text-align: center;
          font-family: var(--font-mono);
          color: #ff5555;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .page-hero-title {
            font-size: 3rem;
          }
          .projects-section-header h2 {
            font-size: 2rem;
          }
          .projects-cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ProjectsPage;
