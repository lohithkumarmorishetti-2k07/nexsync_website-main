import React, { useState } from 'react';
import axios from '@/api/axiosInstance';
import VideoPlayer from '@/components/ui/VideoPlayer';
import { canCreateEvents, canUpdateEvents, canDeleteEvents } from '@/utils/rbac';
import { formatImageUrl, compressImageFile } from '@/utils/imageUrl';

const EVENT_STATUSES = ['Upcoming', 'Ongoing', 'Completed'];
const EVENT_TYPES = ['HACKATHON', 'WORKSHOP', 'SYMPOSIUM', 'SPRINT', 'EVENT'];

const EventManagement = ({ events, currentUser, onEventsUpdate }) => {
  const [viewArchived, setViewArchived] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newGalleryImage, setNewGalleryImage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    eventHeader: '',
    description: '',
    coverImage: '',
    image: '',
    videoUrl: '',
    startDate: '',
    endDate: '',
    timeRange: '',
    duration: '',
    location: '',
    eventType: 'EVENT',
    status: 'Upcoming',
    rsvpLink: '',
    registrationDeadline: '',
    organizer: 'NexSync Autonomous Mobility',
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
      // Keep coverImage and image in sync
      if (name === 'coverImage') {
        const formatted = formatImageUrl(value);
        updated.coverImage = formatted;
        updated.image = formatted;
      } else if (name === 'image') {
        const formatted = formatImageUrl(value);
        updated.image = formatted;
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
      const optimizedBase64 = await compressImageFile(file, 1400, 900, 0.82);
      setFormData((prev) => ({
        ...prev,
        coverImage: optimizedBase64,
        image: optimizedBase64,
      }));
      setSuccess('Event cover image loaded and optimized successfully.');
    } catch (err) {
      setError('Failed to process image file.');
    }
  };

  const handleGalleryFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const optimizedBase64 = await compressImageFile(file, 1200, 800, 0.82);
      setFormData((prev) => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), optimizedBase64],
      }));
      setSuccess('Gallery photo loaded and added.');
    } catch (err) {
      setError('Failed to process gallery image.');
    }
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
      title: '',
      eventHeader: '',
      description: '',
      coverImage: '',
      image: '',
      videoUrl: '',
      startDate: '',
      endDate: '',
      timeRange: '',
      duration: '',
      location: '',
      eventType: 'EVENT',
      status: 'Upcoming',
      rsvpLink: '',
      registrationDeadline: '',
      organizer: 'NexSync Autonomous Mobility',
      isFeatured: false,
      galleryImages: [],
    });
    setNewGalleryImage('');
    setEditingEvent(null);
    setShowForm(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.title.trim() || !formData.startDate || !formData.location.trim()) {
      setError('Title, Start Date, and Location are required');
      return;
    }

    try {
      setLoading(true);
      const effectiveCover = (formData.coverImage || formData.image || '').trim();
      const payload = {
        title: formData.title.trim(),
        eventHeader: (formData.eventHeader || '').trim(),
        description: (formData.description || '').trim(),
        coverImage: effectiveCover,
        image: effectiveCover,
        videoUrl: (formData.videoUrl || '').trim(),
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        timeRange: formData.timeRange.trim(),
        duration: formData.duration.trim(),
        location: formData.location.trim(),
        eventType: formData.eventType,
        status: formData.status,
        rsvpLink: formData.rsvpLink.trim(),
        registrationDeadline: formData.registrationDeadline || undefined,
        organizer: formData.organizer.trim(),
        isFeatured: Boolean(formData.isFeatured),
        galleryImages: formData.galleryImages || [],
      };

      if (editingEvent) {
        await axios.put(`/api/events/${editingEvent._id}`, payload);
        setSuccess('Event updated successfully!');
      } else {
        await axios.post('/api/events', payload);
        setSuccess('Event created successfully!');
      }

      setTimeout(() => {
        onEventsUpdate();
        resetForm();
      }, 700);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving event');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    const cover = event.coverImage || event.image || '';
    setFormData({
      title: event.title || '',
      eventHeader: event.eventHeader || '',
      description: event.description || '',
      coverImage: cover,
      image: cover,
      videoUrl: event.videoUrl || '',
      startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
      timeRange: event.timeRange || '',
      duration: event.duration || '',
      location: event.location || '',
      eventType: event.eventType || 'EVENT',
      status: event.status || 'Upcoming',
      rsvpLink: event.rsvpLink || event.redirectUrl || '',
      registrationDeadline: event.registrationDeadline
        ? new Date(event.registrationDeadline).toISOString().split('T')[0]
        : '',
      organizer: event.organizer || 'NexSync Autonomous Mobility',
      isFeatured: Boolean(event.isFeatured),
      galleryImages: Array.isArray(event.galleryImages) ? [...event.galleryImages] : [],
    });
    setNewGalleryImage('');
    setShowForm(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Move to Archive (Soft Delete)
  const handleArchive = async (eventId, eventTitle) => {
    if (!window.confirm(`Archive "${eventTitle}"? This event will be hidden from public view and moved to Archives.`)) {
      return;
    }

    try {
      setLoading(true);
      await axios.put(`/api/events/${eventId}/archive`);
      setSuccess(`"${eventTitle}" moved to archives.`);
      onEventsUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Error archiving event');
    } finally {
      setLoading(false);
    }
  };

  // Restore from Archive
  const handleRestore = async (eventId, eventTitle) => {
    try {
      setLoading(true);
      await axios.put(`/api/events/${eventId}/restore`);
      setSuccess(`"${eventTitle}" restored to active events list.`);
      onEventsUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Error restoring event');
    } finally {
      setLoading(false);
    }
  };

  // Permanent Hard Delete (Only for archived items)
  const handlePermanentDelete = async (eventId, eventTitle) => {
    const confirmation = window.confirm(
      `⚠️ PERMANENT DELETE WARNING: Are you completely sure you want to permanently erase "${eventTitle}" from the database? This action CANNOT be undone!`
    );
    if (!confirmation) return;

    try {
      setLoading(true);
      await axios.delete(`/api/events/${eventId}`);
      setSuccess(`"${eventTitle}" permanently deleted from database.`);
      onEventsUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting event');
    } finally {
      setLoading(false);
    }
  };

  const activeEvents = events.filter((e) => !e.isArchived);
  const archivedEvents = events.filter((e) => e.isArchived);
  const displayedEvents = viewArchived ? archivedEvents : activeEvents;

  return (
    <div className="event-mgmt-root">
      <style>{`
        .event-mgmt-root {
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

        .status-upcoming {
          background: rgba(209, 255, 0, 0.15);
          color: var(--neon);
          border: 1px solid var(--neon);
        }

        .status-ongoing {
          background: rgba(0, 220, 255, 0.15);
          color: #00dcff;
          border: 1px solid #00dcff;
        }

        .status-completed {
          background: rgba(150, 150, 150, 0.15);
          color: #aaa;
          border: 1px solid #666;
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
            Active Events ({activeEvents.length})
          </button>
          <button
            onClick={() => setViewArchived(true)}
            className={`view-btn ${viewArchived ? 'active' : ''}`}
          >
            📦 Archived Events ({archivedEvents.length})
          </button>
        </div>

        {!viewArchived && canCreateEvents(currentUser) && (
          <button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className="btn-create"
          >
            {showForm ? 'Cancel Form' : '+ Schedule New Event'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-card">
          <h2 className="form-title">
            {editingEvent ? 'Edit Operational Event' : 'Schedule New Operational Event'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid-3">
              <div className="field-group">
                <label className="field-label">Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g. AUTONOMOUS MOBILITY HACKATHON"
                  className="field-input"
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label">Event Type</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleFormChange}
                  className="field-select"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label className="field-label">Operational Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="field-select"
                  required
                >
                  {EVENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid-3">
              <div className="field-group">
                <label className="field-label">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleFormChange}
                  className="field-input"
                  required
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

              <div className="field-group">
                <label className="field-label">Time Range</label>
                <input
                  type="text"
                  name="timeRange"
                  value={formData.timeRange}
                  onChange={handleFormChange}
                  placeholder="09:00 AM - 05:00 PM IST"
                  className="field-input"
                />
              </div>
            </div>

            <div className="form-grid-3">
              <div className="field-group">
                <label className="field-label">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleFormChange}
                  placeholder="e.g. 48 Hours, 3 Hours"
                  className="field-input"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Location / Platform *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  placeholder="e.g. Main Auditorium / Virtual"
                  className="field-input"
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label">Organizer Entity</label>
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleFormChange}
                  placeholder="NexSync Autonomous Mobility"
                  className="field-input"
                />
              </div>
            </div>

            <div className="form-grid-3">
              <div className="field-group">
                <label className="field-label">RSU / RSVP Link</label>
                <input
                  type="url"
                  name="rsvpLink"
                  value={formData.rsvpLink}
                  onChange={handleFormChange}
                  placeholder="https://unstop.com/..."
                  className="field-input"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Registration Deadline</label>
                <input
                  type="date"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleFormChange}
                  className="field-input"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Event Cover Image (Display Banner)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    name="coverImage"
                    value={formData.coverImage || formData.image}
                    onChange={handleFormChange}
                    placeholder="https://..., Google Drive share link, or upload local file"
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
                  {(formData.coverImage || formData.image) && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          coverImage: '',
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
                {(formData.coverImage || formData.image) && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={formData.coverImage || formData.image}
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
                <VideoPlayer url={formData.videoUrl} title="Event Video Preview" poster={formData.coverImage} />
              </div>
            )}

            <div className="field-group" style={{ marginBottom: '18px' }}>
              <label className="field-label">Event Header (Optional)</label>
              <input
                type="text"
                name="eventHeader"
                value={formData.eventHeader}
                onChange={handleFormChange}
                placeholder="Short headline for cards (max 2 lines displayed)..."
                className="field-input"
              />
            </div>

            <div className="field-group" style={{ marginBottom: '18px' }}>
              <label className="field-label">Event Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows={3}
                placeholder="Comprehensive technical briefing and workshop agenda..."
                className="field-textarea"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: editingEvent ? '16px' : '0' }}>
              <input
                type="checkbox"
                id="isFeaturedEvent"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleFormChange}
                style={{ width: '16px', height: '16px', accentColor: 'var(--neon)' }}
              />
              <label htmlFor="isFeaturedEvent" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                Featured Event (Highlighted in telemetry displays)
              </label>
            </div>

            {/* GALLERY IMAGES SECTION */}
            <div className="gallery-manager-box">
              <h4 className="gallery-manager-title">
                📸 Event Gallery Images ({formData.galleryImages?.length || 0})
              </h4>
              <p className="gallery-manager-subtitle">
                Manage photo URLs captured during or after this event. Public event detail page shows these in an interactive gallery grid.
              </p>

              <div className="gallery-add-row" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={newGalleryImage}
                  onChange={(e) => setNewGalleryImage(e.target.value)}
                  placeholder="Enter image URL, Google Drive share link, or upload local file"
                  className="field-input"
                  style={{ flex: 1, minWidth: '220px' }}
                />
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="btn-create"
                  style={{ padding: '8px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                >
                  + Add URL
                </button>
                <label
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid var(--border)',
                    padding: '8px 14px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap',
                    color: 'var(--neon)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  📁 Upload Photo
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleGalleryFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
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
                {loading ? 'Processing...' : editingEvent ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-responsive">
        <table className="mgmt-table">
          <thead>
            <tr>
              <th>Event Title</th>
              <th>Status</th>
              <th>Type</th>
              <th>Date & Location</th>
              <th>RSVP Link</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedEvents.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  {viewArchived ? 'No archived events found.' : 'No active events found. Create one above!'}
                </td>
              </tr>
            ) : (
              displayedEvents.map((evt) => (
                <tr key={evt._id}>
                  <td>
                    <div style={{ fontWeight: '600', color: '#fff' }}>{evt.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Org: {evt.organizer || 'NexSync Team'}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge-status ${
                        evt.status === 'Upcoming'
                          ? 'status-upcoming'
                          : evt.status === 'Ongoing'
                          ? 'status-ongoing'
                          : 'status-completed'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--neon)' }}>{evt.eventType || 'EVENT'}</span>
                  </td>
                  <td>
                    <div>{new Date(evt.startDate).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {evt.location}
                    </div>
                  </td>
                  <td>
                    {evt.rsvpLink || evt.redirectUrl ? (
                      <a
                        href={evt.rsvpLink || evt.redirectUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--neon)', textDecoration: 'underline' }}
                      >
                        RSVP Link ↗
                      </a>
                    ) : (
                      <span style={{ color: '#666' }}>None</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {!evt.isArchived ? (
                      <>
                        {canUpdateEvents(currentUser) && (
                          <button
                            onClick={() => handleEdit(evt)}
                            className="btn-action-edit"
                          >
                            ✏️ Edit
                          </button>
                        )}
                        {canDeleteEvents(currentUser) && (
                          <button
                            onClick={() => handleArchive(evt._id, evt.title)}
                            className="btn-action-archive"
                          >
                            📦 Archive
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {canUpdateEvents(currentUser) && (
                          <button
                            onClick={() => handleRestore(evt._id, evt.title)}
                            className="btn-action-restore"
                          >
                            ↺ Restore
                          </button>
                        )}
                        {canDeleteEvents(currentUser) && (
                          <button
                            onClick={() => handlePermanentDelete(evt._id, evt.title)}
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

export default EventManagement;
