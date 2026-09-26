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

const EventCard = ({ event, isFeatured = false }) => {
  if (!event) return null;

  const rawCover = event.coverImage || event.image;
  const coverImage = formatImageUrl(rawCover);
  const eventId = event._id || event.id;
  const headerText = (event.eventHeader && event.eventHeader.trim()) || event.title || "UNTITLED EVENT";

  return (
    <div className={`cyber-event-card ${isFeatured || event.isFeatured ? "featured" : ""}`}>
      {coverImage && (
        <div className="event-cover-wrapper">
          <Link to={`/events/${eventId}`} className="event-cover-link">
            <img
              src={coverImage}
              alt={headerText}
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
            <h3 className="event-title event-header-clamped">{headerText}</h3>
          </Link>
        ) : (
          <h3 className="event-title event-header-clamped">{headerText}</h3>
        )}

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

        .event-card-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .event-title.event-header-clamped {
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
      `}</style>
    </div>
  );
};

export default EventCard;
