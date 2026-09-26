const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  projectName: {
    type: String,
    required: true,
    trim: true,
  },
  projectHeader: {
    type: String,
    default: "",
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  coverImage: {
    type: String,
    default: "",
    trim: true,
  },
  thumbnail: {
    type: String,
    default: "",
    trim: true,
  },
  videoUrl: {
    type: String,
    default: "",
    trim: true,
  },
  galleryImages: {
    type: [String],
    default: [],
  },
  techStack: {
    type: [String],
    default: [],
  },
  teamMembers: {
    type: [String],
    default: [],
  },
  repoLink: {
    type: String,
    default: "",
    trim: true,
  },
  demoLink: {
    type: String,
    default: "",
    trim: true,
  },
  docLink: {
    type: String,
    default: "",
    trim: true,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Future", "Active", "Completed", "Alumni"],
    default: "Active",
    index: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TeamMember",
  },
});

ProjectSchema.index({ isArchived: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Project", ProjectSchema);
