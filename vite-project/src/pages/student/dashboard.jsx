import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import { AuthContext } from '../../context/auth-context';

const StudentDashboard = () => {
  const { auth, handleLogout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth?.authenticated) {
      navigate('/auth');
      return;
    }
    fetchMyApplications();
  }, [auth, navigate]);

  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/applications/my-applications');
      if (res.data?.success) {
        setApplications(res.data.data || []);
        console.log("✅ My applications:", res.data.data);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Error fetching applications:", err);
      setError(err.response?.data?.message || 'Failed to load applications');
    }
  };

  const handleLogoutStudent = () => {
    handleLogout();
    navigate('/auth');
  };

  const getStatusColor = (status) => {
    if (status === 'Approved') return '#64ff64';
    if (status === 'Rejected') return '#ff6b6b';
    return '#d1ff00';
  };

  const getStatusBgColor = (status) => {
    if (status === 'Approved') return 'rgba(100, 255, 100, 0.1)';
    if (status === 'Rejected') return 'rgba(255, 68, 68, 0.1)';
    return 'rgba(209, 255, 0, 0.1)';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#020202',
      color: '#fff',
      fontFamily: 'monospace',
      padding: '20px'
    }}>
      <style>{`
        * {
          --border: rgba(255, 255, 255, 0.1);
          --neon: #d1ff00;
          --text: #fff;
        }

        .grad-bg {
          background: linear-gradient(135deg, 
            rgba(209, 255, 0, 0.03) 0%, 
            rgba(209, 255, 0, 0.01) 50%,
            rgba(100, 255, 100, 0.03) 100%);
          border: 1px solid var(--border);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          borderRadius: 4px;
          fontSize: 0.75rem;
          fontWeight: 700;
          textTransform: uppercase;
        }

        .app-card {
          padding: 20px;
          background: rgba(5, 5, 5, 0.9);
          border: 1px solid var(--border);
          borderRadius: 4px;
          marginBottom: 15px;
          transition: all 0.3s ease;
        }

        .app-card:hover {
          background: rgba(209, 255, 0, 0.05);
          borderColor: rgba(209, 255, 0, 0.3);
        }

        .header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          marginBottom: 30px;
          padding-bottom: 20px;
          borderBottom: 1px solid var(--border);
        }

        .logout-btn {
          padding: 10px 20px;
          background: rgba(255, 100, 100, 0.1);
          border: 1px solid rgba(255, 100, 100, 0.3);
          color: #ff6464;
          borderRadius: 4px;
          cursor: pointer;
          fontFamily: monospace;
          fontWeight: 600;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: rgba(255, 100, 100, 0.2);
          boxShadow: 0 0 15px rgba(255, 100, 100, 0.3);
        }

        .empty-state {
          textAlign: center;
          padding: 60px 20px;
          color: #888;
        }

        .empty-icon {
          fontSize: 3rem;
          marginBottom: 15px;
        }

        .loading-spinner {
          display: inline-block;
          width: 30px;
          height: 30px;
          border: 3px solid rgba(209, 255, 0, 0.2);
          borderTop: 3px solid #d1ff00;
          borderRadius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className="header-bar">
        <div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>🎓 My Applications</h1>
          <p style={{ margin: 0, color: '#888' }}>Welcome, {auth?.user?.userName}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              background: 'rgba(209, 255, 0, 0.1)',
              border: '1px solid rgba(209, 255, 0, 0.3)',
              color: '#d1ff00',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(209, 255, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(209, 255, 0, 0.1)';
            }}
          >
            🏠 Home
          </button>
          <button
            onClick={handleLogoutStudent}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {error && (
          <div style={{
            padding: '15px 20px',
            background: 'rgba(255, 100, 100, 0.1)',
            border: '1px solid rgba(255, 100, 100, 0.3)',
            color: '#ff6464',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            ✕ {error}
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '20px' }}>Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h2>No Applications Yet</h2>
            <p>You haven't applied to any projects yet.</p>
            <button
              onClick={() => navigate('/')}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: 'rgba(209, 255, 0, 0.1)',
                border: '1px solid rgba(209, 255, 0, 0.3)',
                color: '#d1ff00',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontWeight: '600'
              }}
            >
              Explore Projects
            </button>
          </div>
        ) : (
          <div>
            <div style={{
              padding: '15px 20px',
              background: 'rgba(209, 255, 0, 0.08)',
              border: '1px solid rgba(209, 255, 0, 0.2)',
              borderRadius: '4px',
              marginBottom: '20px',
              color: '#d1ff00',
              fontWeight: '600'
            }}>
              📊 Total Applications: {applications.length}
            </div>

            {applications.map((app) => (
              <div key={app._id} className="app-card">
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '15px'
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>
                      {app.projectName}
                    </h3>
                    <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className="status-badge"
                    style={{
                      color: getStatusColor(app.applicationStatus),
                      backgroundColor: getStatusBgColor(app.applicationStatus),
                      border: `1px solid ${getStatusColor(app.applicationStatus)}40`
                    }}
                  >
                    ● {app.applicationStatus}
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  paddingTop: '15px',
                  borderTop: '1px solid var(--border)'
                }}>
                  <div>
                    <span style={{ color: '#888', fontSize: '0.75rem' }}>ROLL NUMBER</span>
                    <p style={{ margin: '5px 0 0 0' }}>{app.rollNumber}</p>
                  </div>
                  <div>
                    <span style={{ color: '#888', fontSize: '0.75rem' }}>EMAIL</span>
                    <p style={{ margin: '5px 0 0 0' }}>{app.instituteEmail}</p>
                  </div>
                  <div>
                    <span style={{ color: '#888', fontSize: '0.75rem' }}>PHONE</span>
                    <p style={{ margin: '5px 0 0 0' }}>{app.phone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
