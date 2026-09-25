import React, { useState } from 'react';
import axios from '@/api/axiosInstance';
import VideoPlayer from '@/components/ui/VideoPlayer';
import { canCreateProjects, canUpdateProjects, canDeleteProjects } from '@/utils/rbac';
import { formatImageUrl } from '@/utils/imageUrl';

const PROJECT_STATUSES = ['Active', 'Future', 'Completed', 'Alumni'];

const ProjectManagement = ({ projects, currentUser, onProjectsUpdate }) => {
  const [viewArchived, setViewArchived] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newGalleryImage, setNewGalleryImage] = useState('');

  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    description: '',
    coverImage: '',
    thumbnail: '',
    videoUrl: '',
    techStack: '',
    teamMembers: '',
    repoLink: '',
    demoLink: '',
    docLink: '',
    startDate: '',
    endDate: '',
    status: 'Active',
    isFeatured: false,
    galleryImages: [],
  });

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      // Keep coverImage and thumbnail synchronized
      if (name === 'coverImage') {
        const formatted = formatImageUrl(value);
        updated.coverImage = formatted;
        updated.thumbnail = formatted;
      } else if (name === 'thumbnail') {
        const formatted = formatImageUrl(value);
        updated.thumbnail = formatted;
        updated.coverImage = formatted;
      }
      return updated;
    });
  };

  const handleAddGalleryImage = () => {
    if (!newGalleryImage.trim()) return;
    setFormData((prev) => ({
      ...prev,
      galleryImages: [...(prev.galleryImages || []), formatImageUrl(newGalleryImage.trim())],
    }));
    setNewGalleryImage('');
  };

  const handleRemoveGalleryImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: (prev.galleryImages || []).filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid media file type. Supported formats: JPG, PNG, WebP, SVG.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Media file exceeds 5MB limit. Please upload an optimized image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target.result;
      setFormData((prev) => ({
        ...prev,
        coverImage: base64,
        thumbnail: base64,
      }));
      setSuccess('Project cover image loaded successfully.');
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const isVideoUrlValid = (url) => {
    if (!url || !url.trim()) return true;
    const trimmed = url.trim();
    const isYoutube = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))/i.test(trimmed);
    const isVimeo = /vimeo\.com\//i.test(trimmed);
    const isVideoFile = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed);
    return isYoutube || isVimeo || isVideoFile;
  };

  const resetForm = () => {
    setFormData({
      projectId: '',
      projectName: '',
      description: '',
      coverImage: '',
      thumbnail: '',
      videoUrl: '',
      techStack: '',
      teamMembers: '',
      repoLink: '',
      demoLink: '',
      docLink: '',
      startDate: '',
      endDate: '',
      status: 'Active',
      isFeatured: false,
      galleryImages: [],
    });
    setNewGalleryImage('');
    setEditingProject(null);
    setShowForm(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.projectId.trim() || !formData.projectName.trim() || !formData.description.trim()) {
      setError('Project ID, Project Name, and Description are required');
      return;
    }

    try {
      setLoading(true);
      const effectiveCover = (formData.coverImage || formData.thumbnail || '').trim();
      const payload = {
        projectId: formData.projectId.trim(),
        projectName: formData.projectName.trim(),
        description: formData.description.trim(),
        coverImage: effectiveCover,
        thumbnail: effectiveCover,
        videoUrl: (formData.videoUrl || '').trim(),
        techStack: formData.techStack
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        teamMembers: formData.teamMembers
          .split(',')
          .map((m) => m.trim())
          .filter(Boolean),
        repoLink: formData.repoLink.trim(),
        demoLink: formData.demoLink.trim(),
        docLink: formData.docLink.trim(),
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        status: formData.status,
        isFeatured: Boolean(formData.isFeatured),
        galleryImages: formData.galleryImages || [],
      };

      if (editingProject) {
        await axios.put(`/api/projects/${editingProject._id}`, payload);
        setSuccess('Project updated successfully!');
      } else {
        await axios.post('/api/projects', payload);
        setSuccess('Project created successfully!');
      }

      setTimeout(() => {
        onProjectsUpdate();
        resetForm();
      }, 700);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving project');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    const cover = project.coverImage || project.thumbnail || '';
    setFormData({
      projectId: project.projectId || '',
      projectName: project.projectName || '',
      description: project.description || '',
      coverImage: cover,
      thumbnail: cover,
      videoUrl: project.videoUrl || '',
      techStack: Array.isArray(project.techStack) ? project.techStack.join(', ') : project.techStack || '',
      teamMembers: Array.isArray(project.teamMembers) ? project.teamMembers.join(', ') : project.teamMembers || '',
      repoLink: project.repoLink || '',
      demoLink: project.demoLink || '',
      docLink: project.docLink || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      status: project.status || 'Active',
      isFeatured: Boolean(project.isFeatured),
      galleryImages: Array.isArray(project.galleryImages) ? [...project.galleryImages] : [],
    });
    setNewGalleryImage('');
    setShowForm(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Move to Archive (Soft Delete)
  const handleArchive = async (projectId, projectName) => {
    if (!window.confirm(`Archive project "${projectName}"? This project will be hidden from public view and moved to Archives.`)) {
      return;
    }

    try {
      setLoading(true);
      await axios.put(`/api/projects/${projectId}/archive`);
      setSuccess(`"${projectName}" moved to archives.`);
      onProjectsUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Error archiving project');
    } finally {
      setLoading(false);
    }
  };

  // Restore from Archive
  const handleRestore = async (projectId, projectName) => {
    try {
      setLoading(true);
      await axios.put(`/api/projects/${projectId}/restore`);
      setSuccess(`"${projectName}" restored to active project repository.`);
      onProjectsUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Error restoring project');
    } finally {
      setLoading(false);
    }
  };

  // Permanent Hard Delete (Only for archived items)
  const handlePermanentDelete = async (projectId, projectName) => {
    const confirmation = window.confirm(
      `⚠️ PERMANENT DELETE WARNING: Are you completely sure you want to permanently erase project "${projectName}" from the database? This action CANNOT be undone!`
    );
    if (!confirmation) return;

    try {
      setLoading(true);
      await axios.delete(`/api/projects/${projectId}`);
      setSuccess(`"${projectName}" permanently deleted from database.`);
      onProjectsUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting project');
    } finally {
      setLoading(false);
    }
  };

  const activeProjects = projects.filter((p) => !p.isArchived);
  const archivedProjects = projects.filter((p) => p.isArchived);
  const displayedProjects = viewArchived ? archivedProjects : activeProjects;

  return (
    <div className="project-mgmt-root">
      <style>{`
        .project-mgmt-root {
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
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          padding: 4px;
          border-radius: 4px;
          border: 1px solid var(--border);
        }

        .view-btn {
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

        .view-btn.active {
          background: var(--neon);
          color: #000;
          font-weight: 700;
        }

        .btn-create {
          padding: 10px 22px;
          background: var(--neon);
          color: #000;
          border: none;
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
          clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
        }

        .btn-create:hover {
          box-shadow: 0 0 20px var(--neon-glow);
          transform: translateY(-2px);
        }

        .form-card {
          background: var(--surface);
          border: 1px solid var(--border-bright);
          padding: 30px;
          margin-bottom: 35px;
          animation: fadeIn 0.4s var(--ease);
        }

        .form-title {
          font-family: var(--font-display);
          font-size: 2rem;
          color: var(--neon);
          margin-bottom: 20px;
          text-transform: uppercase;
        }

        .form-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 18px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-label {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .field-input, .field-select, .field-textarea {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          color: #fff;
          padding: 10px 12px;
          font-family: var(--font-mono);
          font-size: 0.9rem;
          transition: border-color 0.2s;
        }

        .field-input:focus, .field-select:focus, .field-textarea:focus {
          outline: none;
          border-color: var(--neon);
          background: rgba(209, 255, 0, 0.03);
        }

        .form-actions-row {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .table-responsive {
          overflow-x: auto;
          background: var(--surface);
          border: 1px solid var(--border);
        }

        .mgmt-table {
          width: 100%;
          border-collapse: collapse;
          font-family: var(--font-mono);
          font-size: 0.85rem;
        }

        .mgmt-table th {
          background: rgba(255, 255, 255, 0.02);
          padding: 14px 16px;
          text-align: left;
          color: var(--neon);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 1px solid var(--border);
        }

        .mgmt-table td {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          vertical-align: middle;
        }

        .mgmt-table tr:hover td {
          background: rgba(209, 255, 0, 0.02);
        }

        .badge-status {
          display: inline-block;
          padding: 4px 8px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 1px;
          border-radius: 2px;
        }

        .status-active {
          background: rgba(209, 255, 0, 0.15);
          color: var(--neon);
          border: 1px solid var(--neon);
        }

        .status-future {
          background: rgba(0, 220, 255, 0.15);
          color: #00dcff;
          border: 1px solid #00dcff;
        }

        .status-completed {
          background: rgba(150, 150, 150, 0.15);
          color: #aaa;
          border: 1px solid #666;
        }

        .status-alumni {
          background: rgba(180, 120, 255, 0.15);
          color: #c084fc;
          border: 1px solid #c084fc;
        }

        .btn-action-edit {
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          color: #fff;
          cursor: pointer;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          margin-right: 6px;
          transition: all 0.2s;
        }

        .btn-action-edit:hover {
          border-color: var(--neon);
          color: var(--neon);
        }

        .btn-action-archive {
          padding: 6px 12px;
          background: rgba(255, 170, 0, 0.1);
          border: 1px solid rgba(255, 170, 0, 0.4);
          color: #ffaa00;
          cursor: pointer;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          transition: all 0.2s;
        }

        .btn-action-archive:hover {
          background: rgba(255, 170, 0, 0.25);
          color: #fff;
        }

        .btn-action-restore {
          padding: 6px 12px;
          background: rgba(100, 255, 100, 0.1);
          border: 1px solid rgba(100, 255, 100, 0.4);
          color: #64ff64;
          cursor: pointer;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          margin-right: 6px;
          transition: all 0.2s;
        }

        .btn-action-restore:hover {
          background: rgba(100, 255, 100, 0.25);
        }

        .btn-action-delete {
          padding: 6px 12px;
          background: rgba(255, 60, 60, 0.1);
          border: 1px solid rgba(255, 60, 60, 0.4);
          color: #ff5555;
          cursor: pointer;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          transition: all 0.2s;
        }

        .btn-action-delete:hover {
          background: rgba(255, 60, 60, 0.3);
          color: #fff;
        }

        .alert-banner {
          padding: 12px 18px;
          margin-bottom: 20px;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          border-radius: 4px;
        }

        .alert-success {
          background: rgba(100, 255, 100, 0.1);
          border: 1px solid rgba(100, 255, 100, 0.4);
          color: #64ff64;
        }

        .alert-error {
          background: rgba(255, 60, 60, 0.1);
          border: 1px solid rgba(255, 60, 60, 0.4);
          color: #ff5555;
        }

        .gallery-manager-box {
          margin-top: 24px;
          margin-bottom: 24px;
          padding: 20px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px dashed rgba(209, 255, 0, 0.35);
          border-radius: 4px;
        }

        .gallery-manager-title {
          font-family: var(--font-mono);
          font-size: 0.95rem;
          color: var(--neon);
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .gallery-manager-subtitle {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }

        .gallery-add-row {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .gallery-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 12px;
        }

        .gallery-preview-item {
          position: relative;
          background: #0d0d0d;
          border: 1px solid var(--border);
          border-radius: 4px;
          overflow: hidden;
          padding: 6px;
        }

        .gallery-preview-thumb {
          width: 100%;
          height: 80px;
          object-fit: cover;
          display: block;
          border-radius: 2px;
        }

        .btn-remove-gallery-img {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(255, 40, 40, 0.85);
          border: none;
          color: #fff;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, background 0.2s;
        }

        .btn-remove-gallery-img:hover {
          background: #ff0000;
          transform: scale(1.15);
        }

        .gallery-url-caption {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          color: #888;
          margin-top: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>

      {success && <div className="alert-banner alert-success">✅ {success}</div>}
      {error && <div className="alert-banner alert-error">❌ {error}</div>}

      <div className="action-bar">
        <div className="view-toggle">
          <button
            onClick={() => setViewArchived(false)}
            className={`view-btn ${!viewArchived ? 'active' : ''}`}
          >
            Active Projects ({activeProjects.length})
          </button>
          <button
            onClick={() => setViewArchived(true)}
            className={`view-btn ${viewArchived ? 'active' : ''}`}
          >
            📦 Archived Projects ({archivedProjects.length})
          </button>
        </div>

        {!viewArchived && canCreateProjects(currentUser) && (
          <button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className="btn-create"
          >
            {showForm ? 'Cancel Form' : '+ Register New Project'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-card">
          <h2 className="form-title">
            {editingProject ? 'Edit Project Build' : 'Register New Project Build'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid-3">
              <div className="field-group">
                <label className="field-label">Project Code / ID *</label>
                <input
                  type="text"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleFormChange}
                  placeholder="e.g. PRJ-07 or SYS-03"
                  className="field-input"
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label">Project Name *</label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleFormChange}
                  placeholder="e.g. V2X COOPERATIVE PERCEPTION"
                  className="field-input"
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label">Project Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="field-select"
                  required
                >
                  {PROJECT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="field-group">
                <label className="field-label">Technologies (Comma separated)</label>
                <input
                  type="text"
                  name="techStack"
                  value={formData.techStack}
                  onChange={handleFormChange}
                  placeholder="C++, ROS2, Jetson, Python"
                  className="field-input"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Project Cover Image (Display Banner)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    name="coverImage"
                    value={formData.coverImage || formData.thumbnail}
                    onChange={handleFormChange}
                    placeholder="https://... or /assets/..."
                    className="field-input"
                    style={{ flexGrow: 1 }}
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
                    }}
                  >
                    📁 Upload File
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleImageFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {(formData.coverImage || formData.thumbnail) && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          coverImage: '',
                          thumbnail: '',
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
                {(formData.coverImage || formData.thumbnail) && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={formData.coverImage || formData.thumbnail}
                      alt="Cover Preview"
                      style={{ height: '50px', width: '90px', objectFit: 'cover', border: '1px solid var(--neon)' }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64ff64', fontFamily: 'var(--font-mono)' }}>
                      ✓ Cover image preview ready
                    </span>
                  </div>
                )}
              </div>

              <div className="field-group">
                <label className="field-label">Video Media URL (YouTube, Vimeo, MP4)</label>
                <input
                  type="text"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleFormChange}
                  placeholder="https://youtube.com/watch?v=... or .mp4"
                  className="field-input"
                />
                {formData.videoUrl && (
                  <div style={{ marginTop: '4px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                    {isVideoUrlValid(formData.videoUrl) ? (
                      <span style={{ color: '#64ff64' }}>✓ Valid streaming source identified</span>
                    ) : (
                      <span style={{ color: '#ffb432' }}>⚠️ Unrecognized format. Please provide a YouTube, Vimeo, or .mp4/.webm URL.</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {formData.videoUrl && isVideoUrlValid(formData.videoUrl) && (
              <div style={{ marginBottom: '18px', maxWidth: '500px' }}>
                <span className="field-label" style={{ display: 'block', marginBottom: '6px' }}>VIDEO LIVE PREVIEW:</span>
                <VideoPlayer url={formData.videoUrl} title="Form Preview" poster={formData.coverImage} />
              </div>
            )}

            <div className="form-grid-3">
              <div className="field-group">
                <label className="field-label">Repository URL (GitHub)</label>
                <input
                  type="url"
                  name="repoLink"
                  value={formData.repoLink}
                  onChange={handleFormChange}
                  placeholder="https://github.com/nexsync/..."
                  className="field-input"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Live Demo URL</label>
                <input
                  type="url"
                  name="demoLink"
                  value={formData.demoLink}
                  onChange={handleFormChange}
                  placeholder="https://demo.nexsync.org"
                  className="field-input"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Documentation URL</label>
                <input
                  type="url"
                  name="docLink"
                  value={formData.docLink}
                  onChange={handleFormChange}
                  placeholder="https://docs.nexsync.org"
                  className="field-input"
                />
              </div>
            </div>

            <div className="form-grid-3">
              <div className="field-group">
                <label className="field-label">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleFormChange}
                  className="field-input"
                />
              </div>

              <div className="field-group">
                <label className="field-label">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleFormChange}
                  className="field-input"
                />
              </div>
            </div>

            <div className="field-group" style={{ marginBottom: '18px' }}>
              <label className="field-label">Project Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows={3}
                placeholder="Comprehensive technical breakdown of architecture, telemetry, and capabilities..."
                className="field-textarea"
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: editingProject ? '16px' : '0' }}>
              <input
                type="checkbox"
                id="isFeaturedProject"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleFormChange}
                style={{ width: '16px', height: '16px', accentColor: 'var(--neon)' }}
              />
              <label htmlFor="isFeaturedProject" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                Featured Project (Flagship build displayed prominently)
              </label>
            </div>

            {/* GALLERY IMAGES SECTION */}
            <div className="gallery-manager-box">
              <h4 className="gallery-manager-title">
                📸 Project Gallery Images ({formData.galleryImages?.length || 0})
              </h4>
              <p className="gallery-manager-subtitle">
                Manage screenshots, telemetry captures, and prototype photos. Public project detail page shows these in an interactive gallery grid.
              </p>

              <div className="gallery-add-row">
                <input
                  type="text"
                  value={newGalleryImage}
                  onChange={(e) => setNewGalleryImage(e.target.value)}
                  placeholder="Enter image URL (https://... or /assets/...)"
                  className="field-input"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="btn-create"
                  style={{ padding: '8px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                >
                  + Add Image
                </button>
              </div>

              {formData.galleryImages?.length > 0 && (
                <div className="gallery-preview-grid">
                  {formData.galleryImages.map((imgUrl, idx) => (
                    <div key={idx} className="gallery-preview-item">
                      <img
                        src={imgUrl}
                        alt={`Gallery ${idx + 1}`}
                        className="gallery-preview-thumb"
                        onError={(e) => {
                          e.target.style.opacity = '0.3';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="btn-remove-gallery-img"
                        title="Remove image"
                      >
                        ✕
                      </button>
                      <div className="gallery-url-caption">
                        {imgUrl.length > 25 ? imgUrl.substring(0, 22) + '...' : imgUrl}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                {loading ? 'Processing...' : editingProject ? 'Update Project' : 'Register Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-responsive">
        <table className="mgmt-table">
          <thead>
            <tr>
              <th>Project ID & Name</th>
              <th>Status</th>
              <th>Tech Stack</th>
              <th>Links</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedProjects.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  {viewArchived ? 'No archived projects found.' : 'No active projects found. Create one above!'}
                </td>
              </tr>
            ) : (
              displayedProjects.map((proj) => (
                <tr key={proj._id}>
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon)', fontSize: '0.75rem' }}>
                      {proj.projectId}
                    </div>
                    <div style={{ fontWeight: '600', color: '#fff' }}>{proj.projectName}</div>
                  </td>
                  <td>
                    <span
                      className={`badge-status ${
                        proj.status === 'Active'
                          ? 'status-active'
                          : proj.status === 'Future'
                          ? 'status-future'
                          : proj.status === 'Alumni'
                          ? 'status-alumni'
                          : 'status-completed'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                      {Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {proj.repoLink && (
                        <a
                          href={proj.repoLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--neon)', textDecoration: 'underline' }}
                        >
                          Code
                        </a>
                      )}
                      {proj.demoLink && (
                        <a
                          href={proj.demoLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#00dcff', textDecoration: 'underline' }}
                        >
                          Demo
                        </a>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {!proj.isArchived ? (
                      <>
                        {canUpdateProjects(currentUser) && (
                          <button
                            onClick={() => handleEdit(proj)}
                            className="btn-action-edit"
                          >
                            ✏️ Edit
                          </button>
                        )}
                        {canDeleteProjects(currentUser) && (
                          <button
                            onClick={() => handleArchive(proj._id, proj.projectName)}
                            className="btn-action-archive"
                          >
                            📦 Archive
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {canUpdateProjects(currentUser) && (
                          <button
                            onClick={() => handleRestore(proj._id, proj.projectName)}
                            className="btn-action-restore"
                          >
                            ↺ Restore
                          </button>
                        )}
                        {canDeleteProjects(currentUser) && (
                          <button
                            onClick={() => handlePermanentDelete(proj._id, proj.projectName)}
                            className="btn-action-delete"
                          >
                            🗑️ Permanently Delete
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectManagement;
