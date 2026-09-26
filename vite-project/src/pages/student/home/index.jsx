/**
 * NEXSYNC PLATFORM - RESTRUCTURED PRODUCTION RELEASE
 * Architecture: Clean Component Architecture
 * Visualization: Three.js WebGL Interactive Globe
 * Styling: Shared Design System with GPU Acceleration
 */

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import axios from "@/api/axiosInstance";

// Reusable UI Components
import EventCard from "@/components/ui/EventCard";
import ProjectCard from "@/components/ui/ProjectCard";
import MemberCard from "@/components/ui/MemberCard";
import { DOMAIN_DISPLAY_ORDER } from "@/constants/teamConstants";

/* --- 1. UTILITY: SCROLL REVEAL HOOK --- */
const useScrollReveal = (ref, threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, threshold]);
  return isVisible;
};

/* --- 2. 3D COMPONENT: V2X CONNECTIVITY SPHERE --- */
const NetworkGlobe = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.035);

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Core Wireframe
    const geometry = new THREE.IcosahedronGeometry(1.5, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0x1a1a1a,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const sphere = new THREE.Mesh(geometry, material);
    mainGroup.add(sphere);

    // Particle System
    const particleCount = 700;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 7;
    }
    const particlesGeom = new THREE.BufferGeometry();
    particlesGeom.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xd1ff00,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particleMesh = new THREE.Points(particlesGeom, particlesMat);
    mainGroup.add(particleMesh);

    // Network Lines
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xd1ff00,
      transparent: true,
      opacity: 0.04,
    });
    const lineGeo = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.0, 2));
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    mainGroup.add(lines);

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      mainGroup.rotation.y += 0.002;
      mainGroup.rotation.x += 0.0005;
      const time = Date.now() * 0.001;
      lines.scale.setScalar(1 + Math.sin(time) * 0.03);
      particleMesh.rotation.y = -time * 0.05;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      particlesGeom.dispose();
      particlesMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="three-canvas-wrapper" />;
};

/* --- 3. HERO COMPONENT --- */
const Hero = () => (
  <section className="hero-section" id="home">
    <div className="hero-grid">
      <div className="hero-content">
        <div className="status-badge fade-in-up">
          <span className="led-indicator"></span>
          <span>IIIT SRI CITY // R&D NODE</span>
        </div>

        <h1 className="hero-title fade-in-up" style={{ animationDelay: "0.2s" }}>
          NEXSYNC
          <span className="hero-subtitle">SMART MOBILITY CLUB</span>
        </h1>

        <p className="hero-brief fade-in-up" style={{ animationDelay: "0.3s" }}>
          We are the R&D node for autonomous mobility systems at IIIT Sri City.
          Integrating <strong>V2X Protocols</strong>, <strong>Sensor Fusion</strong>, and <strong>Deep Learning</strong> to architect the future of intelligent transportation.
        </p>

        <div className="hero-cta-group fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Link to="/projects" className="btn btn-primary hover-trigger">
            <span>Explore Projects</span>
            <i className="fas fa-arrow-right"></i>
          </Link>
          <Link to="/team" className="btn btn-secondary hover-trigger">
            <span>Command Structure</span>
          </Link>
        </div>

        <div className="hero-metrics fade-in-up" style={{ animationDelay: "0.5s" }}>
          <div className="metric">
            <span className="metric-val">50+</span>
            <span className="metric-label">Active Members</span>
          </div>
          <div className="metric">
            <span className="metric-val">6+</span>
            <span className="metric-label">Innovation Builds</span>
          </div>
          <div className="metric">
            <span className="metric-val">100%</span>
            <span className="metric-label">Open Hardware/Code</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <NetworkGlobe />
        <div className="visual-overlay"></div>
      </div>
    </div>
  </section>
);

/* --- 4. ABOUT COMPONENT --- */
const About = () => {
  const ref = useRef();
  const isVisible = useScrollReveal(ref);

  return (
    <section id="about" ref={ref} className={`content-section ${isVisible ? "visible" : ""}`}>
      <div className="section-header">
        <span className="section-label">01 /// DIRECTIVES</span>
        <h2 className="section-title">Mission Profile</h2>
      </div>

      <div className="contact-hud-grid">
        <div className="event-card featured hover-lift">
          <div className="scan-line"></div>
          <div className="event-status">
            <span className="blink-dot"></span> STATUS: OPERATIONAL
          </div>
          <div className="event-body">
            <h3 className="glitch-text-sm">ABOUT NEXSYNC</h3>
            <p className="event-desc">
              NexSync, the Smart Mobility Club at IIIT Sri City, focuses on integrating vehicular systems with advanced computation. We research V2V/V2I direct communications, LiDAR/Radar sensory perception, UAV telemetry, and embedded neural inference. Our initiatives bridge academia with the mobility ecosystem.
            </p>
            <div className="event-meta">
              <div className="meta-item">
                <i className="fas fa-microchip"></i> SMART AUTONOMOUS MOBILITY
              </div>
              <div className="meta-item highlight">
                <i className="fas fa-network-wired"></i> IIIT SRI CITY RESEARCH NODE
              </div>
            </div>
          </div>
        </div>

        <div className="hud-right-col">
          <div className="event-card compact hover-lift">
            <div className="card-badge" style={{ color: "var(--neon)", borderColor: "var(--neon)" }}>
              MISSION DIRECTIVE
            </div>
            <div className="event-body">
              <h3>OUR MISSION</h3>
              <ul className="bullet-list">
                <li><strong>Innovate</strong> in connected vehicular autonomy and smart traffic management.</li>
                <li><strong>Collaborate</strong> with industry leaders and automotive consortia to deploy real testbeds.</li>
                <li><strong>Educate</strong> through high-intensity workshops, hackathons, and hardware sprints.</li>
              </ul>
            </div>
          </div>

          <div className="event-card compact hover-lift">
            <div className="card-badge">FOUNDATIONAL PRINCIPLES</div>
            <div className="event-body">
              <h3>WHY NEXSYNC?</h3>
              <ul className="bullet-list">
                <li>Hands-on R&D in ROS2, Raspberry Pi Systems, and CAN-bus telemetry.</li>
                <li>Direct exposure to national autonomous driving competitions.</li>
                <li>Comprehensive cross-domain mentorship across AI/ML, Electronics, and UI/UX.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CLUB MENTOR SECTION - SINGLE MEDIUM-SIZED BOX AS PRESCRIBED IN SKETCH & INSTRUCTIONS */}
      <div className="mentor-showcase-card hover-lift">
        <div className="scan-line"></div>
        <div className="mentor-layout-row">
          {/* PHOTO ON LEFT */}
          <div className="mentor-photo-pane">
            <div className="mentor-photo-frame">
              <img
                src="/mentor.jpg"
                alt="Dr. Hrishikesh Venkataraman"
                className="mentor-photo-img"
                loading="lazy"
              />
              <div className="visual-scanline"></div>
              <div className="visual-gradient-vignette"></div>
              <span className="mentor-photo-badge">CLUB MENTOR</span>
              <span className="mentor-node-badge">IIIT SRI CITY</span>
            </div>

            <div className="mentor-photo-caption">
              <h3 className="mentor-caption-name">Dr. Hrishikesh Venkataraman</h3>
              <p className="mentor-caption-title">Professor &amp; Dean (R&amp;D)</p>
              <p className="mentor-caption-affil">IIIT Sri City</p>
              <div className="mentor-rg-tag">
                <i className="fas fa-satellite-dish"></i>
                <span>Smart Transportation RG</span>
              </div>
            </div>
          </div>

          {/* DESCRIPTIVE NARRATIVE CONTENT ON RIGHT */}
          <div className="mentor-content-pane">
            <div className="mentor-content-header">
              <div className="mentor-status-row">
                <span className="card-badge" style={{ color: "var(--neon)", borderColor: "var(--neon)", marginBottom: 0 }}>
                  FACULTY MENTORSHIP &amp; R&amp;D DIRECTIVE
                </span>
                <div className="event-status" style={{ marginBottom: 0 }}>
                  <span className="blink-dot"></span> ADVISORY NODE
                </div>
              </div>
              <h3 className="glitch-text-sm" style={{ marginTop: "12px", marginBottom: "4px" }}>
                DR. HRISHIKESH VENKATARAMAN
              </h3>
              <p className="mentor-header-subtitle">
                Professor &amp; Dean (R&amp;D), IIIT Sri City &bull; Lead, Smart Transportation Research Group
              </p>
            </div>

            <div className="mentor-paragraphs">
              <p className="mentor-narrative-p">
                <strong>Dr. Hrishikesh Venkataraman</strong> serves as Professor and Dean of Research &amp; Development at IIIT Sri City, where he heads the Smart Transportation Research Group. He obtained his Ph.D. in Wireless Communications from <strong>Jacobs University Bremen, Germany (2007)</strong> and earned his Master&apos;s degree from <strong>IIT Kanpur (2004)</strong>. His academic tenure includes prestigious international honors including the <strong>DAAD Fellowship</strong> at TU Dresden, Germany, and the <strong>Irish Research Council Fellowship</strong>.
              </p>
              <p className="mentor-narrative-p">
                Bringing extensive high-impact research and industry experience, Dr. Venkataraman previously served as Senior Researcher at <strong>RINCE National Research Center in Ireland (2008&ndash;2013)</strong> and as Technical Architect in the <strong>CTO Office at Tech Mahindra (2013&ndash;2015)</strong>. His research drives core advancements across Connected and Autonomous Vehicles (CAV), intelligent mobility infrastructure, vehicular networks, and smart city telemetry systems.
              </p>
              <p className="mentor-narrative-p">
                A prolific researcher, Dr. Venkataraman has authored <strong>over 100 peer-reviewed scientific publications</strong> across ACM, IEEE, Springer, Elsevier, and IET. His intellectual property achievements encompass <strong>9 IP assets</strong>, including 1 US Patent, 2 Indian Patents, 6 pending patents, and a registered trademark. As the core faculty mentor for NexSync, he directly guides student-led robotics testbeds, autonomous navigation algorithms, and national autonomous driving challenges.
              </p>
            </div>

            {/* KEY HIGHLIGHTS / CHIPS */}
            <div className="mentor-chips-row">
              <span className="mentor-meta-chip"><i className="fas fa-book-open"></i> 100+ Publications (IEEE / ACM / Springer)</span>
              <span className="mentor-meta-chip"><i className="fas fa-certificate"></i> 9 Patents &amp; IP (1 US, 2 IN, 6 Pending)</span>
              <span className="mentor-meta-chip"><i className="fas fa-satellite-dish"></i> Smart Transportation RG Lead</span>
              <span className="mentor-meta-chip"><i className="fas fa-award"></i> DAAD &amp; IRC Fellow</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* --- 5. EVENTS SUMMARY COMPONENT (HOME ONLY: RECENT & UPCOMING) --- */
const HomeEvents = () => {
  const ref = useRef();
  const isVisible = useScrollReveal(ref);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/events");
      const data = res.data?.data || res.data;
      if (Array.isArray(data) && data.length > 0) {
        setEvents(data);
      } else {
        setEvents(fallbackHomeEvents);
      }
    } catch {
      setEvents(fallbackHomeEvents);
    } finally {
      setLoading(false);
    }
  };

  const fallbackHomeEvents = [
    {
      _id: "evt-01",
      title: "AUTONOMOUS MOBILITY HACKATHON 2026",
      category: "HACKATHON",
      description: "48-hour intensive sprint focused on LiDAR-based object detection, ROS2 navigation stack, and V2X infrastructure integration.",
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      timeRange: "09:00 AM - 06:00 PM IST",
      duration: "48 Hours",
      location: "Main Auditorium, IIIT Sri City",
      registeredCount: 84,
      redirectUrl: "https://unstop.com/hackathons/nexsync-mobility-2026",
    },
    {
      _id: "evt-02",
      title: "SENSOR FUSION & KALMAN FILTERING WORKSHOP",
      category: "EVENT",
      description: "Hands-on tutorial delving into Extended Kalman Filters (EKF) and Unscented Kalman Filters (UKF) for autonomous localization.",
      startDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      timeRange: "02:00 PM - 05:30 PM IST",
      duration: "3.5 Hours",
      location: "Hardware Lab 102, IIIT Sri City",
      registeredCount: 42,
      redirectUrl: "https://forms.google.com/nexsync-sensor-fusion",
    },
  ];

  // PHASE 3 REQUIREMENT: Display ONLY Recent and Upcoming events. Do NOT display full archives.
  const now = new Date();
  const upcomingAndRecent = events.filter((e) => {
    const end = e.endDate ? new Date(e.endDate) : new Date(e.startDate);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return end >= thirtyDaysAgo;
  }).slice(0, 3);

  const displayList = upcomingAndRecent.length > 0 ? upcomingAndRecent : fallbackHomeEvents;

  return (
    <section id="events" ref={ref} className={`content-section ${isVisible ? "visible" : ""}`}>
      <div className="section-header">
        <span className="section-label">02 /// OPERATIONS</span>
        <h2 className="section-title">Upcoming & Recent Events</h2>
      </div>

      {loading ? (
        <div className="loading-placeholder">SYNCHRONIZING EVENT TELEMETRY...</div>
      ) : (
        <>
          <div className="home-cards-grid">
            {displayList.map((event, idx) => (
              <EventCard key={event._id || idx} event={event} isFeatured={idx === 0} showRsvp={true} />
            ))}
          </div>

          <div className="section-cta-container">
            <Link to="/events" className="btn btn-outline-neon hover-trigger">
              <span>View All Events</span>
              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

/* --- 6. PROJECTS SUMMARY COMPONENT (HOME ONLY: ACTIVE PROJECTS) --- */
const HomeProjects = () => {
  const ref = useRef();
  const isVisible = useScrollReveal(ref);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveProjects();
  }, []);

  const fetchActiveProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/projects");
      const data = res.data?.data || res.data;
      if (Array.isArray(data) && data.length > 0) {
        setProjects(data);
      } else {
        setProjects(fallbackHomeProjects);
      }
    } catch {
      setProjects(fallbackHomeProjects);
    } finally {
      setLoading(false);
    }
  };

  const fallbackHomeProjects = [
    {
      projectId: "PRJ-01",
      projectName: "V2X COOPERATIVE PERCEPTION",
      description: "Multi-vehicle telemetry and point-cloud sharing network utilizing 5G C-V2X direct protocol for blind intersection collision avoidance.",
      techStack: ["C++", "ROS2", "5G NR-V2X", "Point Cloud Library"],
      status: "IN PROGRESS",
    },
    {
      projectId: "PRJ-02",
      projectName: "EDGE COMPUTING SMART ROADSIDE UNIT (RSU)",
      description: "Solar-powered IoT edge computing node with dual stereoscopic cameras and embedded Jetson Orin for live road infrastructure monitoring.",
      techStack: ["NVIDIA Jetson", "TensorRT", "YOLOv10", "MQTT", "Python"],
      status: "IN PROGRESS",
    },
  ];

  // PHASE 5 REQUIREMENT: Display ONLY Current Active Projects from Database
  const activeProjects = projects.filter((p) => p.status === "Active" || p.status === "IN PROGRESS");
  const displayProjects = activeProjects.length > 0 ? activeProjects : fallbackHomeProjects;

  return (
    <section id="projects" ref={ref} className={`content-section ${isVisible ? "visible" : ""}`}>
      <div className="section-header">
        <span className="section-label">03 /// R&D BUILDS</span>
        <h2 className="section-title">Active System Builds</h2>
      </div>

      {loading ? (
        <div className="loading-placeholder">QUERYING SYSTEM REPOSITORIES...</div>
      ) : (
        <>
          <div className="home-cards-grid">
            {displayProjects.map((project, idx) => (
              <ProjectCard key={project._id || project.projectId || idx} project={project} />
            ))}
          </div>

          <div className="section-cta-container">
            <Link to="/projects" className="btn btn-outline-neon hover-trigger">
              <span>View All Projects</span>
              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

/* --- 7. TEAM SUMMARY COMPONENT (HOME ONLY: LEADERSHIP - CLUB COORDINATOR & EXECUTIVE MEMBERS ONLY) --- */
const HomeTeam = () => {
  const ref = useRef();
  const isVisible = useScrollReveal(ref);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/team?leadership=true");
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setTeamMembers(data);
      }
    } catch {
      // Keep empty if failed
    } finally {
      setLoading(false);
    }
  };

  // Helper to sort leadership members by domain display order and then name
  const sortMembers = (members) => {
    return [...members].sort((a, b) => {
      const orderA = DOMAIN_DISPLAY_ORDER.indexOf(a.domain);
      const orderB = DOMAIN_DISPLAY_ORDER.indexOf(b.domain);
      const rankA = orderA === -1 ? 999 : orderA;
      const rankB = orderB === -1 ? 999 : orderB;
      if (rankA !== rankB) return rankA - rankB;
      return (a.name || "").localeCompare(b.name || "");
    });
  };

  // STRICT REQUIREMENT: Home Page must display ONLY Club Coordinator and Executive Members.
  // Wing Members and Alumni must NOT be displayed here.
  const leadershipMembers = teamMembers.filter(
    (m) =>
      !m.isArchived &&
      !m.isAlumni &&
      m.role !== "Alumni" &&
      (m.role === "Club Coordinator" ||
        m.role === "Executive Member" ||
        m.memberType === "Club Coordinator" ||
        m.memberType === "Executive Member")
  );

  const clubCoordinators = sortMembers(
    leadershipMembers.filter(
      (m) => m.role === "Club Coordinator" || m.memberType === "Club Coordinator"
    )
  );

  const executiveMembers = sortMembers(
    leadershipMembers.filter(
      (m) => m.role === "Executive Member" || m.memberType === "Executive Member"
    )
  );

  return (
    <section id="team" ref={ref} className={`content-section ${isVisible ? "visible" : ""}`}>
      <div className="section-header">
        <span className="section-label">04 /// PERSONNEL</span>
        <h2 className="section-title">Command Structure</h2>
      </div>

      {loading ? (
        <div className="loading-placeholder">SYNCHRONIZING LEADERSHIP ROSTER...</div>
      ) : clubCoordinators.length === 0 && executiveMembers.length === 0 ? (
        <div className="loading-placeholder">NO LEADERSHIP RECORDS FOUND</div>
      ) : (
        <>
          {/* TIER 01: CLUB COORDINATOR */}
          {clubCoordinators.length > 0 && (
            <div className="team-tier-block" style={{ marginBottom: "40px" }}>
              <h3 className="subsection-header">
                <i className="fas fa-crown"></i> CLUB COORDINATOR
              </h3>
              <div className="home-leads-grid">
                {clubCoordinators.map((member) => (
                  <MemberCard key={member._id} member={member} />
                ))}
              </div>
            </div>
          )}

          {/* TIER 02: EXECUTIVE MEMBERS */}
          {executiveMembers.length > 0 && (
            <div className="team-tier-block" style={{ marginBottom: "40px" }}>
              <h3 className="subsection-header">
                <i className="fas fa-shield-alt"></i> EXECUTIVE MEMBERS
              </h3>
              <div className="home-leads-grid">
                {executiveMembers.map((member) => (
                  <MemberCard key={member._id} member={member} />
                ))}
              </div>
            </div>
          )}

          {/* View Full Team CTA */}
          <div className="section-cta-container">
            <Link to="/team" className="btn btn-outline-neon hover-trigger">
              <span>View Team / Alumni</span>
              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

/* --- 8. CONTACT SECTION COMPONENT --- */
const ContactSection = () => {
  const ref = useRef();
  const isVisible = useScrollReveal(ref);

  return (
    <section id="contact-nexus" ref={ref} className={`content-section ${isVisible ? "visible" : ""}`} style={{ paddingBottom: 0 }}>
      <div className="section-header">
        <span className="section-label">05 /// COMM-LINK</span>
        <h2 className="section-title">Establish Connection</h2>
      </div>

      <div className="contact-hud-grid">
        <div className="hud-panel main hover-lift">
          <div className="panel-decor-corner top-left"></div>
          <div className="panel-decor-corner bottom-right"></div>
          <div className="hud-status">
            <span className="blink-dot"></span> DIRECT COMM CHANNELS OPEN
          </div>
          <h3 className="hud-title">
            READY TO <br />
            <span style={{ color: "var(--neon)" }}>COLLABORATE?</span>
          </h3>
          <p className="hud-text">
            Join the autonomous mobility network. Whether for research sponsorship, technical collaboration, or club inquiries, our communication channels are monitored 24/7.
          </p>
        </div>

        <div className="hud-right-col">
          <div className="hud-card hover-lift hover-trigger">
            <div className="icon-badge">
              <i className="fas fa-satellite"></i>
            </div>
            <div className="card-info">
              <h4>DIRECT INQUIRY</h4>
              <div className="highlight">
                <a href="mailto:nexsyncmotors@club.iiits.in" style={{ color: 'inherit', textDecoration: 'none' }}>
                  nexsyncmotors@club.iiits.in
                </a>
              </div>
              <div className="sub">Response latency: &lt; 24 hours</div>
            </div>
          </div>

          <div className="hud-card hover-lift hover-trigger">
            <div className="icon-badge">
              <i className="fas fa-map-marked-alt"></i>
            </div>
            <div className="card-info">
              <h4>PHYSICAL BASE</h4>
              <div className="highlight">SMART MOBILITY LAB</div>
              <div className="sub">Room 204, Academic Block, IIIT Sri City</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* --- 9. MAIN HOME ROOT COMPONENT --- */
const StudentHomePage = () => {
  return (
    <div className="student-home-wrapper">
      <Hero />
      <About />
      <HomeEvents />
      <HomeProjects />
      <HomeTeam />
      <ContactSection />

      {/* COMPONENT-LEVEL INLINE ENHANCEMENTS */}
      <style>{`
        .student-home-wrapper {
          width: 100%;
        }

        /* HERO */
        .hero-section {
          min-height: 90vh;
          padding: 120px 5% 60px;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          scroll-margin-top: 100px;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          align-items: center;
          gap: 40px;
          z-index: 10;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--neon);
          border: 1px solid var(--neon-dim);
          padding: 6px 14px;
          background: rgba(209, 255, 0, 0.05);
          margin-bottom: 25px;
          letter-spacing: 1.5px;
        }

        .led-indicator {
          width: 6px;
          height: 6px;
          background: var(--neon);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--neon);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: 6.5rem;
          line-height: 0.9;
          margin-bottom: 20px;
          letter-spacing: 2px;
        }

        .hero-subtitle {
          display: block;
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 1.8rem;
          color: var(--text-secondary);
          letter-spacing: 4px;
          margin-top: 8px;
        }

        .hero-brief {
          font-size: 1.1rem;
          color: #cccccc;
          max-width: 540px;
          margin-bottom: 40px;
          line-height: 1.6;
        }

        .hero-cta-group {
          display: flex;
          gap: 16px;
          margin-bottom: 50px;
          flex-wrap: wrap;
        }

        .hero-metrics {
          display: flex;
          gap: 45px;
          border-top: 1px solid var(--border);
          padding-top: 28px;
          flex-wrap: wrap;
        }

        .metric {
          display: flex;
          flex-direction: column;
        }

        .metric-val {
          font-family: var(--font-display);
          font-size: 2.8rem;
          line-height: 1;
          color: #ffffff;
        }

        .metric-label {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--text-secondary);
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-top: 4px;
        }

        .hero-visual {
          position: relative;
          height: 70vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .three-canvas-wrapper {
          width: 100%;
          height: 100%;
        }

        .visual-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 35%;
          background: linear-gradient(to top, var(--bg), transparent);
          pointer-events: none;
        }

        /* SECTION HEADERS & REVEAL */
        .content-section {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.8s var(--ease);
          scroll-margin-top: 110px !important;
        }

        .content-section.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .home-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 30px;
        }

        .section-cta-container {
          margin-top: 48px;
          display: flex;
          justify-content: center;
        }

        .loading-placeholder {
          text-align: center;
          padding: 60px 20px;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--neon);
          letter-spacing: 2px;
        }

        /* TEAM TIERS ON HOME */
        .subsection-header {
          font-family: var(--font-display);
          font-size: 2rem;
          color: white;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 10px;
        }

        .subsection-header i {
          color: var(--neon);
        }

        .home-leads-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 28px;
          align-items: stretch;
        }

        .home-wing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
        }

        .home-alumni-banner {
          margin-top: 40px;
          padding: 28px 32px;
          background: linear-gradient(135deg, rgba(192, 132, 252, 0.05) 0%, rgba(10, 10, 10, 0.95) 100%);
          border: 1px solid rgba(192, 132, 252, 0.25);
          border-left: 3px solid #c084fc;
          position: relative;
        }

        .alumni-banner-badge {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: #c084fc;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
        }

        .alumni-banner-title {
          font-family: var(--font-display);
          font-size: 1.6rem;
          color: #ffffff;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .alumni-banner-desc {
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
          max-width: 800px;
        }

        /* ABOUT / BENTO CARDS */
        .contact-hud-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 36px;
          align-items: stretch;
        }

        .hud-panel {
          background: linear-gradient(135deg, rgba(20, 20, 20, 0.8) 0%, rgba(5, 5, 5, 0.9) 100%);
          border: 1px solid var(--border);
          padding: 40px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .panel-decor-corner {
          position: absolute;
          width: 18px;
          height: 18px;
          border: 2px solid var(--neon);
        }
        .panel-decor-corner.top-left { top: -1px; left: -1px; border-right: none; border-bottom: none; }
        .panel-decor-corner.bottom-right { bottom: -1px; right: -1px; border-left: none; border-top: none; }

        .hud-status {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--neon);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 2px;
        }

        .hud-title {
          font-family: var(--font-display);
          font-size: 3.2rem;
          line-height: 0.95;
          margin-bottom: 18px;
          color: white;
        }

        .hud-text {
          color: var(--text-secondary);
          font-size: 1.05rem;
          line-height: 1.6;
        }

        .hud-right-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .hud-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-left: 2px solid transparent;
          padding: 32px 40px;
          display: flex;
          align-items: center;
          gap: 24px;
          transition: all 0.3s var(--ease);
          flex: 1;
        }

        .hud-card:hover {
          background: rgba(209, 255, 0, 0.04);
          border-color: var(--neon);
          border-left: 4px solid var(--neon);
          transform: translateX(8px);
        }

        .icon-badge {
          width: 64px;
          height: 64px;
          background: #000;
          border: 1px solid var(--border);
          color: var(--neon);
          display: grid;
          place-items: center;
          font-size: 1.6rem;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .card-info h4 {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-secondary);
          letter-spacing: 1px;
          margin-bottom: 6px;
        }

        .card-info .highlight {
          font-family: var(--font-display);
          font-size: 1.8rem;
          color: white;
          line-height: 1;
        }

        .card-info .sub {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: #777;
          margin-top: 4px;
        }

        .event-card {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 36px;
          position: relative;
          overflow: hidden;
          transition: 0.35s;
          display: flex;
          flex-direction: column;
        }

        .event-card.featured {
          background: linear-gradient(145deg, rgba(20,20,20,0.95) 0%, rgba(5,5,5,0.95) 100%);
          border-color: rgba(209, 255, 0, 0.3);
        }

        .event-card:hover {
          background: var(--surface-highlight);
          transform: translateY(-5px);
          border-color: var(--neon);
        }

        .scan-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--neon);
          opacity: 0.5;
          animation: scan 3s linear infinite;
        }

        @keyframes scan {
          0% { top: 0; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        .event-status {
          font-family: var(--font-mono);
          color: #888;
          font-size: 0.75rem;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 1px;
        }

        .blink-dot {
          width: 6px;
          height: 6px;
          background: var(--neon);
          border-radius: 50%;
          animation: blinkDot 1.2s infinite;
        }

        @keyframes blinkDot {
          50% { opacity: 0.2; }
        }

        .glitch-text-sm {
          font-family: var(--font-display);
          font-size: 2.2rem;
          line-height: 1.1;
          margin-bottom: 14px;
        }

        .event-desc {
          font-size: 0.95rem;
          color: #ccc;
          margin-bottom: 24px;
          line-height: 1.55;
        }

        .event-meta {
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .meta-item.highlight {
          color: var(--neon);
        }

        .card-badge {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          padding: 4px 10px;
          border: 1px solid var(--border);
          display: inline-block;
          margin-bottom: 14px;
          color: var(--text-secondary);
          width: fit-content;
        }

        .bullet-list {
          padding-left: 20px;
          margin-top: 10px;
          font-size: 0.9rem;
          color: #bbb;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* CLUB MENTOR MEDIUM-SIZED BOX SHOWCASE */
        .mentor-showcase-card {
          background: linear-gradient(145deg, rgba(16, 16, 16, 0.95) 0%, rgba(6, 6, 6, 0.98) 100%);
          border: 1px solid var(--border);
          padding: 28px;
          margin-top: 32px;
          position: relative;
          overflow: hidden;
          transition: all 0.35s var(--ease);
        }

        .mentor-showcase-card:hover {
          border-color: var(--neon);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(209, 255, 0, 0.12);
        }

        .mentor-layout-row {
          display: flex;
          gap: 32px;
          align-items: stretch;
        }

        .mentor-photo-pane {
          width: 250px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
        }

        .mentor-photo-frame {
          width: 100%;
          height: 250px;
          position: relative;
          overflow: hidden;
          background: #080808;
          border: 1px solid var(--border);
          border-radius: 2px;
          margin-bottom: 14px;
          flex-shrink: 0;
        }

        .mentor-photo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 15%;
          display: block;
          filter: grayscale(10%) contrast(1.06) brightness(0.96);
          transition: all 0.4s ease-out;
        }

        .mentor-showcase-card:hover .mentor-photo-img {
          filter: grayscale(0%) contrast(1) brightness(1.04);
          transform: scale(1.03);
        }

        .mentor-photo-badge {
          position: absolute;
          bottom: 10px;
          left: 10px;
          background: rgba(0, 0, 0, 0.88);
          color: var(--neon);
          font-family: var(--font-mono);
          font-size: 0.62rem;
          padding: 3px 8px;
          border: 1px solid rgba(209, 255, 0, 0.35);
          border-radius: 2px;
          letter-spacing: 1px;
          text-transform: uppercase;
          z-index: 4;
        }

        .mentor-node-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          font-family: var(--font-mono);
          font-size: 0.58rem;
          padding: 2px 6px;
          border-radius: 2px;
          letter-spacing: 1px;
          font-weight: 700;
          z-index: 4;
          text-transform: uppercase;
          background: rgba(209, 255, 0, 0.15);
          color: var(--neon);
          border: 1px solid rgba(209, 255, 0, 0.4);
        }

        .mentor-photo-caption {
          display: flex;
          flex-direction: column;
        }

        .mentor-caption-name {
          font-family: var(--font-display);
          font-size: 1.35rem;
          line-height: 1.15;
          color: #ffffff;
          margin-bottom: 3px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          transition: color 0.3s;
        }

        .mentor-showcase-card:hover .mentor-caption-name {
          color: var(--neon);
        }

        .mentor-caption-title {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: var(--neon);
          letter-spacing: 1px;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 2px;
        }

        .mentor-caption-affil {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: #aaaaaa;
          letter-spacing: 0.8px;
          margin-bottom: 10px;
        }

        .mentor-rg-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--neon);
          background: rgba(209, 255, 0, 0.08);
          border: 1px solid rgba(209, 255, 0, 0.25);
          padding: 4px 8px;
          border-radius: 2px;
          width: fit-content;
        }

        .mentor-content-pane {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .mentor-content-header {
          margin-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding-bottom: 12px;
        }

        .mentor-status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .mentor-header-subtitle {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--text-secondary);
          letter-spacing: 0.5px;
          margin-top: 4px;
        }

        .mentor-paragraphs {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .mentor-narrative-p {
          font-family: var(--font-body);
          font-size: 0.88rem;
          line-height: 1.65;
          color: #d1d5db;
          margin: 0;
          letter-spacing: 0.2px;
        }

        .mentor-narrative-p strong {
          color: #ffffff;
        }

        .mentor-chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .mentor-meta-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: #d4d4d8;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          padding: 5px 10px;
          border-radius: 2px;
          letter-spacing: 0.5px;
          transition: all 0.25s ease;
        }

        .mentor-meta-chip i {
          color: var(--neon);
          font-size: 0.75rem;
        }

        .mentor-meta-chip:hover {
          border-color: rgba(209, 255, 0, 0.35);
          background: rgba(209, 255, 0, 0.05);
          color: #ffffff;
        }

        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .hero-visual {
            height: 45vh;
            order: -1;
          }
          .hero-title {
            font-size: 4.5rem;
          }
          .hero-cta-group, .hero-metrics {
            justify-content: center;
          }
          .contact-hud-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .mentor-layout-row {
            flex-direction: column;
            gap: 20px;
          }
          .mentor-photo-pane {
            width: 100%;
            flex-direction: row;
            gap: 20px;
            align-items: center;
          }
          .mentor-photo-frame {
            width: 180px;
            height: 190px;
            margin-bottom: 0;
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 3.5rem;
          }
          .home-cards-grid {
            grid-template-columns: 1fr;
          }
          .home-leads-grid, .home-wing-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .mentor-photo-pane {
            flex-direction: column;
            align-items: flex-start;
          }
          .mentor-photo-frame {
            width: 100%;
            height: 240px;
            margin-bottom: 12px;
          }
          .mentor-showcase-card {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentHomePage;
