import React, { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const cursorDotRef = useRef(null);
  const cursorCircleRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  // Physics-based cursor (Lerp) only on devices with fine pointer
  useEffect(() => {
    // Check if device supports hover and pointer
    const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isFinePointer) return;

    let mouseX = 0;
    let mouseY = 0;
    let circleX = 0;
    let circleY = 0;
    let animId;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const render = () => {
      circleX += (mouseX - circleX) * 0.15;
      circleY += (mouseY - circleY) * 0.15;
      if (cursorCircleRef.current) {
        cursorCircleRef.current.style.transform = `translate3d(${circleX}px, ${circleY}px, 0)`;
      }
      animId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    animId = requestAnimationFrame(render);

    const onMouseEnter = () => setIsHovering(true);
    const onMouseLeave = () => setIsHovering(false);

    // Dynamic hover detection for triggers
    const attachHoverTriggers = () => {
      const triggers = document.querySelectorAll("a, button, .hover-trigger, .clickable");
      triggers.forEach((el) => {
        el.addEventListener("mouseenter", onMouseEnter);
        el.addEventListener("mouseleave", onMouseLeave);
      });
      return triggers;
    };

    let triggers = attachHoverTriggers();
    const observer = new MutationObserver(() => {
      triggers.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnter);
        el.removeEventListener("mouseleave", onMouseLeave);
      });
      triggers = attachHoverTriggers();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animId);
      observer.disconnect();
      triggers.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnter);
        el.removeEventListener("mouseleave", onMouseLeave);
      });
    };
  }, []);

  return (
    <div className="app-root">
      <ScrollToTop />

      {/* CURSOR LAYERS */}
      <div ref={cursorDotRef} className="cursor-dot"></div>
      <div
        ref={cursorCircleRef}
        className={`cursor-circle ${isHovering ? "expanded" : ""}`}
      ></div>

      {/* NOISE OVERLAY */}
      <div className="noise-texture"></div>

      {/* FIXED NAVBAR */}
      <Navbar />

      {/* MAIN CONTENT AREA */}
      <main className={`main-content-flow ${isHome ? "home-content-flow" : "subpage-content-flow"}`}>{children}</main>

      {/* FOOTER */}
      <Footer />

      <style>{`
        .app-root {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--bg);
          color: var(--text);
        }

        .main-content-flow {
          flex: 1 0 auto;
          width: 100%;
        }

        .noise-texture {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9000;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        /* CURSOR */
        .cursor-dot {
          position: fixed;
          width: 6px;
          height: 6px;
          background: var(--neon);
          border-radius: 50%;
          pointer-events: none;
          z-index: 10000;
          top: 0;
          left: 0;
          margin: -3px 0 0 -3px;
          display: none;
        }

        .cursor-circle {
          position: fixed;
          width: 36px;
          height: 36px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          top: 0;
          left: 0;
          margin: -18px 0 0 -18px;
          transition: width 0.25s var(--ease), height 0.25s var(--ease), background 0.25s, border-color 0.25s;
          mix-blend-mode: difference;
          display: none;
        }

        .cursor-circle.expanded {
          width: 72px;
          height: 72px;
          margin: -36px 0 0 -36px;
          background: rgba(209, 255, 0, 0.15);
          border-color: var(--neon);
        }

        @media (hover: hover) and (pointer: fine) {
          .cursor-dot, .cursor-circle {
            display: block;
          }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
