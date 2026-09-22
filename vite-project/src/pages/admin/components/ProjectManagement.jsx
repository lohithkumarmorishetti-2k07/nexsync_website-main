import React, { useState, useEffect } from 'react';
import axios from '@/api/axiosInstance';

const ProjectManagement = ({ projects, onProjectsUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    description: '',
    techStack: '',
    status: 'IN PROGRESS',
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
      projectId: '',
      projectName: '',
      description: '',
      techStack: '',
      status: 'IN PROGRESS',
    });
    setEditingProject(null);
    setShowForm(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.projectId || !formData.projectName || !formData.description || !formData.techStack) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        projectId: formData.projectId,
        projectName: formData.projectName,
        description: formData.description,
        techStack: formData.techStack.split(',').map(t => t.trim()),
        status: formData.status,
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
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving project');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      projectId: project.projectId,
      projectName: project.projectName,
      description: project.description,
      techStack: project.techStack.join(', '),
      status: project.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await axios.delete(`/api/projects/${projectId}`);
      setSuccess('Project deleted successfully!');
      setTimeout(() => {
        onProjectsUpdate();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting project');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <style>{`
        .project-section {
          color: #fff;
          fontFamily: monospace;
        }

        .btn-new-project {
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

        .btn-new-project:hover {
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

        .projects-table {
          width: 100%;
          borderCollapse: collapse;
          marginTop: 20px;
        }

        .projects-table thead {
          background: rgba(255, 255, 255, 0.02);
          borderBottom: 1px solid rgba(209, 255, 0, 0.2);
        }

        .projects-table th {
          padding: 15px;
          textAlign: left;
          color: #888;
          fontSize: 0.75rem;
          textTransform: uppercase;
          fontWeight: 600;
          borderRight: 1px solid rgba(209, 255, 0, 0.1);
        }

        .projects-table td {
          padding: 15px;
          borderBottom: 1px solid rgba(209, 255, 0, 0.1);
          borderRight: 1px solid rgba(209, 255, 0, 0.1);
        }

        .projects-table tr:hover {
          background: rgba(209, 255, 0, 0.03);
        }

        .tech-stack {
          display: flex;
          gap: 8px;
          flexWrap: wrap;
        }

        .tech-tag {
          background: rgba(209, 255, 0, 0.1);
          border: 1px solid rgba(209, 255, 0, 0.2);
          color: #d1ff00;
          padding: 4px 8px;
          fontSize: 0.7rem;
          borderRadius: 2px;
          fontWeight: 600;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          borderRadius: 4px;
          fontSize: 0.7rem;
          fontWeight: 600;
          textTransform: uppercase;
        }

        .status-planning {
          background: rgba(100, 150, 255, 0.1);
          color: #6496ff;
          border: 1px solid rgba(100, 150, 255, 0.3);
        }

        .status-in-progress {
          background: rgba(209, 255, 0, 0.1);
          color: #d1ff00;
          border: 1px solid rgba(209, 255, 0, 0.3);
        }

        .status-completed {
          background: rgba(100, 255, 100, 0.1);
          color: #64ff64;
          border: 1px solid rgba(100, 255, 100, 0.3);
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

      <div className="project-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Project Management</h2>
          {!showForm && (
            <button
              className="btn-new-project"
              onClick={() => setShowForm(true)}
            >
              Create New Project
            </button>
          )}
        </div>

        {error && <div className="alert alert-error">Error: {error}</div>}
        {success && <div className="alert alert-success">Success: {success}</div>}

        {showForm && (
          <div className="form-container">
            <h3 style={{ marginTop: 0 }}>{editingProject ? 'Edit Project' : 'Create New Project'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Project ID</label>
                  <input
                    type="text"
                    name="projectId"
                    className="form-input"
                    placeholder="e.g., SYS-03"
                    value={formData.projectId}
                    onChange={handleFormChange}
                    disabled={!!editingProject}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input
                    type="text"
                    name="projectName"
                    className="form-input"
                    placeholder="e.g., GeoGuide"
                    value={formData.projectName}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    name="techStack"
                    className="form-input"
                    placeholder="e.g., PYTHON, FLASK, REACT"
                    value={formData.techStack}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleFormChange}
                  >
                    <option value="PLANNING">PLANNING</option>
                    <option value="IN PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-textarea"
                    placeholder="Project description..."
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
                  {loading ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
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

        {projects.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '2rem', marginBottom: '15px' }}>No projects yet</div>
            <p>Create your first project to get started</p>
          </div>
        ) : (
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Project Name</th>
                <th>Description</th>
                <th>Tech Stack</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id}>
                  <td style={{ fontWeight: '600', color: '#d1ff00' }}>{project.projectId}</td>
                  <td style={{ fontWeight: '600' }}>{project.projectName}</td>
                  <td style={{ maxWidth: '300px', wordBreak: 'break-word' }}>{project.description}</td>
                  <td>
                    <div className="tech-stack">
                      {project.techStack.map((tech) => (
                        <span key={tech} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${project.status.toLowerCase().replace(' ', '-')}`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(project)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(project._id)}
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

export default ProjectManagement;
