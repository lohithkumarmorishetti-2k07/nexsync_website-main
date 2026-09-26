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

const formatDate = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const EventCard = ({ event, isFeatured = false, showRsvp = true }) => {
  if (!event) return null;

  const rawCover = event.coverImage || event.image;
  const coverImage = formatImageUrl(rawCover);
  const eventId = event._id || event.id;
  const rsvp = event.rsvpLink || event.redirectUrl || event.registrationLink || event.rsvpUrl || event.link || "";
  const hasValidRsvp = isValidUrl(rsvp);
  const isInternal = hasValidRsvp && rsvp.trim().startsWith("/");
  const status = event.status || "Upcoming";
  const title = event.title || "UNTITLED EVENT";
  const header = event.eventHeader && event.eventHeader.trim() ? event.eventHeader.trim() : "";

  return (
    <div className={`cyber-event-card ${isFeatured || event.isFeatured ? "featured" : ""}`}>
      {/* TOP BAR: CATEGORY & STATUS */}
      <div className="card-top-bar">
        <span className="event-category-badge">
          {event.category || "TECHNICAL"}
        </span>
        <div className="event-pulse-indicator">
          <span
            className={`pulse-light ${
              status === "Ongoing"
                ? "status-ongoing"
                : status === "Completed"
                ? "status-completed"
                : ""
            }`}
          ></span>
          <span>{status.toUpperCase()}</span>
        </div>
      </div>

      {/* COVER IMAGE WITH ROBUST SCALING */}
      {coverImage && (
        <div className="event-cover-wrapper">
          <Link to={`/events/${eventId}`} className="event-cover-link">
            <img
              src={coverImage}
              alt={title}
              className="event-cover-img"
              loading="lazy"
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

      {/* CARD BODY */}
      <div className="event-card-body">
        {/* EVENT TITLE */}
        {eventId ? (
          <Link to={`/events/${eventId}`} className="event-title-link">
            <h3 className="event-title">{title}</h3>
          </Link>
        ) : (
          <h3 className="event-title">{title}</h3>
        )}

        {/* EVENT HEADER */}
        {header && <p className="event-header-sub">{header}</p>}

        {/* TELEMETRY INFORMATION */}
        <div className="event-meta-grid">
          <div className="meta-row">
            <i className="fas fa-calendar-alt meta-icon"></i>
            <span>
              {event.date ? formatDate(event.date) : "TBD"}
              {event.endDate && event.endDate !== event.date
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

        {/* ACTION BUTTONS: VIEW DETAILS & RSVP NOW */}
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

          {showRsvp &&
            (hasValidRsvp ? (
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
                <span>REG CLOSED</span>
              </button>
            ))}
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
          box-sizing: border-box;
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
          padding: 12px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.02);
          flex-shrink: 0;
        }

        .event-category-badge {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--neon);
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .event-pulse-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 0.7rem;
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

        /* IMAGE SCALING STRATEGY REUSED FROM MEMBERCARD */
        .event-cover-wrapper {
          width: 100%;
          height: 180px;
          position: relative;
          overflow: hidden;
          background: #000000;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .event-cover-link {
          display: block;
          width: 100%;
          height: 100%;
        }

        .event-cover-img {
          width: 100%;
          height: 100%;
          max-width: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          opacity: 0.85;
          transition: transform 0.4s ease, opacity 0.4s ease;
        }

        .cyber-event-card:hover .event-cover-img {
          transform: scale(1.05);
          opacity: 1;
        }

        .event-card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
        }

        .event-title-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .event-title {
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

        .event-title-link:hover .event-title {
          color: var(--neon);
        }

        .event-header-sub {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          line-height: 1.4;
          color: var(--neon);
          margin-bottom: 14px;
          letter-spacing: 0.5px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-word;
          opacity: 0.9;
        }

        .event-meta-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 16px;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: #cccccc;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .meta-icon {
          color: var(--neon);
          width: 14px;
          text-align: center;
          flex-shrink: 0;
        }

        .event-action-bar {
          margin-top: auto;
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .detail-btn, .rsvp-btn {
          flex: 1;
          padding: 9px 12px;
          font-size: 0.75rem;
          gap: 6px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          letter-spacing: 0.8px;
          text-decoration: none;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .detail-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          color: #ffffff;
        }

        .detail-btn:hover {
          background: rgba(209, 255, 0, 0.1);
          border-color: var(--neon);
          color: var(--neon);
        }

        .rsvp-btn {
          background: var(--neon);
          color: #000;
          font-weight: 700;
          border: 1px solid var(--neon);
        }

        .rsvp-btn:hover {
          box-shadow: 0 0 15px var(--neon-glow);
          transform: translateY(-1px);
        }

        .btn-disabled {
          background: rgba(255, 255, 255, 0.04);
          color: #666666;
          border: 1px solid rgba(255, 255, 255, 0.08);
          cursor: not-allowed;
          pointer-events: none;
        }

        @media (max-width: 480px) {
          .event-action-bar {
            flex-direction: column;
          }
          .detail-btn, .rsvp-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default EventCard;
