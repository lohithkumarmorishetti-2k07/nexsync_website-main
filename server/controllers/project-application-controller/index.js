const ProjectApplication = require('../../models/ProjectApplication');

const applyForProject = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const { projectId, projectName, name, phone, rollNumber, instituteEmail } = req.body;
    if (!projectId || !projectName || !name || !phone || !rollNumber || !instituteEmail) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existing = await ProjectApplication.findOne({ userId: user._id, projectId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already applied for this project' });
    }

    // Resume upload removed: accept applications without resume.
    const application = new ProjectApplication({
      userId: user._id,
      projectId,
      projectName,
      name,
      phone,
      rollNumber,
      instituteEmail,
    });

    await application.save();

    res.status(201).json({ success: true, message: 'Application submitted', data: application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const listApplications = async (req, res) => {
  try {
    const apps = await ProjectApplication.find().populate('userId', 'userName userEmail');
    const counts = {
      total: apps.length,
      pending: apps.filter(a => a.applicationStatus === 'Pending').length,
      approved: apps.filter(a => a.applicationStatus === 'Approved').length,
      rejected: apps.filter(a => a.applicationStatus === 'Rejected').length,
    };

    res.json({ success: true, data: { apps, counts } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getApplication = async (req, res) => {
  try {
    const app = await ProjectApplication.findById(req.params.id).populate('userId', 'userName userEmail');
    if (!app) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: app });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Approved' or 'Rejected'
    if (!['Approved', 'Rejected'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    const app = await ProjectApplication.findById(id);
    if (!app) return res.status(404).json({ success: false, message: 'Not found' });

    app.applicationStatus = status;
    await app.save();

    res.json({ success: true, message: 'Status updated', data: app });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const downloadResume = async (req, res) => {
  try {
    // Resume feature fully removed; endpoint returns 410 Gone.
    res.status(410).json({ success: false, message: 'Resume download feature disabled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const userId = req.user._id;
    const apps = await ProjectApplication.find({ userId }).sort({ appliedAt: -1 });
    
    res.json({
      success: true,
      data: apps,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  applyForProject,
  listApplications,
  getApplication,
  updateStatus,
  downloadResume,
  getMyApplications,
};
