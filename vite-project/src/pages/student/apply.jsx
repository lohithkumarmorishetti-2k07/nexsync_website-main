import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../api/axiosInstance';
import { AuthContext } from '../../context/auth-context';

const ApplyPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useContext(AuthContext);

  const [projectName, setProjectName] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', rollNumber: '', instituteEmail: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const formCardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!auth?.authenticated) {
      navigate('/auth');
      return;
    }
  }, [auth, navigate]);

  // Extract project name from navigation state
  useEffect(() => {
    const name = location.state?.projectName;
    if (name) {
      console.log("✅ Project Name received from home page:", name);
      setProjectName(name);
    } else {
      console.log("⚠️ No project name in location state, projectName empty");
      console.log("   location.state:", location.state);
    }
  }, [location]);

  // Track mouse position for border glow effect
  const handleMouseMove = (e) => {
    if (formCardRef.current) {
      const rect = formCardRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      projectId: projectId || 'unknown',
      projectName: projectName || 'Unknown',
      name: form.name,
      phone: form.phone,
      rollNumber: form.rollNumber,
      instituteEmail: form.instituteEmail,
    };

    console.log("📤 Submitting application with payload:", payload);

    try {
      setLoading(true);
      const res = await axios.post('/api/applications/apply', payload);
      console.log("✅ Application submitted successfully:", res.data);
      setLoading(false);
      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      setLoading(false);
      console.error("❌ Error submitting application:", err);
      setError(err.response?.data?.message || 'Error submitting application');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 150,
        damping: 20,
      },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 20,
      },
    },
    hover: {
      y: -5,
      transition: { duration: 0.3 },
    },
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.5 + index * 0.08,
        type: 'spring',
        stiffness: 120,
        damping: 15,
      },
    }),
  };

  const buttonContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.9,
        staggerChildren: 0.1,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 },
  };

  const alertVariants = {
    initial: { opacity: 0, y: -20, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 120,
        damping: 15,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="apply-page-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Teko:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        :root {
          --neon: #d1ff00;
          --neon-dim: rgba(209, 255, 0, 0.15);
          --neon-glow: rgba(209, 255, 0, 0.3);
          --bg: #050505;
          --surface: #0a0a0a;
          --surface-highlight: #111111;
          --border: rgba(255, 255, 255, 0.1);
          --text: #ffffff;
          --text-secondary: #888888;
          --font-display: 'Teko', sans-serif;
          --font-body: 'Space Grotesk', sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
          --ease: cubic-bezier(0.23, 1, 0.32, 1);
        }

        * { box-sizing: border-box; }
        body { background: var(--bg); color: var(--text); font-family: var(--font-body); }
        
        .apply-page-root {
          min-height: 100vh;
          background: var(--bg);
          padding: 140px 5% 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        /* Animated background glow */
        .apply-page-root::before {
          content: '';
          position: fixed;
          top: 50%;
          left: 50%;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(209, 255, 0, 0.05) 0%, transparent 70%);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 0;
          animation: float-glow 8s ease-in-out infinite;
        }

        @keyframes float-glow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-48%, -48%) scale(1.1); }
        }

        .apply-container {
          width: 100%;
          max-width: 700px;
          position: relative;
          z-index: 1;
        }

        .apply-header {
          margin-bottom: 50px;
          border-left: 3px solid var(--neon);
          padding-left: 30px;
          position: relative;
        }

        .apply-header h1 {
          font-family: var(--font-display);
          font-size: 4rem;
          line-height: 1;
          margin-bottom: 15px;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 2px;
          position: relative;
        }

        /* Animated accent line */
        .apply-header::before {
          content: '';
          position: absolute;
          left: -3px;
          top: 0;
          width: 3px;
          height: 0;
          background: linear-gradient(to bottom, var(--neon), transparent);
          animation: accent-grow 1.2s var(--ease) forwards;
          animation-delay: 0.2s;
        }

        @keyframes accent-grow {
          from { height: 0; }
          to { height: 60px; }
        }

        .project-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--neon);
          border: 1px solid var(--neon-dim);
          padding: 6px 12px;
          background: rgba(209, 255, 0, 0.05);
          margin-bottom: 30px;
          text-transform: uppercase;
          letter-spacing: 2px;
          position: relative;
          overflow: hidden;
        }

        .project-badge::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(209, 255, 0, 0.2), transparent);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .project-badge-dot {
          width: 6px;
          height: 6px;
          background: var(--neon);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--neon), 0 0 16px var(--neon-glow);
          animation: pulse-glow 2s ease-in-out infinite;
          position: relative;
          z-index: 1;
        }

        @keyframes pulse-glow {
          0%, 100% { 
            opacity: 1;
            box-shadow: 0 0 8px var(--neon), 0 0 16px var(--neon-glow);
          }
          50% { 
            opacity: 0.7;
            box-shadow: 0 0 12px var(--neon), 0 0 24px var(--neon-glow);
          }
        }

        .apply-card {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 40px;
          position: relative;
          overflow: hidden;
          transition: all 0.4s var(--ease);
          backdrop-filter: blur(10px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        /* Glassmorphism gradient overlay */
        .apply-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(209, 255, 0, 0.02) 100%);
          pointer-events: none;
        }

        /* Border glow effect on hover */
        .apply-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 0;
          padding: 1px;
          background: linear-gradient(90deg, transparent, var(--neon), transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.4s var(--ease);
          pointer-events: none;
        }

        .apply-card:hover {
          transform: translateY(-5px);
          border-color: var(--neon);
          background: var(--surface-highlight);
          box-shadow: 0 25px 80px rgba(209, 255, 0, 0.1);
        }

        .apply-card:hover::after {
          opacity: 1;
          animation: border-flow 2s linear infinite;
        }

        @keyframes border-flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .form-group {
          margin-bottom: 25px;
          position: relative;
        }

        .form-group.focused .form-input {
          border-color: var(--neon);
          background: rgba(209, 255, 0, 0.08);
          box-shadow: 0 0 20px rgba(209, 255, 0, 0.2);
        }

        .form-label {
          display: block;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: color 0.3s var(--ease);
        }

        .form-group.focused .form-label {
          color: var(--neon);
        }

        .form-input {
          width: 100%;
          padding: 12px 15px;
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text);
          font-family: var(--font-body);
          font-size: 1rem;
          transition: all 0.3s var(--ease);
          outline: none;
          position: relative;
          z-index: 1;
        }

        .form-input:hover {
          border-color: rgba(209, 255, 0, 0.3);
          background: rgba(209, 255, 0, 0.02);
        }

        .form-input:focus {
          border-color: var(--neon);
          background: rgba(209, 255, 0, 0.05);
          box-shadow: 0 0 20px rgba(209, 255, 0, 0.2);
        }

        .form-input:disabled {
          background: rgba(209, 255, 0, 0.03);
          color: var(--text-secondary);
          cursor: not-allowed;
        }

        .form-input::placeholder {
          color: var(--text-secondary);
          opacity: 0.5;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-col {
          display: flex;
          flex-direction: column;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          margin-top: 40px;
        }

        .btn {
          padding: 15px 35px;
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 1px;
          border: none;
          cursor: pointer;
          transition: all 0.3s var(--ease);
          position: relative;
          overflow: hidden;
          text-transform: uppercase;
        }

        .btn-submit {
          flex: 1;
          background: var(--neon);
          color: black;
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .btn-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transform: translateX(-100%);
          opacity: 0;
        }

        .btn-submit:hover:not(:disabled) {
          box-shadow: 0 0 30px var(--neon), 0 0 60px var(--neon-glow);
          filter: brightness(1.1);
        }

        .btn-submit:active:not(:disabled) {
          transform: scale(0.98);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-cancel {
          background: transparent;
          color: var(--text);
          border: 1px solid var(--border);
          position: relative;
        }

        .btn-cancel::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(209, 255, 0, 0.1);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s var(--ease);
          z-index: -1;
        }

        .btn-cancel:hover {
          border-color: var(--neon);
          color: var(--neon);
        }

        .btn-cancel:hover::before {
          transform: scaleX(1);
          transform-origin: left;
        }

        .alert {
          padding: 15px 20px;
          margin-bottom: 25px;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          border-radius: 0;
          position: relative;
          overflow: hidden;
        }

        .alert::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 3px;
          height: 100%;
        }

        .alert-error {
          background: rgba(255, 100, 100, 0.08);
          border: 1px solid rgba(255, 100, 100, 0.3);
          color: #ff6464;
        }

        .alert-error::before {
          background: #ff6464;
          animation: glow-pulse-error 1.5s ease-in-out infinite;
        }

        @keyframes glow-pulse-error {
          0%, 100% { box-shadow: 0 0 10px #ff6464; }
          50% { box-shadow: 0 0 20px rgba(255, 100, 100, 0.5); }
        }

        .alert-success {
          background: rgba(100, 255, 100, 0.08);
          border: 1px solid rgba(100, 255, 100, 0.3);
          color: #64ff64;
        }

        .alert-success::before {
          background: #64ff64;
          animation: glow-pulse-success 1.5s ease-in-out infinite;
        }

        @keyframes glow-pulse-success {
          0%, 100% { box-shadow: 0 0 10px #64ff64; }
          50% { box-shadow: 0 0 20px rgba(100, 255, 100, 0.5); }
        }

        .loading-spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(0, 0, 0, 0.3);
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin-smooth 0.8s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes spin-smooth {
          to { transform: rotate(360deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        @media (max-width: 1024px) {
          .apply-page-root {
            padding: 100px 5% 60px;
          }

          .apply-header h1 {
            font-size: 3rem;
          }
        }

        @media (max-width: 768px) {
          .apply-page-root {
            padding: 80px 5% 40px;
          }

          .apply-container {
            max-width: 100%;
          }

          .apply-header h1 {
            font-size: 2rem;
          }

          .apply-card {
            padding: 30px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn-submit, .btn-cancel {
            width: 100%;
          }

          .apply-page-root::before {
            width: 400px;
            height: 400px;
          }
        }
      `}</style>

      <motion.div
        className="apply-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header with animated accent */}
        <motion.div className="apply-header" variants={itemVariants}>
          <h1>Apply for Project</h1>
        </motion.div>

        {/* Project Badge with hover animation */}
        <motion.div
          className="project-badge"
          variants={badgeVariants}
          whileHover="hover"
        >
          <span className="project-badge-dot"></span>
          {projectName || `Project ${projectId || 'Loading...'}`}
        </motion.div>

        {/* Debug Info - Show what's being submitted */}
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(209, 255, 0, 0.08)', 
          border: '1px solid rgba(209, 255, 0, 0.2)',
          borderRadius: '4px',
          fontSize: '0.85rem',
          color: '#d1ff00',
          marginBottom: '20px',
          fontFamily: 'monospace'
        }}>
          <div>📌 Project ID: <strong>{projectId || 'not set'}</strong></div>
          <div>📌 Project Name: <strong>{projectName || 'not set'}</strong></div>
        </div>

        {/* Alerts with animation */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="alert alert-error"
              variants={alertVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              ✕ {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              className="alert alert-success"
              variants={alertVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              ✓ Application submitted successfully. Redirecting...
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Card with glassmorphism */}
        <motion.form
          ref={formCardRef}
          onSubmit={handleSubmit}
          className="apply-card"
          variants={cardVariants}
          whileHover="hover"
          onMouseMove={handleMouseMove}
        >
          {/* Row 1: Name & Phone */}
          <div className="form-row">
            <motion.div className="form-col" custom={0} variants={inputVariants} initial="hidden" animate="visible">
              <div
                className={`form-group ${focusedField === 'name' ? 'focused' : ''}`}
              >
                <label className="form-label">Full Name</label>
                <motion.input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Your Full Name"
                  value={form.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  whileFocus={{ scale: 1.02 }}
                  required
                />
              </div>
            </motion.div>

            <motion.div className="form-col" custom={1} variants={inputVariants} initial="hidden" animate="visible">
              <div
                className={`form-group ${focusedField === 'phone' ? 'focused' : ''}`}
              >
                <label className="form-label">Phone Number</label>
                <motion.input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="Your Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  whileFocus={{ scale: 1.02 }}
                  required
                />
              </div>
            </motion.div>
          </div>

          {/* Row 2: Roll Number & Email */}
          <div className="form-row">
            <motion.div className="form-col" custom={2} variants={inputVariants} initial="hidden" animate="visible">
              <div
                className={`form-group ${focusedField === 'rollNumber' ? 'focused' : ''}`}
              >
                <label className="form-label">Roll Number</label>
                <motion.input
                  type="text"
                  name="rollNumber"
                  className="form-input"
                  placeholder="Your Roll Number"
                  value={form.rollNumber}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('rollNumber')}
                  onBlur={() => setFocusedField(null)}
                  whileFocus={{ scale: 1.02 }}
                  required
                />
              </div>
            </motion.div>

            <motion.div className="form-col" custom={3} variants={inputVariants} initial="hidden" animate="visible">
              <div
                className={`form-group ${focusedField === 'instituteEmail' ? 'focused' : ''}`}
              >
                <label className="form-label">Institute Email ID</label>
                <motion.input
                  type="email"
                  name="instituteEmail"
                  className="form-input"
                  placeholder="your.email@iiits.in"
                  value={form.instituteEmail}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('instituteEmail')}
                  onBlur={() => setFocusedField(null)}
                  whileFocus={{ scale: 1.02 }}
                  required
                />
              </div>
            </motion.div>
          </div>

          {/* Project field (read-only) */}
          <motion.div custom={4} variants={inputVariants} initial="hidden" animate="visible">
            <div className="form-group">
              <label className="form-label">Project Applied For</label>
              <motion.input
                type="text"
                className="form-input"
                placeholder={projectName || `Project ${projectId || 'Unknown'}`}
                disabled
              />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="form-actions"
            variants={buttonContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              type="submit"
              className="btn btn-submit"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  SUBMITTING...
                </>
              ) : (
                'SUBMIT APPLICATION'
              )}
            </motion.button>

            <motion.button
              type="button"
              className="btn btn-cancel"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => navigate('/')}
            >
              CANCEL
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default ApplyPage;

