import React, { useEffect, useState, useContext } from 'react';
import axios from '../../api/axiosInstance';
import { AuthContext } from '../../context/auth-context';
import { useNavigate } from 'react-router-dom';
import ProjectManagement from './components/ProjectManagement';
import EventManagement from './components/EventManagement';
import TeamManagement from './components/TeamManagement';
import { canViewAdmin, canManageTeam, isCoordinator } from '@/utils/rbac';

function AdminPage() {
    const { auth, handleLogout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [events, setEvents] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [activeTab, setActiveTab] = useState('projects');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const userCanManageTeam = canManageTeam(auth?.user);

    useEffect(() => {
        if (!auth?.authenticated || !canViewAdmin(auth?.user)) return;
        fetchAllData();
    }, [auth]);

    const fetchAllData = () => {
        fetchProjects();
        fetchEvents();
        if (userCanManageTeam) {
            fetchTeam();
        }
    };

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/projects/admin/all');
            if (res.data?.success) {
                setProjects(res.data.data || []);
            }
        } catch (err) {
            console.error("❌ Error fetching projects:", err);
            setError("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            const res = await axios.get('/api/events/admin/all');
            if (res.data?.success) {
                setEvents(res.data.data || []);
            }
        } catch (err) {
            console.error("❌ Error fetching events:", err);
        }
    };

    const fetchTeam = async () => {
        try {
            const res = await axios.get('/api/team/admin/all');
            if (res.data?.success) {
                setTeamMembers(res.data.data || []);
            }
        } catch (err) {
            console.error("❌ Error fetching team members:", err);
        }
    };

    const handleLogoutAdmin = () => {
        handleLogout();
        navigate('/auth');
    };

    // Calculate active vs archived stats
    const activeProjects = projects.filter(p => !p.isArchived);
    const archivedProjects = projects.filter(p => p.isArchived);

    const activeEvents = events.filter(e => !e.isArchived);
    const archivedEvents = events.filter(e => e.isArchived);

    const activeTeam = teamMembers.filter(m => !m.isArchived && !m.isAlumni);
    const alumniTeam = teamMembers.filter(m => !m.isArchived && m.isAlumni);
    const archivedTeam = teamMembers.filter(m => m.isArchived);

    const userRole = auth?.user?.role || 'Member';

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
                    --border-bright: rgba(209, 255, 0, 0.3);
                    --text: #ffffff;
                    --text-secondary: #888888;
                    --font-display: 'Teko', sans-serif;
                    --font-body: 'Space Grotesk', sans-serif;
                    --font-mono: 'JetBrains Mono', monospace;
                    --ease: cubic-bezier(0.23, 1, 0.32, 1);
                }

                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                .admin-wrapper {
                    min-height: 100vh;
                    background: var(--bg);
                    color: var(--text);
                    font-family: var(--font-body);
                    padding: 80px 5% 80px;
                    position: relative;
                }

                .admin-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 1;
                }

                .admin-header {
                    margin-bottom: 50px;
                    border-left: 3px solid var(--neon);
                    padding-left: 30px;
                    position: relative;
                    animation: fadeInUp 0.8s var(--ease);
                }

                .admin-header h1 {
                    font-family: var(--font-display);
                    font-size: 4rem;
                    line-height: 1;
                    margin-bottom: 12px;
                    color: var(--text);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .admin-header p {
                    font-family: var(--font-body);
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                }

                .role-badge-header {
                    display: inline-block;
                    margin-bottom: 8px;
                    padding: 4px 10px;
                    background: rgba(209, 255, 0, 0.15);
                    border: 1px solid var(--neon);
                    color: var(--neon);
                    font-family: var(--font-mono);
                    font-size: 0.75rem;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 30px;
                    margin-bottom: 50px;
                }

                .stat-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    padding: 36px;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.4s var(--ease);
                }

                .stat-card:hover {
                    border-color: var(--neon);
                    transform: translateY(-4px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px var(--neon-dim);
                }

                .stat-label {
                    font-family: var(--font-mono);
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    margin-bottom: 10px;
                }

                .stat-value {
                    font-family: var(--font-display);
                    font-size: 4rem;
                    line-height: 1;
                    color: var(--neon);
                    font-weight: 700;
                    margin-bottom: 6px;
                }

                .stat-meta {
                    font-family: var(--font-mono);
                    font-size: 0.75rem;
                    color: #888;
                }

                .admin-nav-tabs {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 30px;
                    border-bottom: 1px solid rgba(209, 255, 0, 0.1);
                    padding-bottom: 15px;
                }

                .admin-tab-btn {
                    background: transparent;
                    border: none;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 8px 18px;
                    font-family: var(--font-mono);
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .admin-tab-btn.active {
                    color: var(--neon);
                    border-bottom: 2px solid var(--neon);
                }

                .admin-tab-btn:not(.active) {
                    color: var(--text-secondary);
                }

                .admin-tab-btn:not(.active):hover {
                    color: #ffffff;
                }

                @media (max-width: 768px) {
                    .admin-header h1 {
                        font-size: 2.5rem;
                    }
                    .stats-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                }
            `}</style>

            <div className="admin-container">
                <div className="admin-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <span className="role-badge-header">
                                ACCESS LEVEL: {userRole.toUpperCase()}
                            </span>
                            <h1>Command Hub</h1>
                            <p>Role-Based Operations Console: Manage projects, telemetry, operational events, and crew personnel.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => navigate('/')}
                                style={{
                                    padding: '10px 20px',
                                    background: 'rgba(209, 255, 0, 0.1)',
                                    border: '1px solid rgba(209, 255, 0, 0.3)',
                                    color: '#d1ff00',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: '600',
                                    fontSize: '0.85rem',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                🏠 Public Site
                            </button>
                            <button 
                                onClick={handleLogoutAdmin}
                                style={{
                                    padding: '10px 20px',
                                    background: 'rgba(255, 100, 100, 0.1)',
                                    border: '1px solid rgba(255, 100, 100, 0.3)',
                                    color: '#ff6464',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: '600',
                                    fontSize: '0.85rem',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                <div className="admin-nav-tabs">
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`admin-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
                    >
                        🚀 Projects ({activeProjects.length} Active / {archivedProjects.length} Archived)
                    </button>
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`admin-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
                    >
                        📅 Events ({activeEvents.length} Active / {archivedEvents.length} Archived)
                    </button>
                    {userCanManageTeam && (
                        <button
                            onClick={() => setActiveTab('team')}
                            className={`admin-tab-btn ${activeTab === 'team' ? 'active' : ''}`}
                        >
                            👥 Team ({activeTeam.length} Active / {alumniTeam.length} Alumni / {archivedTeam.length} Archived)
                        </button>
                    )}
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">System Builds</div>
                        <div className="stat-value">{activeProjects.length}</div>
                        <div className="stat-meta">{archivedProjects.length} in cold archive repository</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Operational Events</div>
                        <div className="stat-value">{activeEvents.length}</div>
                        <div className="stat-meta">{archivedEvents.length} in historical archives</div>
                    </div>
                    {userCanManageTeam && (
                        <div className="stat-card">
                            <div className="stat-label">Command Personnel</div>
                            <div className="stat-value">{activeTeam.length} Active</div>
                            <div className="stat-meta">{alumniTeam.length} alumni in registry | {archivedTeam.length} archived</div>
                        </div>
                    )}
                </div>

                {activeTab === 'projects' ? (
                    <div className="projects-section">
                        <ProjectManagement
                            projects={projects}
                            currentUser={auth?.user}
                            onProjectsUpdate={fetchProjects}
                        />
                    </div>
                ) : activeTab === 'events' ? (
                    <div className="events-section">
                        <EventManagement
                            events={events}
                            currentUser={auth?.user}
                            onEventsUpdate={fetchEvents}
                        />
                    </div>
                ) : userCanManageTeam ? (
                    <div className="team-section">
                        <TeamManagement
                            teamMembers={teamMembers}
                            currentUser={auth?.user}
                            onTeamUpdate={fetchTeam}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default AdminPage;