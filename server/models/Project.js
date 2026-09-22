const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },
  projectName: { type: String, required: true },
  description: { type: String, required: true },
  techStack: { type: [String], required: true },
  status: { 
    type: String, 
    enum: ["PLANNING", "IN PROGRESS", "COMPLETED"],
    default: "IN PROGRESS" 
  },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model("Project", ProjectSchema);
