import React, { useState, useEffect } from "react";
import axios from "@/api/axiosInstance";
import MemberCard from "@/components/ui/MemberCard";
import { DOMAIN_DISPLAY_ORDER, getDomainLabel } from "@/constants/teamConstants";

const TeamPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedActiveDomain, setSelectedActiveDomain] = useState("ALL");
  const [selectedAlumniDomain, setSelectedAlumniDomain] = useState("ALL");

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("/api/team");
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data)) {
        setTeamMembers(data);
      }
    } catch (err) {
      console.error("Backend team API error:", err);
      setError("Failed to synchronize personnel telemetry.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to sort members by domain display order, role hierarchy, and then name
  const sortMembers = (members) => {
    const rolePriority = {
      "Club Coordinator": 1,
      "Executive Member": 2,
      "Wing Member": 3,
    };
    return [...members].sort((a, b) => {
      const orderA = DOMAIN_DISPLAY_ORDER.indexOf(a.domain);
      const orderB = DOMAIN_DISPLAY_ORDER.indexOf(b.domain);
      const rankA = orderA === -1 ? 999 : orderA;
      const rankB = orderB === -1 ? 999 : orderB;
      if (rankA !== rankB) return rankA - rankB;

      const roleA = rolePriority[a.role] || 99;
      const roleB = rolePriority[b.role] || 99;
      if (roleA !== roleB) return roleA - roleB;

      return (a.name || "").localeCompare(b.name || "");
    });
  };

  // 1. Separate Active (Present) Members and Alumni
  const activeMembers = teamMembers.filter((m) => !m.isAlumni && !m.isArchived);
  const alumniMembers = teamMembers.filter((m) => m.isAlumni && !m.isArchived);

  // 2. Active grouping by domain (preserving DOMAIN_DISPLAY_ORDER)
  const activeByDomain = DOMAIN_DISPLAY_ORDER.map((domain) => {
    const members = activeMembers.filter((m) => m.domain === domain);
    return { domain, label: getDomainLabel(domain), members: sortMembers(members) };
  }).filter((group) => group.members.length > 0);

  // Ensure any active members with custom or unlisted domains are also preserved
  const unmappedActive = activeMembers.filter(
    (m) => !DOMAIN_DISPLAY_ORDER.includes(m.domain)
  );
  if (unmappedActive.length > 0) {
    activeByDomain.push({
      domain: "OTHER",
      label: "General & Interdisciplinary",
      members: sortMembers(unmappedActive),
    });
  }

  const displayedActiveGroups =
    selectedActiveDomain === "ALL"
      ? activeByDomain
      : activeByDomain.filter((g) => g.domain === selectedActiveDomain);

  // 3. Alumni grouping by domain (preserving DOMAIN_DISPLAY_ORDER)
  const alumniByDomain = DOMAIN_DISPLAY_ORDER.map((domain) => {
    const members = alumniMembers.filter((m) => m.domain === domain);
    return { domain, label: getDomainLabel(domain), members: sortMembers(members) };
  }).filter((group) => group.members.length > 0);

  // Ensure any alumni with custom or unlisted domains are also preserved
  const unmappedAlumni = alumniMembers.filter(
    (m) => !DOMAIN_DISPLAY_ORDER.includes(m.domain)
  );
  if (unmappedAlumni.length > 0) {
    alumniByDomain.push({
      domain: "OTHER",
      label: "General & Interdisciplinary",
      members: sortMembers(unmappedAlumni),
    });
  }

  const displayedAlumniGroups =
    selectedAlumniDomain === "ALL"
      ? alumniByDomain
      : alumniByDomain.filter((g) => g.domain === selectedAlumniDomain);

  return (
    <div className="team-page-root">
      {/* HERO HEADER */}
      <section className="team-hero-header">
        <div className="team-header-inner">
          <span className="section-label">04 /// PERSONNEL & ROSTER</span>
          <h1 className="page-hero-title">COMMAND STRUCTURE</h1>
          <p className="page-hero-subtitle">
            Autonomous mobility engineering command roster, research fellows, and domain architects at IIIT Sri City.
          </p>

          <div className="team-quick-nav">
            <a href="#present-command" className="quick-pill hover-trigger">
              [01] Present Command ({activeMembers.length})
            </a>
            <a href="#alumni-registry" className="quick-pill alumni-pill hover-trigger">
              [02] Alumni Registry ({alumniMembers.length})
            </a>
          </div>
        </div>
      </section>

      <div className="team-content-container">
        {loading ? (
          <div className="loading-state">
            <div className="telemetry-spinner"></div>
            <span>SYNCHRONIZING PERSONNEL ROSTER FROM DATABASE...</span>
          </div>
        ) : error ? (
          <div className="error-state">⚠️ {error}</div>
        ) : (
          <>
            {/* SECTION 01: PRESENT TEAM / ACTIVE COMMAND */}
            <section id="present-command" className="team-section-block">
              <div className="team-section-header">
                <div className="header-meta">
                  <span className="badge-neon">ACTIVE OPERATIONS // PRESENT TEAM</span>
                  <h2>Present Command</h2>
                </div>
                <span className="count-label">{activeMembers.length} ACTIVE PERSONNEL</span>
              </div>

              {/* Domain Filter Pills */}
              {activeByDomain.length > 1 && (
                <div className="active-filter-bar">
                  <button
                    onClick={() => setSelectedActiveDomain("ALL")}
                    className={`filter-pill active-pill ${selectedActiveDomain === "ALL" ? "active" : ""}`}
                  >
                    All Domains ({activeMembers.length})
                  </button>
                  {activeByDomain.map((g) => (
                    <button
                      key={g.domain}
                      onClick={() => setSelectedActiveDomain(g.domain)}
                      className={`filter-pill active-pill ${selectedActiveDomain === g.domain ? "active" : ""}`}
                    >
                      {g.label} ({g.members.length})
                    </button>
                  ))}
                </div>
              )}

              {activeByDomain.length === 0 ? (
                <div className="empty-tier-notice">
                  <span>Currently synchronizing active operational crew roster.</span>
                </div>
              ) : (
                <div className="active-domains-container">
                  {displayedActiveGroups.map(({ domain, label, members }) => (
                    <div key={domain} className="active-domain-subgroup">
                      <div className="active-domain-header">
                        <span className="active-terminal-symbol">//</span>
                        <h3 className="active-domain-title">{label}</h3>
                        <span className="active-domain-count">
                          ({members.length} {members.length === 1 ? "MEMBER" : "MEMBERS"})
                        </span>
                      </div>
                      <div className="team-cards-grid">
                        {members.map((member) => (
                          <MemberCard key={member._id} member={member} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* SECTION 02: ALUMNI REGISTRY */}
            {alumniMembers.length > 0 && (
              <section id="alumni-registry" className="team-section-block alumni-section-block">
                <div className="team-section-header alumni-header">
                  <div className="header-meta">
                    <span className="badge-alumni">FOUNDATION HERITAGE // ALUMNI REGISTRY</span>
                    <h2>Alumni Registry</h2>
                  </div>
                  <span className="count-label">{alumniMembers.length} DISTINGUISHED ALUMNI</span>
                </div>

                <p className="alumni-section-caption">
                  Honoring the researchers, founders, and engineers who established the NexSync foundation.
                </p>

                {/* Domain Filter Pills */}
                {alumniByDomain.length > 1 && (
                  <div className="alumni-filter-bar">
                    <button
                      onClick={() => setSelectedAlumniDomain("ALL")}
                      className={`filter-pill ${selectedAlumniDomain === "ALL" ? "active" : ""}`}
                    >
                      All Domains ({alumniMembers.length})
                    </button>
                    {alumniByDomain.map((g) => (
                      <button
                        key={g.domain}
                        onClick={() => setSelectedAlumniDomain(g.domain)}
                        className={`filter-pill ${selectedAlumniDomain === g.domain ? "active" : ""}`}
                      >
                        {g.label} ({g.members.length})
                      </button>
                    ))}
                  </div>
                )}

                <div className="alumni-domains-container">
                  {displayedAlumniGroups.map(({ domain, label, members }) => (
                    <div key={domain} className="alumni-domain-subgroup">
                      <div className="alumni-domain-header">
                        <span className="domain-terminal-symbol">//</span>
                        <h3 className="alumni-domain-title">{label}</h3>
                        <span className="alumni-domain-count">({members.length} ALUMNI)</span>
                      </div>
                      <div className="team-cards-grid">
                        {members.map((member) => (
                          <MemberCard key={member._id} member={member} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <style>{`
        .team-page-root {
          min-height: 100vh;
          padding-top: 110px;
        }

        .team-hero-header {
          padding: 40px 5% 40px;
          max-width: 1400px;
          margin: 0 auto;
          border-bottom: 1px solid var(--border);
        }

        .team-header-inner {
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

        .team-quick-nav {
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
          text-decoration: none;
        }

        .quick-pill:hover {
          border-color: var(--neon);
          color: var(--neon);
          background: rgba(209, 255, 0, 0.05);
        }

        .alumni-pill:hover {
          border-color: #c084fc;
          color: #c084fc;
          background: rgba(192, 132, 252, 0.08);
        }

        .team-content-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 5% 80px;
          display: flex;
          flex-direction: column;
          gap: 90px;
        }

        .team-section-block {
          scroll-margin-top: 120px;
        }

        .team-section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 1px solid var(--border);
          padding-bottom: 16px;
          margin-bottom: 36px;
        }

        .alumni-header {
          border-bottom-color: rgba(192, 132, 252, 0.3);
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

        .badge-alumni {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: #c084fc;
          letter-spacing: 1.5px;
        }

        .team-section-header h2 {
          font-family: var(--font-display);
          font-size: 2.8rem;
          color: #ffffff;
          line-height: 1;
          letter-spacing: 0.5px;
        }

        .count-label {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-secondary);
          letter-spacing: 1px;
        }

        .active-filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 36px;
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .filter-pill.active-pill:hover {
          border-color: var(--neon);
          color: var(--neon);
          background: rgba(209, 255, 0, 0.05);
        }

        .filter-pill.active-pill.active {
          background: rgba(209, 255, 0, 0.15);
          border-color: var(--neon);
          color: #ffffff;
          font-weight: 700;
        }

        .active-domains-container {
          display: flex;
          flex-direction: column;
          gap: 50px;
        }

        .active-domain-subgroup {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .active-domain-header {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 6px 14px;
          background: rgba(209, 255, 0, 0.06);
          border-left: 3px solid var(--neon);
          width: fit-content;
        }

        .active-terminal-symbol {
          color: var(--neon);
          font-family: var(--font-mono);
          font-weight: 700;
        }

        .active-domain-title {
          font-family: var(--font-display);
          font-size: 1.25rem;
          color: #ffffff;
          letter-spacing: 0.5px;
          margin: 0;
          text-transform: uppercase;
        }

        .active-domain-count {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--text-secondary);
          letter-spacing: 1px;
        }

        .alumni-section-caption {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .alumni-filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 36px;
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .filter-pill {
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-family: var(--font-mono);
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.5px;
        }

        .filter-pill:hover {
          border-color: #c084fc;
          color: #c084fc;
        }

        .filter-pill.active {
          background: rgba(192, 132, 252, 0.15);
          border-color: #c084fc;
          color: #ffffff;
          font-weight: 700;
        }

        .alumni-domains-container {
          display: flex;
          flex-direction: column;
          gap: 50px;
        }

        .alumni-domain-subgroup {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .alumni-domain-header {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 6px 14px;
          background: rgba(192, 132, 252, 0.06);
          border-left: 3px solid #c084fc;
          width: fit-content;
        }

        .domain-terminal-symbol {
          color: #c084fc;
          font-family: var(--font-mono);
          font-weight: 700;
        }

        .alumni-domain-title {
          font-family: var(--font-display);
          font-size: 1.25rem;
          color: #ffffff;
          letter-spacing: 0.5px;
          margin: 0;
          text-transform: uppercase;
        }

        .alumni-domain-count {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--text-secondary);
          letter-spacing: 1px;
        }

        .team-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 28px;
          align-items: stretch;
        }

        .empty-tier-notice {
          padding: 40px;
          text-align: center;
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed var(--border);
          font-family: var(--font-mono);
          color: var(--text-secondary);
          font-size: 0.85rem;
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
          .team-page-root {
            padding-top: 95px;
          }
          .team-hero-header {
            padding: 30px 5% 30px;
          }
          .page-hero-title {
            font-size: 2.8rem;
          }
          .team-section-header h2 {
            font-size: 2rem;
          }
          .team-cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default TeamPage;
