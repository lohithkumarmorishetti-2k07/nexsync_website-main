import React, { useState } from "react";

/**
 * Helper to extract YouTube video ID from various URL patterns
 */
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0&modestbranding=1` : null;
};

/**
 * Helper to extract Vimeo video ID
 */
const getVimeoEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : null;
};

const VideoPlayer = ({ url, title = "Video Stream", poster }) => {
  const [loadError, setLoadError] = useState(false);

  if (!url || !url.trim()) return null;

  const trimmedUrl = url.trim();
  const ytUrl = getYouTubeEmbedUrl(trimmedUrl);
  const vimeoUrl = getVimeoEmbedUrl(trimmedUrl);

  return (
    <div className="nexsync-video-wrapper">
      <style>{`
        .nexsync-video-wrapper {
          position: relative;
          width: 100%;
          background: #080808;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-left: 3px solid var(--neon, #d1ff00);
          overflow: hidden;
          margin: 20px 0;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        }

        .video-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          color: var(--neon, #d1ff00);
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .video-telemetry-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .video-rec-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ff4444;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .video-aspect-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #000;
        }

        .video-aspect-container iframe,
        .video-aspect-container video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
          object-fit: cover;
        }

        .video-error-fallback {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #ff5555;
          font-family: var(--font-mono, monospace);
          font-size: 0.85rem;
          gap: 10px;
          padding: 20px;
          text-align: center;
        }

        .video-error-fallback a {
          color: var(--neon, #d1ff00);
          text-decoration: underline;
        }
      `}</style>

      <div className="video-header-bar">
        <div className="video-telemetry-indicator">
          <span className="video-rec-dot"></span>
          <span>VIDEO TELEMETRY STREAM</span>
        </div>
        <span style={{ color: "#888" }}>{title}</span>
      </div>

      <div className="video-aspect-container">
        {loadError ? (
          <div className="video-error-fallback">
            <span>⚠️ Unable to embed video stream directly.</span>
            <a href={trimmedUrl} target="_blank" rel="noopener noreferrer">
              Open media link in new window ↗
            </a>
          </div>
        ) : ytUrl ? (
          <iframe
            src={ytUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onError={() => setLoadError(true)}
          />
        ) : vimeoUrl ? (
          <iframe
            src={vimeoUrl}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            onError={() => setLoadError(true)}
          />
        ) : (
          <video
            controls
            playsInline
            preload="metadata"
            poster={poster}
            onError={() => setLoadError(true)}
          >
            <source src={trimmedUrl} />
            Your browser does not support HTML5 video streaming.
          </video>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
