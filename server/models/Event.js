const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  eventHeader: {
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
  image: {
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
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  timeRange: {
    type: String,
    default: "",
    trim: true,
  },
  duration: {
    type: String,
    default: "",
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  eventType: {
    type: String,
    default: "EVENT",
    trim: true,
  },
  status: {
    type: String,
    enum: ["Upcoming", "Ongoing", "Completed"],
    default: "Upcoming",
    index: true,
  },
  rsvpLink: {
    type: String,
    default: "",
    trim: true,
  },
  redirectUrl: {
    type: String,
    default: "",
    trim: true,
  },
  registrationDeadline: {
    type: Date,
  },
  organizer: {
    type: String,
    default: "NexSync Autonomous Mobility",
    trim: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  registeredCount: {
    type: Number,
    default: 0,
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

EventSchema.index({ isArchived: 1, status: 1, startDate: -1 });

module.exports = mongoose.model("Event", EventSchema);
