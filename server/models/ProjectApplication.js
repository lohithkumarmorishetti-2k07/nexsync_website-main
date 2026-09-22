const mongoose = require('mongoose');

const ProjectApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: String, required: true },
  projectName: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  rollNumber: { type: String, required: true },
  instituteEmail: { type: String, required: true },
  applicationStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  appliedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ProjectApplication', ProjectApplicationSchema);
