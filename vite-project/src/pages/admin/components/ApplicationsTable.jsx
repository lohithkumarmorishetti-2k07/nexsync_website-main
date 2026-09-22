import React, { useState } from 'react';

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s var(--ease);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 50px;
          width: 90%;
          max-width: 700px;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.4s var(--ease);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        /* Glassmorphism gradient overlay */
        .modal-content::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(209, 255, 0, 0.02) 100%);
          pointer-events: none;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .modal-title {
          font-family: var(--font-display);
          font-size: 2rem;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .modal-close {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.3s var(--ease);
          padding: 0;
          width: 30px;
          height: 30px;
        }

        .modal-close:hover {
          color: var(--neon);
        }

        .modal-field {
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .modal-field-label {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
          display: block;
        }

        .modal-field-value {
          font-family: var(--font-body);
          font-size: 1rem;
          color: var(--text);
        }

        .modal-actions {
          display: flex;
          gap: 15px;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid var(--border);
          position: relative;
          z-index: 1;
        }

        .btn-modal {
          flex: 1;
          padding: 15px 24px;
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s var(--ease);
          border: none;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
        }

        .btn-approve {
          background: rgba(100, 255, 100, 0.08);
          color: #64ff64;
          border: 1px solid rgba(100, 255, 100, 0.3);
        }

        .btn-approve:hover {
          background: rgba(100, 255, 100, 0.15);
          border-color: #64ff64;
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(100, 255, 100, 0.2);
        }

        .btn-reject {
          background: rgba(255, 100, 100, 0.08);
          color: #ff6464;
          border: 1px solid rgba(255, 100, 100, 0.3);
        }

        .btn-reject:hover {
          background: rgba(255, 100, 100, 0.15);
          border-color: #ff6464;
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(255, 100, 100, 0.2);
        }

        .btn-modal:active {
          transform: translateY(0);
        }
      `}</style>
      <div className="modal-content">
        {children}
      </div>
    </div>
  );
};

const ApplicationsTable = ({ apps = [], onApprove, onReject }) => {
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(null);

  console.log("📊 Applications data:", apps);

  const handleApprove = (id) => {
    setConfirming({ action: 'approve', id });
  };

  const handleReject = (id) => {
    setConfirming({ action: 'reject', id });
  };

  const confirmAction = () => {
    if (confirming?.action === 'approve') {
      onApprove(confirming.id);
      setSelected(null);
      setConfirming(null);
    } else if (confirming?.action === 'reject') {
      onReject(confirming.id);
      setSelected(null);
      setConfirming(null);
    }
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
    <>
      <style>{`
        .applications-table-wrapper {
          overflow-x: auto;
          background: var(--surface);
          border: 1px solid var(--border);
          position: relative;
        }

        .applications-table {
          width: 100%;
          border-collapse: collapse;
          font-family: var(--font-body);
        }

        .table-header-row {
          border-bottom: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.02);
        }

        .table-header-cell {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-align: left;
          padding: 20px 16px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .table-header-cell:nth-child(3) {
          min-width: 150px;
        }

        .table-row {
          border-bottom: 1px solid var(--border);
          transition: all 0.3s var(--ease);
        }

        .table-row:hover {
          background: rgba(209, 255, 0, 0.05);
          padding-left: 10px;
        }

        .table-cell {
          padding: 20px 16px;
          color: var(--text);
          font-size: 0.95rem;
        }

        .table-name {
          font-weight: 500;
          color: var(--neon);
          font-family: var(--font-body);
        }

        .table-project {
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-body);
          white-space: nowrap;
          min-width: 150px;
          font-size: 1rem;
        }

        .table-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-radius: 0;
        }

        .table-actions {
          display: flex;
          gap: 8px;
        }

        .btn-table {
          padding: 8px 14px;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s var(--ease);
          border: 1px solid transparent;
          text-transform: uppercase;
          white-space: nowrap;
          background: transparent;
        }

        .btn-view {
          color: var(--neon);
          border: 1px solid var(--neon-dim);
        }

        .btn-view:hover {
          background: rgba(209, 255, 0, 0.1);
          border-color: var(--neon);
          transform: translateY(-1px);
          box-shadow: 0 0 20px rgba(209, 255, 0, 0.2);
        }

        .btn-approve-action {
          background: rgba(100, 255, 100, 0.08);
          color: #64ff64;
          border: 1px solid rgba(100, 255, 100, 0.3);
        }

        .btn-approve-action:hover {
          background: rgba(100, 255, 100, 0.15);
          border-color: #64ff64;
          box-shadow: 0 0 20px rgba(100, 255, 100, 0.2);
        }

        .btn-reject-action {
          background: rgba(255, 100, 100, 0.08);
          color: #ff6464;
          border: 1px solid rgba(255, 100, 100, 0.3);
        }

        .btn-reject-action:hover {
          background: rgba(255, 100, 100, 0.15);
          border-color: #ff6464;
          box-shadow: 0 0 20px rgba(255, 100, 100, 0.2);
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: var(--text-secondary);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .empty-text {
          font-family: var(--font-body);
          font-size: 1.1rem;
          color: var(--text-secondary);
        }

        @media (max-width: 1024px) {
          .table-cell {
            padding: 16px 12px;
            font-size: 0.9rem;
          }

          .table-header-cell {
            padding: 16px 12px;
            font-size: 0.7rem;
          }

          .btn-table {
            padding: 6px 10px;
            font-size: 0.65rem;
          }
        }

        @media (max-width: 768px) {
          .applications-table-wrapper {
            overflow-x: auto;
          }

          .applications-table {
            min-width: 900px;
          }
        }
      `}</style>

      <div className="applications-table-wrapper">
        {apps.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-text">No applications yet</div>
          </div>
        ) : (
          <table className="applications-table">
            <thead>
              <tr className="table-header-row">
                <th className="table-header-cell">Student Name</th>
                <th className="table-header-cell">Roll Number</th>
                <th className="table-header-cell">Project</th>
                <th className="table-header-cell">Email</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Applied At</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app._id} className="table-row">
                  <td className="table-cell table-name">{app.name}</td>
                  <td className="table-cell">{app.rollNumber}</td>
                  <td className="table-cell table-project">
                    {app.projectName && app.projectName.trim() ? app.projectName : 'Project Name Not Set'}
                  </td>
                  <td className="table-cell">{app.instituteEmail}</td>
                  <td className="table-cell">
                    <span
                      className="table-status"
                      style={{
                        color: getStatusColor(app.applicationStatus),
                        backgroundColor: getStatusBgColor(app.applicationStatus),
                        borderColor: getStatusColor(app.applicationStatus) + '40',
                        border: `1px solid ${getStatusColor(app.applicationStatus)}40`,
                      }}
                    >
                      ● {app.applicationStatus}
                    </span>
                  </td>
                  <td className="table-cell">{new Date(app.appliedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}</td>
                  <td className="table-cell">
                    <div className="table-actions">
                      <button
                        className="btn-table btn-view"
                        onClick={() => setSelected(app)}
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <>
            <div className="modal-header">
              <h2 className="modal-title">{selected.name}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="modal-field">
              <span className="modal-field-label">Roll Number</span>
              <span className="modal-field-value">{selected.rollNumber}</span>
            </div>

            <div className="modal-field">
              <span className="modal-field-label">Institute Email</span>
              <span className="modal-field-value">{selected.instituteEmail}</span>
            </div>

            <div className="modal-field">
              <span className="modal-field-label">Phone Number</span>
              <span className="modal-field-value">{selected.phone}</span>
            </div>

            <div className="modal-field">
              <span className="modal-field-label">Project Applied For</span>
              <span className="modal-field-value">{selected.projectName}</span>
            </div>

            <div className="modal-field">
              <span className="modal-field-label">Current Status</span>
              <span
                className="table-status"
                style={{
                  marginTop: '8px',
                  color: getStatusColor(selected.applicationStatus),
                  backgroundColor: getStatusBgColor(selected.applicationStatus),
                  border: `1px solid ${getStatusColor(selected.applicationStatus)}40`,
                }}
              >
                ● {selected.applicationStatus}
              </span>
            </div>

            <div className="modal-field">
              <span className="modal-field-label">Applied On</span>
              <span className="modal-field-value">{new Date(selected.appliedAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</span>
            </div>

            {selected.applicationStatus === 'Pending' && (
              <div className="modal-actions">
                {confirming?.id === selected._id ? (
                  <>
                    <button
                      className="btn-modal"
                      style={{
                        background: '#333',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}
                      onClick={() => setConfirming(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn-modal btn-approve"
                      onClick={confirmAction}
                    >
                      Confirm {confirming.action === 'approve' ? 'Approval' : 'Rejection'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn-modal btn-approve"
                      onClick={() => handleApprove(selected._id)}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="btn-modal btn-reject"
                      onClick={() => handleReject(selected._id)}
                    >
                      ✕ Reject
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
};

export default ApplicationsTable;
