import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";
import { canViewAdmin } from "@/utils/rbac";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { auth, handleLogout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll listener with passive flag
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogoutClick = () => {
    handleLogout();
    navigate("/auth");
  };

  const handleNavClick = (e, targetHash) => {
    if (location.pathname === "/") {
      if (targetHash) {
        e.preventDefault();
        const element = document.querySelector(targetHash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        } else if (targetHash === "#home") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    } else {
      if (targetHash) {
        navigate(`/${targetHash}`);
      }
    }
    setMobileMenuOpen(false);
  };

  const isCurrent = (path) => location.pathname === path;

  return (
    <>
      <nav className={`main-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          {/* BRAND LOGO */}
          <Link to="/" className="nav-brand hover-trigger" onClick={(e) => handleNavClick(e, "#home")}>
            NEX<span className="brand-accent">SYNC</span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="nav-menu-desktop">
            <Link
              to="/"
              className={`nav-link hover-trigger ${isCurrent("/") ? "active" : ""}`}
              onClick={(e) => handleNavClick(e, "#home")}
            >
              Home
            </Link>
            <a
              href="#about"
              className="nav-link hover-trigger"
              onClick={(e) => handleNavClick(e, "#about")}
            >
              About
            </a>
            <Link
              to="/events"
              className={`nav-link hover-trigger ${isCurrent("/events") ? "active" : ""}`}
            >
              Events
            </Link>
            <Link
              to="/projects"
              className={`nav-link hover-trigger ${isCurrent("/projects") ? "active" : ""}`}
            >
              Projects
            </Link>
            <Link
              to="/team"
              className={`nav-link hover-trigger ${isCurrent("/team") ? "active" : ""}`}
            >
              Team
            </Link>
            <a
              href="#contact-nexus"
              className="nav-link hover-trigger"
              onClick={(e) => handleNavClick(e, "#contact-nexus")}
            >
              Contact
            </a>

            {auth?.authenticated ? (
              <>
                {canViewAdmin(auth?.user) && (
                  <Link
                    to="/admin"
                    className={`nav-link hover-trigger ${isCurrent("/admin") ? "active" : ""}`}
                    style={{ color: "#d1ff00" }}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogoutClick}
                  className="nav-link hover-trigger logout-nav-btn"
                  title="Sign Out"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className={`nav-link hover-trigger ${isCurrent("/auth") ? "active" : ""}`}
                style={{ color: "var(--neon)" }}
              >
                Login
              </Link>
            )}
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <button
            className={`mobile-toggle ${mobileMenuOpen ? "open" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {mobileMenuOpen && (
          <div className="nav-menu-mobile">
            <Link
              to="/"
              className={`mobile-link ${isCurrent("/") ? "active" : ""}`}
              onClick={(e) => handleNavClick(e, "#home")}
            >
              Home
            </Link>
            <a
              href="#about"
              className="mobile-link"
              onClick={(e) => handleNavClick(e, "#about")}
            >
              About
            </a>
            <Link
              to="/events"
              className={`mobile-link ${isCurrent("/events") ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              to="/projects"
              className={`mobile-link ${isCurrent("/projects") ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Projects
            </Link>
            <Link
              to="/team"
              className={`mobile-link ${isCurrent("/team") ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Team
            </Link>
            <a
              href="#contact-nexus"
              className="mobile-link"
              onClick={(e) => handleNavClick(e, "#contact-nexus")}
            >
              Contact
            </a>

            {auth?.authenticated ? (
              <>
                {canViewAdmin(auth?.user) && (
                  <Link
                    to="/admin"
                    className="mobile-link"
                    style={{ color: "#d1ff00" }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Hub
                  </Link>
                )}
                <button
                  onClick={handleLogoutClick}
                  className="mobile-link logout-mobile"
                >
                  Logout ({auth?.user?.name || auth?.user?.userName || "Member"})
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className={`mobile-link ${isCurrent("/auth") ? "active" : ""}`}
                style={{ color: "var(--neon)" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Member Login
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* COMPONENT STYLES */}
      <style>{`
        .main-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 1000;
          box-sizing: border-box;
          transition: background-color 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease, padding 0.3s ease;
          padding: 24px 5%;
          background: transparent;
        }

        .main-navbar.scrolled {
          background: rgba(5, 5, 5, 0.85);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          padding: 14px 5%;
          border-bottom: 1px solid var(--border);
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .nav-brand {
          font-family: var(--font-display);
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: 1px;
          color: #ffffff;
          line-height: 1;
        }

        .brand-accent {
          color: var(--neon);
        }

        .nav-menu-desktop {
          display: flex;
          align-items: center;
          gap: 32px;
          background: rgba(255, 255, 255, 0.03);
          padding: 10px 32px;
          border-radius: 100px;
          border: 1px solid var(--border);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .nav-link {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: var(--text-secondary);
          transition: color 0.25s ease;
          position: relative;
          background: transparent;
          border: none;
          padding: 4px 0;
        }

        .nav-link:hover, .nav-link.active {
          color: #ffffff;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0%;
          height: 2px;
          background: var(--neon);
          transition: width 0.3s var(--ease);
        }

        .nav-link:hover::after, .nav-link.active::after {
          width: 100%;
        }

        .logout-nav-btn {
          color: #ff6b6b !important;
          margin-left: 8px;
        }

        .logout-nav-btn::after {
          background: #ff6b6b !important;
        }

        /* Mobile Hamburger */
        .mobile-toggle {
          display: none;
          flex-direction: column;
          justify-content: space-between;
          width: 28px;
          height: 20px;
          background: transparent;
          border: none;
          padding: 0;
          z-index: 1002;
        }

        .hamburger-line {
          width: 100%;
          height: 2px;
          background-color: var(--neon);
          transition: all 0.3s ease;
        }

        .mobile-toggle.open .hamburger-line:nth-child(1) {
          transform: translateY(9px) rotate(45deg);
        }

        .mobile-toggle.open .hamburger-line:nth-child(2) {
          opacity: 0;
        }

        .mobile-toggle.open .hamburger-line:nth-child(3) {
          transform: translateY(-9px) rotate(-45deg);
        }

        /* Mobile Menu */
        .nav-menu-mobile {
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: rgba(10, 10, 10, 0.96);
          border-bottom: 1px solid var(--border-bright);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 24px 6%;
          margin: 14px -5% -14px;
          animation: fadeIn 0.25s ease;
        }

        .mobile-link {
          font-family: var(--font-mono);
          font-size: 1rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: color 0.2s;
          background: transparent;
          border-left: none;
          border-right: none;
          border-top: none;
          text-align: left;
        }

        .mobile-link:hover, .mobile-link.active {
          color: var(--neon);
          padding-left: 8px;
        }

        .logout-mobile {
          color: #ff6b6b;
        }

        @media (max-width: 1024px) {
          .nav-menu-desktop {
            display: none;
          }
          .mobile-toggle {
            display: flex;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
