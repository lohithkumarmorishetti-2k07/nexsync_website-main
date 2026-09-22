import React, { useEffect, useState, useContext } from 'react';
import axios from '../../api/axiosInstance';
import { AuthContext } from '../../context/auth-context';
import { useNavigate } from 'react-router-dom';
import ApplicationsTable from './components/ApplicationsTable';
import ProjectManagement from './components/ProjectManagement';
import EventManagement from './components/EventManagement';
import TeamManagement from './components/TeamManagement';

function AdminPage() {
    const { auth, handleLogout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [apps, setApps] = useState([]);
    const [projects, setProjects] = useState([]);
    const [events, setEvents] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [activeTab, setActiveTab] = useState('applications');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!auth?.authenticated || auth?.user?.role !== 'admin') return;
        fetchApps();
        fetchProjects();
        fetchEvents();
        fetchTeam();
    }, [auth]);

    const fetchProjects = async () => {
        try {
            const res = await axios.get('/api/projects');
            if (res.data?.success) {
                setProjects(res.data.data || []);
                console.log("✅ Projects fetched:", res.data.data);
            }
        } catch (err) {
            console.error("❌ Error fetching projects:", err);
        }
    };

    const fetchEvents = async () => {
        try {
            const res = await axios.get('/api/events');
            if (res.data?.success) {
                setEvents(res.data.data || []);
                console.log("✅ Events fetched:", res.data.data);
            }
        } catch (err) {
            console.error("❌ Error fetching events:", err);
        }
    };

    const fetchTeam = async () => {
        try {
            const res = await axios.get('/api/team');
            if (res.data?.success) {
                setTeamMembers(res.data.data || []);
                console.log("✅ Team members fetched:", res.data.data);
            }
        } catch (err) {
            console.error("❌ Error fetching team members:", err);
        }
    };

    const fetchApps = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/applications');
            console.log("📥 Applications API Response:", res.data);
            if (res.data?.success) {
                console.log("✅ Apps fetched:", res.data.data.apps);
                setApps(res.data.data.apps);
                setCounts(res.data.data.counts || {});
            }
            setLoading(false);
        } catch (err) {
            setLoading(false);
            console.error("❌ Error fetching apps:", err);
            setError(err.response?.data?.message || 'Failed to load');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.post(`/api/applications/${id}/status`, { status });
            fetchApps();
        } catch (err) {
            console.error(err);
            setError('Could not update status');
        }
    };

    const handleLogoutAdmin = () => {
        handleLogout();
        navigate('/auth');
    };

    return (
        <div className="admin-wrapper">
            <div className="noise-texture"></div>
            <style>{`
                /* IMPORTS */
                @import url('https://fonts.googleapis.com/css2?family=Teko:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

                /* TOKENS */
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

                /* RESET */
                * { box-sizing: border-box; margin: 0; padding: 0; }
                html { scroll-behavior: smooth; }
                body { background: var(--bg); color: var(--text); font-family: var(--font-body); overflow-x: hidden; line-height: 1.6; }

                /* NOISE TEXTURE */
                .noise-texture {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 9000;
                    opacity: 0.03;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                }

                /* ADMIN DASHBOARD STYLES - MATCHES HOME PAGE DESIGN */
                .admin-wrapper {
                    min-height: 100vh;
                    background: var(--bg);
                    padding: 140px 5% 80px;
                    position: relative;
                }

                .admin-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 1;
                }

                .admin-header {
                    margin-bottom: 70px;
                    border-left: 3px solid var(--neon);
                    padding-left: 30px;
                    position: relative;
                    animation: fadeInUp 0.8s var(--ease);
                }

                /* Animated accent line */
                .admin-header::before {
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

                .admin-header h1 {
                    font-family: var(--font-display);
                    font-size: 4rem;
                    line-height: 1;
                    margin-bottom: 15px;
                    color: var(--text);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .admin-header p {
                    font-family: var(--font-body);
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 30px;
                    margin-bottom: 60px;
                }

                .stat-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    padding: 40px;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.4s var(--ease);
                    animation: fadeInUp 0.8s var(--ease) backwards;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }

                /* Glassmorphism gradient overlay */
                .stat-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(209, 255, 0, 0.02) 100%);
                    pointer-events: none;
                }

                /* Border glow effect on hover */
                .stat-card::after {
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

                .stat-card:nth-child(1) { animation-delay: 0.1s; }
                .stat-card:nth-child(2) { animation-delay: 0.2s; }
                .stat-card:nth-child(3) { animation-delay: 0.3s; }
                .stat-card:nth-child(4) { animation-delay: 0.4s; }

                .stat-card:hover {
                    transform: translateY(-5px);
                    border-color: var(--neon);
                    background: var(--surface-highlight);
                    box-shadow: 0 25px 80px rgba(209, 255, 0, 0.1);
                }

                .stat-card:hover::after {
                    opacity: 1;
                    animation: border-flow 2s linear infinite;
                }

                @keyframes border-flow {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .stat-label {
                    font-family: var(--font-mono);
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    margin-bottom: 15px;
                }

                .stat-value {
                    font-family: var(--font-display);
                    font-size: 3.5rem;
                    line-height: 1;
                    color: var(--neon);
                    margin-bottom: 10px;
                }

                .stat-meta {
                    font-family: var(--font-mono);
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                }

                .applications-section {
                    animation: fadeInUp 0.8s var(--ease) 0.5s backwards;
                }

                .section-title {
                    font-family: var(--font-display);
                    font-size: 2.5rem;
                    margin-bottom: 30px;
                    color: var(--text);
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 25px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .error-banner {
                    background: rgba(255, 100, 100, 0.08);
                    border: 1px solid rgba(255, 100, 100, 0.3);
                    color: #ff6464;
                    padding: 15px 20px;
                    margin-bottom: 25px;
                    font-family: var(--font-mono);
                    font-size: 0.85rem;
                    border-radius: 0;
                    position: relative;
                    overflow: hidden;
                    animation: slideDown 0.4s var(--ease);
                }

                .error-banner::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 3px;
                    height: 100%;
                    background: #ff6464;
                    animation: glow-pulse-error 1.5s ease-in-out infinite;
                }

                @keyframes glow-pulse-error {
                    0%, 100% { box-shadow: 0 0 10px #ff6464; }
                    50% { box-shadow: 0 0 20px rgba(255, 100, 100, 0.5); }
                }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .loading-container {
                    text-align: center;
                    padding: 60px 20px;
                }

                .loading-spinner {
                    display: inline-block;
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(209, 255, 0, 0.2);
                    border-top-color: var(--neon);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .loading-text {
                    font-family: var(--font-mono);
                    color: var(--text-secondary);
                    margin-top: 15px;
                    font-size: 0.9rem;
                }

                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }

                @media (max-width: 1280px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 1024px) {
                    .admin-wrapper {
                        padding: 100px 5% 60px;
                    }

                    .admin-header h1 {
                        font-size: 3rem;
                    }
                }

                @media (max-width: 768px) {
                    .admin-wrapper {
                        padding: 80px 5% 40px;
                    }

                    .admin-header {
                        margin-bottom: 50px;
                    }

                    .admin-header h1 {
                        font-size: 2rem;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                        margin-bottom: 40px;
                    }

                    .section-title {
                        font-size: 1.8rem;
                    }
                }
            `}</style>

            <div className="admin-container">
                <div className="admin-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div>
                            <h1>Application Hub</h1>
                            <p>Manage all project applications, track submissions, and approve candidates</p>
                        </div>
                        <button 
                            onClick={handleLogoutAdmin}
                            style={{
                                padding: '10px 20px',
                                background: 'rgba(255, 100, 100, 0.1)',
                                border: '1px solid rgba(255, 100, 100, 0.3)',
                                color: '#ff6464',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontFamily: 'monospace',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255, 100, 100, 0.2)';
                                e.target.style.boxShadow = '0 0 15px rgba(255, 100, 100, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 100, 100, 0.1)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '20px',
                    marginBottom: '30px',
                    borderBottom: '1px solid rgba(209, 255, 0, 0.1)',
                    paddingBottom: '15px'
                }}>
                    <button
                        onClick={() => setActiveTab('applications')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: activeTab === 'applications' ? '#d1ff00' : '#888',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            padding: '5px 15px',
                            borderBottom: activeTab === 'applications' ? '2px solid #d1ff00' : 'none',
                            fontFamily: 'monospace',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        📋 Applications
                    </button>
                    <button
                        onClick={() => setActiveTab('projects')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: activeTab === 'projects' ? '#d1ff00' : '#888',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            padding: '5px 15px',
                            borderBottom: activeTab === 'projects' ? '2px solid #d1ff00' : 'none',
                            fontFamily: 'monospace',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        🚀 Projects
                    </button>
                    <button
                        onClick={() => setActiveTab('events')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: activeTab === 'events' ? '#d1ff00' : '#888',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            padding: '5px 15px',
                            borderBottom: activeTab === 'events' ? '2px solid #d1ff00' : 'none',
                            fontFamily: 'monospace',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        📅 Events
                    </button>
                    <button
                        onClick={() => setActiveTab('team')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: activeTab === 'team' ? '#d1ff00' : '#888',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            padding: '5px 15px',
                            borderBottom: activeTab === 'team' ? '2px solid #d1ff00' : 'none',
                            fontFamily: 'monospace',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        👥 Team
                    </button>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Total Applications</div>
                        <div className="stat-value">{counts.total}</div>
                        <div className="stat-meta">All time submissions</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Pending Review</div>
                        <div className="stat-value">{counts.pending}</div>
                        <div className="stat-meta">Awaiting action</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Approved</div>
                        <div className="stat-value">{counts.approved}</div>
                        <div className="stat-meta">Selected candidates</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Rejected</div>
                        <div className="stat-value">{counts.rejected}</div>
                        <div className="stat-meta">Declined applications</div>
                    </div>
                </div>

                {activeTab === 'applications' ? (
                    <div className="applications-section">
                        {error && <div className="error-banner">✕ {error}</div>}

                        <h2 className="section-title">All Applications</h2>

                        {loading ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <div className="loading-text">Loading applications...</div>
                            </div>
                        ) : (
                            <ApplicationsTable
                                apps={apps}
                                onApprove={(id) => updateStatus(id, 'Approved')}
                                onReject={(id) => updateStatus(id, 'Rejected')}
                            />
                        )}
                    </div>
                ) : activeTab === 'projects' ? (
                    <div className="projects-section">
                        <ProjectManagement
                            projects={projects}
                            onProjectsUpdate={fetchProjects}
                        />
                    </div>
                ) : activeTab === 'events' ? (
                    <div className="events-section">
                        <EventManagement
                            events={events}
                            onEventsUpdate={fetchEvents}
                        />
                    </div>
                ) : (
                    <div className="team-section">
                        <TeamManagement
                            teamMembers={teamMembers}
                            onTeamUpdate={fetchTeam}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPage;