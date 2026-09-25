import React, { useState } from 'react';
import axios from '@/api/axiosInstance';
import { ROLES, DOMAINS, getDomainLabel } from '@/constants/teamConstants';
import { PERMISSION_LABELS, PERMISSIONS } from '@/utils/rbac';
import { formatImageUrl, compressImageFile } from '@/utils/imageUrl';

const ASSIGNABLE_PERMISSIONS = [
  PERMISSIONS.PROJECTS_CREATE,
  PERMISSIONS.PROJECTS_UPDATE,
  PERMISSIONS.PROJECTS_DELETE,
  PERMISSIONS.EVENTS_CREATE,
  PERMISSIONS.EVENTS_UPDATE,
  PERMISSIONS.EVENTS_DELETE,
];

const TeamManagement = ({ teamMembers, currentUser, onTeamUpdate }) => {
  const [filterView, setFilterView] = useState('active'); // 'active', 'alumni', 'archived'
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [permissionsModalMember, setPermissionsModalMember] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    role: 'Club Coordinator',
    domain: DOMAINS[0] || 'ELECTRONICS',
    email: '',
    password: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    bio: '',
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === 'image' ? formatImageUrl(value) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name?.toLowerCase() || '';
    const isImageExt = /\.(jpe?g|png|webp|svg|gif|jfif)$/i.test(fileName);
    const isImageMime = file.type?.startsWith('image/');

    if (!isImageMime && !isImageExt) {
      setError('Invalid media file type. Supported formats: JPG, PNG, WebP, SVG.');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setError('Media file exceeds 12MB limit.');
      return;
    }

    try {
      const optimizedBase64 = await compressImageFile(file, 800, 800, 0.85);
      setFormData((prev) => ({
        ...prev,
        image: optimizedBase64,
      }));
      setSuccess('Team member photo loaded and optimized successfully.');
    } catch (err) {
      setError('Failed to process image file.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      image: '',
      role: 'Club Coordinator',
      domain: DOMAINS[0] || 'ELECTRONICS',
      email: '',
      password: '',
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: '',
      bio: '',
    });
    setEditingMember(null);
    setShowForm(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const isAlumni = formData.role === 'Alumni';

    if (!formData.name.trim()) {
      setError('Full Name is required');
      return;
    }

    if (!formData.domain) {
      setError('Domain is required');
      return;
    }

    if (!formData.role) {
      setError('Role is required');
      return;
    }

    if (!isAlumni && !formData.email.trim()) {
      setError('Official email is required for active command members to enable authentication.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        image: formData.image ? formatImageUrl(formData.image.trim()) : '',
        domain: formData.domain,
        role: formData.role,
        isAlumni: isAlumni,
        email: formData.email ? formData.email.trim() : '',
        password: formData.password ? formData.password.trim() : undefined,
        linkedinUrl: formData.linkedinUrl ? formData.linkedinUrl.trim() : '',
        githubUrl: formData.githubUrl ? formData.githubUrl.trim() : '',
        portfolioUrl: formData.portfolioUrl ? formData.portfolioUrl.trim() : '',
        bio: formData.bio ? formData.bio.trim() : '',
      };

      if (editingMember) {
        await axios.put(`/api/team/${editingMember._id}`, payload);
        setSuccess('Team member updated successfully!');
      } else {
        await axios.post('/api/team', payload);
        setSuccess('Team member registered and credentials provisioned successfully!');
      }

      setTimeout(() => {
        onTeamUpdate();
        resetForm();
      }, 700);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving team member');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      image: member.image || '',
      role: member.role || (member.isAlumni ? 'Alumni' : 'Wing Member'),
      domain: member.domain || DOMAINS[0],
      email: member.email || '',
      password: '', // Leave blank to preserve password
      linkedinUrl: member.linkedinUrl || '',
      githubUrl: member.githubUrl || '',
      portfolioUrl: member.portfolioUrl || '',
      bio: member.bio || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleOpenPermissions = (member) => {
    setPermissionsModalMember(member);
    setSelectedPermissions(Array.isArray(member.customPermissions) ? member.customPermissions : []);
  };

  const handleTogglePermission = (perm) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSavePermissions = async () => {
    if (!permissionsModalMember) return;
    try {
      setLoading(true);
      setError(null);
      await axios.put(`/api/team/${permissionsModalMember._id}/permissions`, {
        customPermissions: selectedPermissions,
      });
      setSuccess(`Permissions updated successfully for ${permissionsModalMember.name}`);
      setPermissionsModalMember(null);
      onTeamUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating member permissions');
    } finally {
      setLoading(false);
    }
  };

  // Move to Archive (Soft Delete)
  const handleArchive = async (memberId, memberName) => {
    if (!window.confirm(`Archive "${memberName}"? This member will be hidden from public view and moved to Archives.`)) {
      return;
    }

    try {
      setLoading(true);
      await axios.put(`/api/team/${memberId}/archive`);
      setSuccess(`"${memberName}" moved to archives.`);
      onTeamUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Error archiving member');
    } finally {
      setLoading(false);
    }
  };

  // Restore from Archive
  const handleRestore = async (memberId, memberName) => {
    try {
      setLoading(true);
      await axios.put(`/api/team/${memberId}/restore`);
      setSuccess(`"${memberName}" restored to active roster.`);
      onTeamUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Error restoring member');
    } finally {
      setLoading(false);
    }
  };

  // Permanent Hard Delete (Only for archived items)
  const handlePermanentDelete = async (memberId, memberName) => {
    const confirmation = window.confirm(
      `⚠️ PERMANENT DELETE WARNING: Are you sure you want to permanently erase team member "${memberName}" from the database? This action CANNOT be undone!`
    );
    if (!confirmation) return;

    try {
      setLoading(true);
      await axios.delete(`/api/team/${memberId}`);
      setSuccess(`"${memberName}" permanently removed from database.`);
      onTeamUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting member');
    } finally {
      setLoading(false);
    }
  };

  // Roster categories
  const activeMembers = teamMembers.filter((m) => !m.isArchived && m.role !== 'Alumni' && !m.isAlumni);
  const alumniMembers = teamMembers.filter((m) => !m.isArchived && (m.role === 'Alumni' || m.isAlumni));
  const archivedMembers = teamMembers.filter((m) => m.isArchived);

  const displayedMembers =
    filterView === 'archived'
      ? archivedMembers
      : filterView === 'alumni'
      ? alumniMembers
      : activeMembers;

  const isAlumniSelected = formData.role === 'Alumni';

  return (
    <div className="team-mgmt-root">
      <style>{`
        .team-mgmt-root {
          color: #fff;
          font-family: var(--font-body);
        }

        .action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .view-toggle {
          display: flex;
          background: #111;
          border: 1px solid var(--border);
          border-radius: 4px;
          overflow: hidden;
        }

        .toggle-btn {
          padding: 8px 16px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          text-transform: uppercase;
          transition: all 0.2s ease;
        }

        .toggle-btn.active {
          background: var(--neon);
          color: #000;
          font-weight: 700;
        }

        .btn-create {
          background: var(--neon);
          color: #000;
          font-family: var(--font-mono);
          font-weight: 700;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }

        .btn-create:hover {
          box-shadow: 0 0 20px var(--neon-glow);
          transform: translateY(-2px);
        }

        .form-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-left: 3px solid var(--neon);
          padding: 30px;
          margin-bottom: 35px;
          animation: fadeIn 0.4s var(--ease);
        }

        .form-title {
          font-family: var(--font-display);
          font-size: 2.2rem;
          color: var(--text);
          margin-bottom: 20px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        @media (max-width: 800px) {
          .form-grid-2, .form-grid-3 {
            grid-template-columns: 1fr;
          }
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-label {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .field-input, .field-select, .field-textarea {
          background: #000;
          border: 1px solid var(--border);
          padding: 12px 14px;
          color: #fff;
          font-family: var(--font-mono);
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .field-input:focus, .field-select:focus, .field-textarea:focus {
          border-color: var(--neon);
        }

        .field-select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23d1ff00%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat;
          background-position: right 12px top 50%;
          background-size: 10px auto;
          cursor: pointer;
        }

        .form-actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 25px;
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
          background: var(--surface);
          border: 1px solid var(--border);
        }

        .mgmt-table {
          width: 100%;
          border-collapse: collapse;
          font-family: var(--font-body);
        }

        .mgmt-table th, .mgmt-table td {
          padding: 16px 20px;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }

        .mgmt-table th {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          background: #080808;
        }

        .mgmt-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        .member-cell-flex {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .member-avatar-mini {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--border);
          background: #111;
        }

        .badge-role-coord {
          background: rgba(209, 255, 0, 0.15);
          color: var(--neon);
          border: 1px solid rgba(209, 255, 0, 0.4);
          padding: 4px 10px;
          font-size: 0.72rem;
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .badge-role-exec {
          background: rgba(0, 220, 255, 0.12);
          color: #00dcff;
          border: 1px solid rgba(0, 220, 255, 0.4);
          padding: 4px 10px;
          font-size: 0.72rem;
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        .badge-role-wing {
          background: rgba(100, 255, 100, 0.12);
          color: #64ff64;
          border: 1px solid rgba(100, 255, 100, 0.4);
          padding: 4px 10px;
          font-size: 0.72rem;
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .badge-role-alumni {
          background: rgba(192, 132, 252, 0.15);
          color: #c084fc;
          border: 1px solid rgba(192, 132, 252, 0.4);
          padding: 4px 10px;
          font-size: 0.72rem;
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        .btn-action-perm, .btn-action-edit, .btn-action-archive, .btn-action-restore, .btn-action-delete {
          padding: 6px 12px;
          border: none;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          cursor: pointer;
          margin-left: 8px;
          border-radius: 2px;
          transition: all 0.2s;
        }

        .btn-action-perm {
          background: rgba(209, 255, 0, 0.1);
          color: var(--neon);
          border: 1px solid rgba(209, 255, 0, 0.3);
        }

        .btn-action-perm:hover {
          background: var(--neon);
          color: #000;
        }

        .btn-action-edit {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          border: 1px solid var(--border);
        }

        .btn-action-edit:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .btn-action-archive {
          background: rgba(255, 180, 50, 0.1);
          color: #ffb432;
          border: 1px solid rgba(255, 180, 50, 0.3);
        }

        .btn-action-archive:hover {
          background: #ffb432;
          color: #000;
        }

        .btn-action-restore {
          background: rgba(100, 255, 100, 0.1);
          color: #64ff64;
          border: 1px solid rgba(100, 255, 100, 0.3);
        }

        .btn-action-restore:hover {
          background: #64ff64;
          color: #000;
        }

        .btn-action-delete {
          background: rgba(255, 100, 100, 0.1);
          color: #ff6464;
          border: 1px solid rgba(255, 100, 100, 0.3);
        }

        .btn-action-delete:hover {
          background: #ff6464;
          color: #000;
        }

        /* Permissions Modal */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .modal-card {
          background: #0a0a0a;
          border: 1px solid var(--neon);
          box-shadow: 0 0 40px rgba(209, 255, 0, 0.2);
          width: 100%;
          max-width: 600px;
          padding: 30px;
        }

        .perm-checkbox-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          cursor: pointer;
        }

        .perm-checkbox-row:hover {
          background: rgba(209, 255, 0, 0.04);
        }

        .perm-checkbox-row input {
          accent-color: var(--neon);
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .banner-msg {
          padding: 12px 18px;
          margin-bottom: 20px;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          border-left: 3px solid;
        }

        .banner-error {
          background: rgba(255, 100, 100, 0.1);
          border-color: #ff6464;
          color: #ff6464;
        }

        .banner-success {
          background: rgba(100, 255, 100, 0.1);
          border-color: #64ff64;
          color: #64ff64;
        }
      `}</style>

      {/* BANNER NOTIFICATIONS */}
      {error && <div className="banner-msg banner-error">⚠️ {error}</div>}
      {success && <div className="banner-msg banner-success">✓ {success}</div>}

      {/* ACTION BAR */}
      <div className="action-bar">
        <div className="view-toggle">
          <button
            onClick={() => setFilterView('active')}
            className={`toggle-btn ${filterView === 'active' ? 'active' : ''}`}
          >
            Present Command ({activeMembers.length})
          </button>
          <button
            onClick={() => setFilterView('alumni')}
            className={`toggle-btn ${filterView === 'alumni' ? 'active' : ''}`}
          >
            Alumni Registry ({alumniMembers.length})
          </button>
          <button
            onClick={() => setFilterView('archived')}
            className={`toggle-btn ${filterView === 'archived' ? 'active' : ''}`}
          >
            Archives ({archivedMembers.length})
          </button>
        </div>

        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="btn-create"
        >
          {showForm ? 'Cancel Form' : '+ Provision Team Member'}
        </button>
      </div>

      {/* MEMBER PROVISIONING FORM */}
      {showForm && (
        <div className="form-card">
          <h2 className="form-title">
            {editingMember ? 'Edit Team Member Profile' : 'Provision New Team Member'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
            Authoritative member profile and authentication management. All permissions and login access are strictly managed here.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-grid-3">
              <div className="field-group">
                <label className="field-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Lohithkumar Morishetti"
                  className="field-input"
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label">Role Hierarchy *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  className="field-select"
                  required
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Engineering Domain *</label>
                <select
                  name="domain"
                  value={formData.domain}
                  onChange={handleFormChange}
                  className="field-select"
                  required
                >
                  {DOMAINS.map((domain) => (
                    <option key={domain} value={domain}>
                      {getDomainLabel(domain)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="field-group">
                <label className="field-label">
                  Official Email {!isAlumniSelected && '*'}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="member@nexsync.org"
                  className="field-input"
                  required={!isAlumniSelected}
                />
              </div>

              {!isAlumniSelected && (
                <div className="field-group">
                  <label className="field-label">
                    {editingMember ? 'Change Password (Optional)' : 'Initial Password *'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    placeholder={
                      editingMember
                        ? 'Leave blank to preserve current password'
                        : 'e.g. NexSync@2026!'
                    }
                    className="field-input"
                    required={!editingMember}
                  />
                </div>
              )}
            </div>

            <div className="field-group" style={{ marginBottom: '20px' }}>
              <label className="field-label">Photo / Profile Image</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleFormChange}
                  placeholder="Paste direct URL, Google Drive share link, or upload local file"
                  className="field-input"
                  style={{ flex: '1 1 300px' }}
                />
                <label
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid var(--border)',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    color: 'var(--neon)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  📁 Upload Local File
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleImageFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                {formData.image && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        image: '',
                      }))
                    }
                    style={{
                      background: 'rgba(255, 100, 100, 0.1)',
                      border: '1px solid rgba(255, 100, 100, 0.3)',
                      color: '#ff6464',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                    }}
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                💡 <strong>Local file:</strong> Max 5MB (JPG, PNG, WebP). | <strong>Google Drive link:</strong> Ensure file sharing is set to <em>&ldquo;Anyone with the link can view&rdquo;</em>.
              </div>
              {formData.image && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '4px',
                      border: '1px solid var(--neon)',
                      overflow: 'hidden',
                      background: '#111',
                    }}
                  >
                    <img
                      src={formData.image}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#64ff64', fontFamily: 'var(--font-mono)' }}>
                    ✓ Photo loaded for preview
                  </span>
                </div>
              )}
            </div>

            <div className="form-grid-3">
              <div className="field-group">
                <label className="field-label">LinkedIn Profile URL</label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleFormChange}
                  placeholder="https://linkedin.com/in/..."
                  className="field-input"
                />
              </div>

              <div className="field-group">
                <label className="field-label">GitHub URL</label>
                <input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleFormChange}
                  placeholder="https://github.com/..."
                  className="field-input"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Portfolio URL</label>
                <input
                  type="url"
                  name="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={handleFormChange}
                  placeholder="https://portfolio.dev"
                  className="field-input"
                />
              </div>
            </div>

            <div className="field-group" style={{ marginBottom: '20px' }}>
              <label className="field-label">Bio / Technical Focus</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleFormChange}
                placeholder="Autonomous navigation engineer, embedded systems developer..."
                rows={3}
                className="field-textarea"
              />
            </div>

            <div className="form-actions-row">
              <button
                type="button"
                onClick={resetForm}
                className="btn-action-edit"
                style={{ padding: '10px 20px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-create"
                style={{ padding: '10px 24px' }}
              >
                {loading ? 'Processing...' : editingMember ? 'Update Member' : 'Provision Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PERSONNEL TABLE (Classification column removed; single authoritative Role) */}
      <div className="table-responsive">
        <table className="mgmt-table">
          <thead>
            <tr>
              <th>Personnel</th>
              <th>Role</th>
              <th>Domain</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedMembers.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  {filterView === 'archived'
                    ? 'No archived personnel records found.'
                    : filterView === 'alumni'
                    ? 'No alumni personnel found.'
                    : 'No present command members found. Provision one above!'}
                </td>
              </tr>
            ) : (
              displayedMembers.map((member) => (
                <tr key={member._id}>
                  <td>
                    <div className="member-cell-flex">
                      {member.image ? (
                        <img
                          src={formatImageUrl(member.image)}
                          alt={member.name}
                          className="member-avatar-mini"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          className="member-avatar-mini"
                          style={{
                            display: 'grid',
                            placeItems: 'center',
                            color: '#666',
                            fontSize: '10px',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          IMG
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: '600', color: '#fff' }}>{member.name}</div>
                        {member.email && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                            {member.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={
                        member.role === 'Club Coordinator'
                          ? 'badge-role-coord'
                          : member.role === 'Executive Member'
                          ? 'badge-role-exec'
                          : member.role === 'Alumni' || member.isAlumni
                          ? 'badge-role-alumni'
                          : 'badge-role-wing'
                      }
                    >
                      {member.role || 'Wing Member'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#00dcff' }}>
                      {getDomainLabel(member.domain) || 'N/A'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {!member.isArchived ? (
                      <>
                        {member.role !== 'Club Coordinator' && member.role !== 'Alumni' && !member.isAlumni && (
                          <button
                            onClick={() => handleOpenPermissions(member)}
                            className="btn-action-perm"
                            title="Manage granular RBAC permissions"
                          >
                            🔑 Permissions
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(member)}
                          className="btn-action-edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleArchive(member._id, member.name)}
                          className="btn-action-archive"
                        >
                          📦 Archive
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleRestore(member._id, member.name)}
                          className="btn-action-restore"
                        >
                          ↺ Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(member._id, member.name)}
                          className="btn-action-delete"
                        >
                          🗑️ Permanently Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* RBAC PERMISSION DELEGATION MODAL (Coordinator-Controlled) */}
      {permissionsModalMember && (
        <div className="modal-overlay" onClick={() => setPermissionsModalMember(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--neon)', marginBottom: '8px', textTransform: 'uppercase' }}>
              DELEGATE PERMISSIONS
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', fontFamily: 'var(--font-mono)' }}>
              Coordinator-controlled RBAC assignment for <strong>{permissionsModalMember.name}</strong> ({permissionsModalMember.role}).
            </p>

            <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {ASSIGNABLE_PERMISSIONS.map((perm) => (
                <label key={perm} className="perm-checkbox-row">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm)}
                    onChange={() => handleTogglePermission(perm)}
                  />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#fff' }}>
                      {PERMISSION_LABELS[perm] || perm}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#888', fontFamily: 'var(--font-mono)' }}>
                      {perm}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setPermissionsModalMember(null)}
                className="btn-action-edit"
                style={{ padding: '8px 18px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={loading}
                className="btn-create"
                style={{ padding: '8px 20px' }}
              >
                {loading ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
