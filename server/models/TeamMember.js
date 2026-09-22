const mongoose = require("mongoose");

const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  section: {
    type: String,
    enum: ["LEADS", "CORE_COMMITTEE", "DOMAIN_LEADS"],
    required: true
  },
  yearTag: { type: String, required: false },
  linkedinUrl: { type: String, required: true },
  image: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model("TeamMember", TeamMemberSchema);
