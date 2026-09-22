import React, { useState, useEffect } from 'react';
import axios from '@/api/axiosInstance';

const TeamManagement = ({ teamMembers, onTeamUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    section: 'LEADS',
    yearTag: '',
    linkedinUrl: '',
    image: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      section: 'LEADS',
      yearTag: '',
      linkedinUrl: '',
      image: '',
    });
    setEditingMember(null);
    setShowForm(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.role || !formData.section || !formData.linkedinUrl) {
      setError('Name, Role, Section, and LinkedIn URL are required');
      return;
    }

    if (!formData.linkedinUrl.startsWith('http://') && !formData.linkedinUrl.startsWith('https://')) {
      setError('LinkedIn URL must start with http:// or https://');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        role: formData.role,
        section: formData.section,
        yearTag: formData.yearTag,
        linkedinUrl: formData.linkedinUrl,
        image: formData.image,
      };

      if (editingMember) {
        await axios.put(`/api/team/${editingMember._id}`, payload);
        setSuccess('Team member updated successfully!');
      } else {
        await axios.post('/api/team', payload);
        setSuccess('Team member created successfully!');
      }

      setTimeout(() => {
        onTeamUpdate();
        resetForm();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving team member');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      section: member.section,
      yearTag: member.yearTag || '',
      linkedinUrl: member.linkedinUrl,
      image: member.image || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) return;

    try {
      await axios.delete(`/api/team/${memberId}`);
      setSuccess('Team member deleted successfully!');
      setTimeout(() => {
        onTeamUpdate();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting team member');
    }
  };

  const getSectionLabel = (section) => {
    switch(section) {
      case 'LEADS': return 'Leads';
      case 'CORE_COMMITTEE': return 'Core Committee';
      case 'DOMAIN_LEADS': return 'Domain Leads';
      default: return section;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <style>{`
        .team-section {
          color: #fff;
          fontFamily: monospace;
        }

        .btn-new-member {
          padding: 10px 20px;
          background: rgba(100, 255, 100, 0.1);
          border: 1px solid rgba(100, 255, 100, 0.3);
          color: #64ff64;
          borderRadius: 4px;
          cursor: pointer;
          fontFamily: monospace;
          fontWeight: 600;
          transition: all 0.3s ease;
          marginBottom: 20px;
        }

        .btn-new-member:hover {
          background: rgba(100, 255, 100, 0.2);
          boxShadow: 0 0 15px rgba(100, 255, 100, 0.3);
        }

        .form-container {
          background: rgba(5, 5, 5, 0.9);
          border: 1px solid rgba(209, 255, 0, 0.2);
          padding: 30px;
          borderRadius: 4px;
          marginBottom: 30px;
        }

        .form-grid {
          display: grid;
          gridTemplateColumns: 1fr 1fr;
          gap: 20px;
          marginBottom: 20px;
        }

        .form-group {
          display: flex;
          flexDirection: column;
        }

        .form-group.full {
          gridColumn: 1 / -1;
        }

        .form-label {
          color: #888;
          fontSize: 0.75rem;
          textTransform: uppercase;
          marginBottom: 8px;
          fontWeight: 600;
        }

        .form-input, .form-select {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(209, 255, 0, 0.2);
          color: #fff;
          padding: 10px;
          borderRadius: 4px;
          fontFamily: monospace;
          fontSize: 0.95rem;
          transition: all 0.3s ease;
        }

        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: rgba(209, 255, 0, 0.5);
          background: rgba(209, 255, 0, 0.05);
        }

        .form-actions {
          display: flex;
          gap: 10px;
          justified-content: flex-end;
        }

        .btn-submit {
          flex: 1;
          padding: 12px 24px;
          background: rgba(100, 255, 100, 0.1);
          border: 1px solid rgba(100, 255, 100, 0.3);
          color: #64ff64;
          borderRadius: 4px;
          cursor: pointer;
          fontWeight: 600;
          transition: all 0.3s ease;
        }

        .btn-submit:hover:not(:disabled) {
          background: rgba(100, 255, 100, 0.2);
        }

        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-cancel {
          flex: 1;
          padding: 12px 24px;
          background: transparent;
          border: 1px solid rgba(255, 100, 100, 0.3);
          color: #ff6464;
          borderRadius: 4px;
          cursor: pointer;
          fontWeight: 600;
        }

        .team-table {
          width: 100%;
          borderCollapse: collapse;
          marginTop: 20px;
        }

        .team-table thead {
          background: rgba(255, 255, 255, 0.02);
          borderBottom: 1px solid rgba(209, 255, 0, 0.2);
        }

        .team-table th {
          padding: 15px;
          textAlign: left;
          color: #888;
          fontSize: 0.75rem;
          textTransform: uppercase;
          fontWeight: 600;
          borderRight: 1px solid rgba(209, 255, 0, 0.1);
        }

        .team-table td {
          padding: 15px;
          borderBottom: 1px solid rgba(209, 255, 0, 0.1);
          borderRight: 1px solid rgba(209, 255, 0, 0.1);
        }

        .team-table tr:hover {
          background: rgba(209, 255, 0, 0.03);
        }

        .section-badge {
          display: inline-block;
          padding: 6px 12px;
          borderRadius: 4px;
          fontSize: 0.7rem;
          fontWeight: 600;
          textTransform: uppercase;
        }

        .section-leads {
          background: rgba(209, 255, 0, 0.1);
          color: #d1ff00;
          border: 1px solid rgba(209, 255, 0, 0.3);
        }

        .section-core {
          background: rgba(100, 150, 255, 0.1);
          color: #6496ff;
          border: 1px solid rgba(100, 150, 255, 0.3);
        }

        .section-domain {
          background: rgba(255, 100, 150, 0.1);
          color: #ff6496;
          border: 1px solid rgba(255, 100, 150, 0.3);
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-edit, .btn-delete {
          padding: 6px 12px;
          fontSize: 0.7rem;
          fontWeight: 600;
          borderRadius: 4px;
          cursor: pointer;
          border: 1px solid;
          background: transparent;
          transition: all 0.3s ease;
        }

        .btn-edit {
          color: #d1ff00;
          border-color: rgba(209, 255, 0, 0.3);
        }

        .btn-edit:hover {
          background: rgba(209, 255, 0, 0.1);
        }

        .btn-delete {
          color: #ff6464;
          border-color: rgba(255, 100, 100, 0.3);
        }

        .btn-delete:hover {
          background: rgba(255, 100, 100, 0.1);
        }

        .alert {
          padding: 15px 20px;
          borderRadius: 4px;
          marginBottom: 20px;
        }

        .alert-error {
          background: rgba(255, 100, 100, 0.1);
          border: 1px solid rgba(255, 100, 100, 0.3);
          color: #ff6464;
        }

        .alert-success {
          background: rgba(100, 255, 100, 0.1);
          border: 1px solid rgba(100, 255, 100, 0.3);
          color: #64ff64;
        }

        .empty-state {
          textAlign: center;
          padding: 60px 20px;
          color: #888;
        }

        .member-image-preview {
          width: 50px;
          height: 50px;
          borderRadius: 50%;
          objectFit: cover;
          border: 2px solid rgba(209, 255, 0, 0.3);
        }
      `}</style>

      <div className="team-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Team Management</h2>
          {!showForm && (
            <button
              className="btn-new-member"
              onClick={() => setShowForm(true)}
            >
              Add Team Member
            </button>
          )}
        </div>

        {error && <div className="alert alert-error">Error: {error}</div>}
        {success && <div className="alert alert-success">Success: {success}</div>}

        {showForm && (
          <div className="form-container">
            <h3 style={{ marginTop: 0 }}>{editingMember ? 'Edit Team Member' : 'Add New Team Member'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="e.g., John Doe"
                    value={formData.name}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    name="role"
                    className="form-input"
                    placeholder="e.g., Club Lead, AI/ML Lead"
                    value={formData.role}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <select
                    name="section"
                    className="form-select"
                    value={formData.section}
                    onChange={handleFormChange}
                  >
                    <option value="LEADS">Leads</option>
                    <option value="CORE_COMMITTEE">Core Committee</option>
                    <option value="DOMAIN_LEADS">Domain Leads</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year Tag</label>
                  <input
                    type="text"
                    name="yearTag"
                    className="form-input"
                    placeholder="e.g., UG2, UG3"
                    value={formData.yearTag}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group full">
                  <label className="form-label">LinkedIn URL</label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    className="form-input"
                    placeholder="https://www.linkedin.com/in/username"
                    value={formData.linkedinUrl}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group full">
                  <label className="form-label">Image URL</label>
                  <input
                    type="text"
                    name="image"
                    className="form-input"
                    placeholder="https://example.com/image.jpg or /src/assets/image.jpg"
                    value={formData.image}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {teamMembers.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '2rem', marginBottom: '15px' }}>No team members yet</div>
            <p>Add your first team member to get started</p>
          </div>
        ) : (
          <table className="team-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Role</th>
                <th>Section</th>
                <th>Year</th>
                <th>LinkedIn</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => (
                <tr key={member._id}>
                  <td>
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="member-image-preview"
                      />
                    ) : (
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'rgba(209, 255, 0, 0.1)',
                        border: '2px solid rgba(209, 255, 0, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem'
                      }}>
                        👤
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: '600' }}>{member.name}</td>
                  <td>{member.role}</td>
                  <td>
                    <span
                      className={`section-badge section-${
                        member.section === 'LEADS' ? 'leads' :
                        member.section === 'CORE_COMMITTEE' ? 'core' : 'domain'
                      }`}
                    >
                      {getSectionLabel(member.section)}
                    </span>
                  </td>
                  <td>{member.yearTag || '-'}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#d1ff00', textDecoration: 'none' }}>
                      {member.linkedinUrl}
                    </a>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(member)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(member._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;
