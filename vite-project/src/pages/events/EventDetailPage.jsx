import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "@/api/axiosInstance";
import VideoPlayer from "@/components/ui/VideoPlayer";
import { isValidUrl } from "@/components/ui/EventCard";
import { formatImageUrl, getDriveFallbackUrl } from "@/utils/imageUrl";

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModalImage, setActiveModalImage] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`/api/events/${id}`);
        if (res.data?.success && res.data?.data) {
          setEvent(res.data.data);
        } else {
          setError("Event record could not be retrieved.");
        }
      } catch (err) {
        console.error("Fetch event error:", err);
        setError(err.response?.data?.message || "Event not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="event-detail-loading-container">
        <div className="telemetry-spinner"></div>
        <p className="loading-text">RETRIEVING EVENT TELEMETRY // NODE: {id}</p>
        <style>{`
          .event-detail-loading-container {
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

  if (error || !event) {
    return (
      <div className="event-detail-error-container">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">EVENT NOT FOUND</h2>
          <p className="error-msg">{error || "Requested event does not exist or has been decommissioned."}</p>
          <button onClick={() => navigate("/events")} className="btn btn-primary">
            <span>RETURN TO EVENTS DIRECTORY</span>
            <i className="fas fa-arrow-left"></i>
          </button>
        </div>
        <style>{`
          .event-detail-error-container {
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

  const rawCover = event.coverImage || event.image;
  const cover = formatImageUrl(rawCover);
  const rsvp = event.rsvpLink || event.redirectUrl;
  const hasValidRsvp = isValidUrl(rsvp);
  const isInternal = hasValidRsvp && rsvp.trim().startsWith("/");
  const status = event.status || "Upcoming";
  const gallery = Array.isArray(event.galleryImages)
    ? event.galleryImages.map((g) => formatImageUrl(g)).filter(Boolean)
    : [];

  return (
    <div className="event-detail-page">
      {/* NAVIGATION CRUMBS */}
      <div className="detail-nav-crumb">
        <Link to="/events" className="crumb-back-link">
          <i className="fas fa-chevron-left"></i>
          <span>ALL EVENTS</span>
        </Link>
        <span className="crumb-separator">/</span>
        <span className="crumb-current">{event.title}</span>
      </div>

      {/* HEADER SECTION */}
      <div className="detail-hero-header">
        <div className="hero-top-badges">
          <span className="event-type-pill">{event.eventType || "EVENT"}</span>
          <div className="status-pill">
            <span className={`status-dot dot-${status.toLowerCase()}`}></span>
            <span>{status.toUpperCase()}</span>
          </div>
        </div>

        <h1 className="event-main-title">{event.title}</h1>
        {event.eventHeader && (
          <p className="detail-header-subtitle">{event.eventHeader}</p>
        )}

        {event.organizer && (
          <div className="event-organizer-row">
            <i className="fas fa-shield-alt organizer-icon"></i>
            <span>ORGANIZED BY: <strong style={{ color: "#ffffff" }}>{event.organizer}</strong></span>
          </div>
        )}
      </div>

      {/* COVER BANNER (IF AVAILABLE) */}
      {cover && (
        <div className="detail-cover-wrapper">
          <img
            src={cover}
            alt={event.title}
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

      {/* TWO COLUMN GRID: TELEMETRY + CONTENT */}
      <div className="detail-content-grid">
        {/* MAIN BODY */}
        <div className="detail-main-column">
          <div className="content-card">
            <h3 className="section-title">
              <i className="fas fa-file-alt title-icon"></i>
              OPERATIONAL BRIEFING & DETAILS
            </h3>
            <p className="detail-description-text">{event.description}</p>
          </div>

          {/* VIDEO MEDIA SECTION */}
          {event.videoUrl && (
            <div className="content-card video-section">
              <h3 className="section-title">
                <i className="fas fa-play-circle title-icon"></i>
                EVENT RECORDING & MEDIA STREAM
              </h3>
              <VideoPlayer
                url={event.videoUrl}
                title={`${event.title} // Session Stream`}
                poster={cover}
              />
            </div>
          )}

          {/* GALLERY SECTION (STRICTLY OMITTED IF EMPTY) */}
          {gallery.length > 0 && (
            <div className="content-card gallery-section">
              <h3 className="section-title">
                <i className="fas fa-images title-icon"></i>
                EVENT GALLERY // CAPTURES ({gallery.length})
              </h3>
              <p className="gallery-caption">
                Visual telemetry and field documentation captured during this session. Click to expand.
              </p>
              <div className="event-gallery-grid">
                {gallery.map((imgUrl, index) => (
                  <div
                    key={index}
                    className="gallery-grid-item"
                    onClick={() => setActiveModalImage(imgUrl)}
                  >
                    <img
                      src={imgUrl}
                      alt={`Event capture ${index + 1}`}
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

        {/* SIDEBAR TELEMETRY */}
        <div className="detail-sidebar-column">
          <div className="telemetry-card">
            <h3 className="sidebar-title">EVENT TELEMETRY</h3>

            <div className="telemetry-list">
              <div className="telemetry-item">
                <i className="fas fa-calendar-alt item-icon"></i>
                <div className="item-content">
                  <span className="item-label">DATE TIMELINE</span>
                  <span className="item-val">
                    {formatDate(event.startDate)}
                    {event.endDate && event.endDate !== event.startDate
                      ? ` - ${formatDate(event.endDate)}`
                      : ""}
                  </span>
                </div>
              </div>

              {event.timeRange && (
                <div className="telemetry-item">
                  <i className="fas fa-clock item-icon"></i>
                  <div className="item-content">
                    <span className="item-label">TIME WINDOW</span>
                    <span className="item-val">{event.timeRange}</span>
                  </div>
                </div>
              )}

              {event.duration && (
                <div className="telemetry-item">
                  <i className="fas fa-hourglass-half item-icon"></i>
                  <div className="item-content">
                    <span className="item-label">SESSION DURATION</span>
                    <span className="item-val">{event.duration}</span>
                  </div>
                </div>
              )}

              {event.location && (
                <div className="telemetry-item">
                  <i className="fas fa-map-marker-alt item-icon"></i>
                  <div className="item-content">
                    <span className="item-label">VENUE / LOCATION</span>
                    <span className="item-val">{event.location}</span>
                  </div>
                </div>
              )}

              {event.registrationDeadline && (
                <div className="telemetry-item">
                  <i className="fas fa-bell item-icon"></i>
                  <div className="item-content">
                    <span className="item-label">REGISTRATION DEADLINE</span>
                    <span className="item-val">{formatDate(event.registrationDeadline)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* RSVP ACTION */}
            <div className="sidebar-action-wrap">
              {hasValidRsvp ? (
                isInternal ? (
                  <Link to={rsvp.trim()} className="btn btn-primary action-cta hover-trigger">
                    <span>RSVP NOW</span>
                    <i className="fas fa-external-link-alt"></i>
                  </Link>
                ) : (
                  <a
                    href={rsvp.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary action-cta hover-trigger"
                  >
                    <span>RSVP NOW</span>
                    <i className="fas fa-external-link-alt"></i>
                  </a>
                )
              ) : (
                <button className="btn btn-disabled action-cta" disabled>
                  <span>REGISTRATION CLOSED</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate("/events")}
                className="btn btn-secondary return-cta"
              >
                <i className="fas fa-arrow-left"></i>
                <span>BACK TO DIRECTORY</span>
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
        .event-detail-page {
          max-width: 1240px;
          margin: 0 auto;
          padding: 110px 24px 80px;
          color: #ffffff;
        }

        @media (max-width: 768px) {
          .event-detail-page {
            padding: 95px 16px 60px;
          }
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
        }

        .event-type-pill {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--neon);
          background: rgba(209, 255, 0, 0.08);
          border: 1px solid rgba(209, 255, 0, 0.3);
          padding: 4px 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          padding: 4px 10px;
          letter-spacing: 1px;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--neon);
        }

        .dot-ongoing {
          background: #00dcff;
          box-shadow: 0 0 8px #00dcff;
        }

        .dot-completed {
          background: #888888;
        }

        .event-main-title {
          font-family: var(--font-display);
          font-size: clamp(2rem, 4vw, 3.2rem);
          line-height: 1.05;
          color: #ffffff;
          margin-bottom: 14px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .detail-header-subtitle {
          font-family: var(--font-body);
          font-size: 1.15rem;
          color: var(--neon);
          margin-bottom: 16px;
          line-height: 1.5;
          letter-spacing: 0.3px;
        }

        .event-organizer-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--text-secondary);
          letter-spacing: 0.5px;
        }

        .organizer-icon {
          color: var(--neon);
        }

        .detail-cover-wrapper {
          width: 100%;
          height: clamp(260px, 45vw, 460px);
          overflow: hidden;
          background: #080808;
          border: 1px solid var(--border);
          margin-bottom: 36px;
          position: relative;
        }

        .detail-cover-img {
          width: 100%;
          height: 100%;
          max-width: 100%;
          object-fit: cover;
          object-position: center;
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

        .gallery-caption {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        .event-gallery-grid {
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

        .action-cta {
          width: 100%;
          padding: 14px 20px;
          font-size: 0.85rem;
          box-sizing: border-box;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
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

export default EventDetailPage;
