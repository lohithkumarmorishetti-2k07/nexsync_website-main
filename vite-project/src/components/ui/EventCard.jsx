import React from "react";
import { Link } from "react-router-dom";
import { formatImageUrl, getDriveFallbackUrl } from "@/utils/imageUrl";

export const isValidUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed === "" || trimmed === "#" || trimmed.toLowerCase() === "null") return false;

  // Internal path
  if (trimmed.startsWith("/")) return true;

  // External URL validation
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const EventCard = ({ event, isFeatured = false, showRsvp = true }) => {
  if (!event) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const rsvp = event.rsvpLink || event.redirectUrl;
  const hasValidRsvp = isValidUrl(rsvp);
  const isInternal = hasValidRsvp && rsvp.trim().startsWith("/");
  const status = event.status || "Upcoming";
  const rawCover = event.coverImage || event.image;
  const coverImage = formatImageUrl(rawCover);
  const eventId = event._id || event.id;

  return (
    <div className={`cyber-event-card ${isFeatured || event.isFeatured ? "featured" : ""}`}>
      <div className="card-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="event-category-badge">{event.eventType || event.category || "EVENT"}</span>
          {event.videoUrl && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--neon)', border: '1px solid rgba(209, 255, 0, 0.4)', padding: '1px 6px', background: 'rgba(209, 255, 0, 0.08)' }}>
              ▶ VIDEO
            </span>
          )}
        </div>
        <div className="event-pulse-indicator">
          <span className={`pulse-light status-${status.toLowerCase()}`}></span>
          <span className="status-text">{status.toUpperCase()}</span>
        </div>
      </div>

      {coverImage && (
        <div className="event-cover-wrapper">
          <Link to={`/events/${eventId}`} className="event-cover-link">
            <img
              src={coverImage}
              alt={event.title}
              className="event-cover-img"
              onError={(e) => {
                const fallback = getDriveFallbackUrl(rawCover);
                if (fallback && e.target.src !== fallback) {
                  e.target.src = fallback;
                } else {
                  e.target.parentElement.style.display = "none";
                }
              }}
            />
          </Link>
        </div>
      )}

      <div className="event-card-body">
        {eventId ? (
          <Link to={`/events/${eventId}`} className="event-title-link">
            <h3 className="event-title">{event.title}</h3>
          </Link>
        ) : (
          <h3 className="event-title">{event.title}</h3>
        )}
        <p className="event-desc">{event.description}</p>

        <div className="event-meta-grid">
          <div className="meta-row">
            <i className="fas fa-calendar-alt meta-icon"></i>
            <span>
              {formatDate(event.startDate)}
              {event.endDate && event.endDate !== event.startDate
                ? ` - ${formatDate(event.endDate)}`
                : ""}
            </span>
          </div>

          {event.timeRange && (
            <div className="meta-row">
              <i className="fas fa-clock meta-icon"></i>
              <span>{event.timeRange}</span>
            </div>
          )}

          {event.duration && (
            <div className="meta-row">
              <i className="fas fa-hourglass-half meta-icon"></i>
              <span>{event.duration}</span>
            </div>
          )}

          {event.location && (
            <div className="meta-row location">
              <i className="fas fa-map-marker-alt meta-icon"></i>
              <span>{event.location}</span>
            </div>
          )}

          {event.organizer && (
            <div className="meta-row">
              <i className="fas fa-users-cog meta-icon"></i>
              <span>{event.organizer}</span>
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="event-action-bar">
          {eventId && (
            <Link
              to={`/events/${eventId}`}
              className="btn btn-secondary detail-btn hover-trigger"
            >
              <span>VIEW DETAILS</span>
              <i className="fas fa-arrow-right"></i>
            </Link>
          )}

          {showRsvp && (
            hasValidRsvp ? (
              isInternal ? (
                <Link
                  to={rsvp.trim()}
                  className="btn btn-primary rsvp-btn hover-trigger"
                >
                  <span>RSVP NOW</span>
                  <i className="fas fa-external-link-alt"></i>
                </Link>
              ) : (
                <a
                  href={rsvp.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary rsvp-btn hover-trigger"
                >
                  <span>RSVP NOW</span>
                  <i className="fas fa-external-link-alt"></i>
                </a>
              )
            ) : (
              <button className="btn btn-disabled rsvp-btn" disabled>
                <span>REGISTRATION CLOSED</span>
              </button>
            )
          )}
        </div>
      </div>

      <style>{`
        .cyber-event-card {
          background: var(--surface);
          border: 1px solid var(--border);
          position: relative;
          display: flex;
          flex-direction: column;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          overflow: hidden;
          height: 100%;
        }

        .cyber-event-card.featured {
          border-color: var(--neon);
          box-shadow: 0 0 25px rgba(209, 255, 0, 0.1);
        }

        .cyber-event-card:hover {
          border-color: var(--neon);
          transform: translateY(-6px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(209, 255, 0, 0.15);
        }

        .card-top-bar {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.01);
        }

        .event-category-badge {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--neon);
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .event-pulse-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--text-secondary);
          letter-spacing: 1px;
        }

        .pulse-light {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--neon);
          box-shadow: 0 0 8px var(--neon);
          animation: pulseGlow 2s infinite ease-in-out;
        }

        .pulse-light.status-ongoing {
          background: #00dcff;
          box-shadow: 0 0 8px #00dcff;
        }

        .pulse-light.status-completed {
          background: #888;
          box-shadow: none;
          animation: none;
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        .event-card-body {
          padding: 28px 24px 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .event-title {
          font-family: var(--font-display);
          font-size: 2.2rem;
          line-height: 1;
          color: #ffffff;
          margin-bottom: 14px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .event-desc {
          font-family: var(--font-body);
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 24px;
          flex-grow: 1;
        }

        .event-meta-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 24px;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: #cccccc;
        }

        .meta-icon {
          color: var(--neon);
          width: 14px;
          text-align: center;
        }

        .event-cover-wrapper {
          width: 100%;
          height: 180px;
          overflow: hidden;
          background: #000000;
          border-bottom: 1px solid var(--border);
        }

        .event-cover-link {
          display: block;
          width: 100%;
          height: 100%;
        }

        .event-cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.85;
          transition: transform 0.4s ease, opacity 0.4s ease;
        }

        .cyber-event-card:hover .event-cover-img {
          transform: scale(1.05);
          opacity: 1;
        }

        .event-title-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .event-title-link:hover .event-title {
          color: var(--neon);
        }

        .event-action-bar {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .detail-btn {
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

        .detail-btn:hover {
          background: rgba(209, 255, 0, 0.1);
          border-color: var(--neon);
          color: var(--neon);
        }

        .rsvp-btn {
          width: 100%;
          padding: 12px 20px;
          font-size: 0.82rem;
          gap: 10px;
          box-sizing: border-box;
        }

        .btn-disabled {
          background: rgba(255, 255, 255, 0.05);
          color: #666666;
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: not-allowed;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
        }
      `}</style>
    </div>
  );
};

export default EventCard;
