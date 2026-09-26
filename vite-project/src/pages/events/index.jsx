import React, { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";
import EventCard from "../../components/ui/EventCard";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/events");
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data)) {
        setEvents(data);
      }
    } catch (err) {
      console.error("Backend events API failed:", err);
      setError("Failed to query operational event schedule.");
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();

  // Automatic classification based on event status and date evaluation
  const upcomingEvents = events.filter((e) => {
    if (e.status === "Upcoming") return true;
    const start = new Date(e.startDate);
    return start > now && e.status !== "Completed";
  });

  const ongoingEvents = events.filter((e) => {
    if (e.status === "Ongoing") return true;
    const start = new Date(e.startDate);
    const end = e.endDate ? new Date(e.endDate) : start;
    return start <= now && end >= now;
  });

  const pastEvents = events.filter((e) => {
    if (e.status === "Completed") return true;
    const start = new Date(e.startDate);
    const end = e.endDate ? new Date(e.endDate) : start;
    return end < now && e.status !== "Ongoing" && e.status !== "Upcoming";
  });

  return (
    <div className="events-page-root">
      {/* HERO HEADER */}
      <section className="events-hero-header">
        <div className="events-header-inner">
          <span className="section-label">02 /// OPERATIONS & WORKSHOPS</span>
          <h1 className="page-hero-title">OPERATIONAL TIMELINE</h1>
          <p className="page-hero-subtitle">
            Explore national hackathons, hardware sprints, and autonomous mobility masterclasses hosted by NexSync.
          </p>

          <div className="events-quick-nav">
            <a href="#upcoming-events" className="quick-pill hover-trigger">
              Upcoming ({upcomingEvents.length})
            </a>
            {ongoingEvents.length > 0 && (
              <a href="#ongoing-events" className="quick-pill hover-trigger">
                Ongoing Live ({ongoingEvents.length})
              </a>
            )}
            <a href="#past-events" className="quick-pill hover-trigger">
              Past Archives ({pastEvents.length})
            </a>
          </div>
        </div>
      </section>

      <div className="events-content-container">
        {loading ? (
          <div className="loading-state">
            <div className="telemetry-spinner"></div>
            <span>QUERYING OPERATIONAL EVENT REGISTRY FROM DATABASE...</span>
          </div>
        ) : error ? (
          <div className="error-state">⚠️ {error}</div>
        ) : (
          <>
            {/* ONGOING EVENTS (IF ANY) */}
            {ongoingEvents.length > 0 && (
              <section id="ongoing-events" className="events-section-block">
                <div className="events-section-header">
                  <div className="header-meta">
                    <span className="badge-neon" style={{ color: "#00dcff" }}>LIVE NOW</span>
                    <h2>Ongoing Operations</h2>
                  </div>
                  <span className="count-label">{ongoingEvents.length} IN-FLIGHT EVENTS</span>
                </div>
                <div className="events-cards-grid">
                  {ongoingEvents.map((evt) => (
                    <EventCard key={evt._id} event={evt} isFeatured={true} />
                  ))}
                </div>
              </section>
            )}

            {/* UPCOMING EVENTS */}
            <section id="upcoming-events" className="events-section-block">
              <div className="events-section-header">
                <div className="header-meta">
                  <span className="badge-neon">SCHEDULED MISSIONS</span>
                  <h2>Upcoming Events & Hackathons</h2>
                </div>
                <span className="count-label">{upcomingEvents.length} UPCOMING SESSIONS</span>
              </div>
              {upcomingEvents.length === 0 ? (
                <p className="empty-events-msg">No upcoming events currently scheduled. Check back soon!</p>
              ) : (
                <div className="events-cards-grid">
                  {upcomingEvents.map((evt) => (
                    <EventCard key={evt._id} event={evt} />
                  ))}
                </div>
              )}
            </section>

            {/* PAST EVENTS */}
            <section id="past-events" className="events-section-block">
              <div className="events-section-header">
                <div className="header-meta">
                  <span className="badge-neon" style={{ color: "#888" }}>HISTORICAL LOGS</span>
                  <h2>Past Events & Archives</h2>
                </div>
                <span className="count-label">{pastEvents.length} COMPLETED SYMPOSIA</span>
              </div>
              {pastEvents.length === 0 ? (
                <p className="empty-events-msg">No historical events recorded.</p>
              ) : (
                <div className="events-cards-grid">
                  {pastEvents.map((evt) => (
                    <EventCard key={evt._id} event={evt} showRsvp={false} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <style>{`
        .events-page-root {
          min-height: 100vh;
          padding-top: 110px;
        }

        .events-hero-header {
          padding: 40px 5% 40px;
          max-width: 1400px;
          margin: 0 auto;
          border-bottom: 1px solid var(--border);
        }

        .events-header-inner {
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

        .events-quick-nav {
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

        .events-content-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 5% 80px;
          display: flex;
          flex-direction: column;
          gap: 80px;
        }

        .events-section-block {
          scroll-margin-top: 120px;
        }

        .events-section-header {
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

        .events-section-header h2 {
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

        .events-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 28px;
        }

        .empty-events-msg {
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
          .events-page-root {
            padding-top: 95px;
          }
          .events-hero-header {
            padding: 30px 5% 30px;
          }
          .page-hero-title {
            font-size: 3rem;
          }
          .events-section-header h2 {
            font-size: 2rem;
          }
          .events-cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EventsPage;
