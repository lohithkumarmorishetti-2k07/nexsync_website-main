const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ["HACKATHON", "EVENT"],
    required: true
  },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  timeRange: { type: String, required: true },
  duration: { type: String, required: true },
  location: { type: String, required: true },
  registeredCount: { type: Number, default: 0 },
  redirectUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model("Event", EventSchema);
