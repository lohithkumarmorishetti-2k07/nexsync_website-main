const mongoose = require("mongoose");

const TeamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      select: false, // Never expose in queries by default
    },
    role: {
      type: String,
      enum: [
        "Club Coordinator",
        "Executive Member",
        "Wing Member",
      ],
      required: true,
      default: "Wing Member",
      index: true,
    },
    domain: {
      type: String,
      enum: [
        "ELECTRONICS",
        "INTEGRATED SYSTEMS",
        "AI AND ML",
        "UI/UX WEBDEV AND DS",
        "PR AND DESIGN",
      ],
      required: true,
    },
    customPermissions: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    linkedinUrl: {
      type: String,
      default: "",
      trim: true,
    },
    githubUrl: {
      type: String,
      default: "",
      trim: true,
    },
    portfolioUrl: {
      type: String,
      default: "",
      trim: true,
    },
    joinDate: {
      type: Date,
    },
    graduationYear: {
      type: String,
      default: "",
      trim: true,
    },
    isAlumni: {
      type: Boolean,
      default: false,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamMember",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual memberType for seamless backwards compatibility with frontend rendering
TeamMemberSchema.virtual("memberType").get(function () {
  return this.role;
});

// Compound index for roster queries
TeamMemberSchema.index({ isArchived: 1, isAlumni: 1, role: 1, domain: 1 });

module.exports = mongoose.model("TeamMember", TeamMemberSchema);
