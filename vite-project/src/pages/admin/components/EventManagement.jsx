import React, { useState, useEffect } from 'react';
import axios from '@/api/axiosInstance';

const EventManagement = ({ events, onEventsUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'EVENT',
    description: '',
    startDate: '',
    endDate: '',
    timeRange: '',
    duration: '',
    location: '',
    redirectUrl: '',
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
      title: '',
      category: 'EVENT',
      description: '',
      startDate: '',
      endDate: '',
      timeRange: '',
      duration: '',
      location: '',
      redirectUrl: '',
    });
    setEditingEvent(null);
    setShowForm(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.title || !formData.category || !formData.description || !formData.startDate || !formData.endDate || !formData.timeRange || !formData.duration || !formData.location || !formData.redirectUrl) {
      setError('All fields are required');
      return;
    }

    if (!formData.redirectUrl.startsWith('http://') && !formData.redirectUrl.startsWith('https://')) {
      setError('Redirect URL must start with http:// or https://');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        timeRange: formData.timeRange,
        duration: formData.duration,
        location: formData.location,
        redirectUrl: formData.redirectUrl,
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
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving event');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      category: event.category,
      description: event.description,
      startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
      timeRange: event.timeRange,
      duration: event.duration,
      location: event.location,
      redirectUrl: event.redirectUrl,
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await axios.delete(`/api/events/${eventId}`);
      setSuccess('Event deleted successfully!');
      setTimeout(() => {
        onEventsUpdate();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting event');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <style>{`
        .event-section {
          color: #fff;
          fontFamily: monospace;
        }

        .btn-new-event {
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

        .btn-new-event:hover {
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

        .form-input, .form-textarea, .form-select {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(209, 255, 0, 0.2);
          color: #fff;
          padding: 10px;
          borderRadius: 4px;
          fontFamily: monospace;
          fontSize: 0.95rem;
          transition: all 0.3s ease;
        }

        .form-input:focus, .form-textarea:focus, .form-select:focus {
          outline: none;
          border-color: rgba(209, 255, 0, 0.5);
          background: rgba(209, 255, 0, 0.05);
        }

        .form-textarea {
          resize: vertical;
          minHeight: 100px;
          fontFamily: monospace;
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

        .events-table {
          width: 100%;
          borderCollapse: collapse;
          marginTop: 20px;
        }

        .events-table thead {
          background: rgba(255, 255, 255, 0.02);
          borderBottom: 1px solid rgba(209, 255, 0, 0.2);
        }

        .events-table th {
          padding: 15px;
          textAlign: left;
          color: #888;
          fontSize: 0.75rem;
          textTransform: uppercase;
          fontWeight: 600;
          borderRight: 1px solid rgba(209, 255, 0, 0.1);
        }

        .events-table td {
          padding: 15px;
          borderBottom: 1px solid rgba(209, 255, 0, 0.1);
          borderRight: 1px solid rgba(209, 255, 0, 0.1);
        }

        .events-table tr:hover {
          background: rgba(209, 255, 0, 0.03);
        }

        .category-badge {
          display: inline-block;
          padding: 6px 12px;
          borderRadius: 4px;
          fontSize: 0.7rem;
          fontWeight: 600;
          textTransform: uppercase;
        }

        .category-hackathon {
          background: rgba(100, 150, 255, 0.1);
          color: #6496ff;
          border: 1px solid rgba(100, 150, 255, 0.3);
        }

        .category-event {
          background: rgba(209, 255, 0, 0.1);
          color: #d1ff00;
          border: 1px solid rgba(209, 255, 0, 0.3);
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
      `}</style>

      <div className="event-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Event Management</h2>
          {!showForm && (
            <button
              className="btn-new-event"
              onClick={() => setShowForm(true)}
            >
              Create New Event
            </button>
          )}
        </div>

        {error && <div className="alert alert-error">Error: {error}</div>}
        {success && <div className="alert alert-success">Success: {success}</div>}

        {showForm && (
          <div className="form-container">
            <h3 style={{ marginTop: 0 }}>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Event Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-input"
                    placeholder="e.g., Code Sprint 2024"
                    value={formData.title}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleFormChange}
                  >
                    <option value="EVENT">EVENT</option>
                    <option value="HACKATHON">HACKATHON</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-input"
                    value={formData.startDate}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-input"
                    value={formData.endDate}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Time Range</label>
                  <input
                    type="text"
                    name="timeRange"
                    className="form-input"
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                    value={formData.timeRange}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    className="form-input"
                    placeholder="e.g., 8 hours"
                    value={formData.duration}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    className="form-input"
                    placeholder="e.g., Main Auditorium"
                    value={formData.location}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Redirect URL</label>
                  <input
                    type="url"
                    name="redirectUrl"
                    className="form-input"
                    placeholder="https://example.com/event"
                    value={formData.redirectUrl}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group full">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-textarea"
                    placeholder="Event description..."
                    value={formData.description}
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
                  {loading ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
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

        {events.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '2rem', marginBottom: '15px' }}>No events yet</div>
            <p>Create your first event to get started</p>
          </div>
        ) : (
          <table className="events-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date Range</th>
                <th>Location</th>
                <th>Redirect URL</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id}>
                  <td style={{ fontWeight: '600' }}>{event.title}</td>
                  <td>
                    <span
                      className={`category-badge category-${event.category.toLowerCase()}`}
                    >
                      {event.category}
                    </span>
                  </td>
                  <td>
                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                  </td>
                  <td>{event.location}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <a href={event.redirectUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#d1ff00', textDecoration: 'none' }}>
                      {event.redirectUrl}
                    </a>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(event)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(event._id)}
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

export default EventManagement;
