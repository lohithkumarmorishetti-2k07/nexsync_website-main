const TeamMember = require("../../models/TeamMember");
const bcrypt = require("bcryptjs");
const { filterAssignablePermissions, ROLES, PERMISSIONS } = require("../../config/rbac");

const ALLOWED_ROLES = [
  "Club Coordinator",
  "Executive Member",
  "Wing Member",
  "Alumni",
];

const ALLOWED_DOMAINS = [
  "ELECTRONICS",
  "INTEGRATED SYSTEMS",
  "AI AND ML",
  "UI/UX WEBDEV AND DS",
  "PR AND DESIGN",
];

const formatImageUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("data:image/") || trimmed.startsWith("/")) {
    return trimmed;
  }
  const fileIdMatch = trimmed.match(/(?:\/file\/d\/|\/d\/)([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
  }
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1] && (trimmed.includes("drive.google.com") || trimmed.includes("docs.google.com") || trimmed.includes("googleusercontent.com"))) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }
  return trimmed;
};

// Public list: non-archived members
const listTeamMembers = async (req, res) => {
  try {
    const { role, memberType, domain, isAlumni, leadership } = req.query;
    let query = { isArchived: { $ne: true } };

    if (leadership === "true") {
      // Home Page Leadership only: Club Coordinator and Executive Members
      query.role = { $in: ["Club Coordinator", "Executive Member"] };
      query.isAlumni = { $ne: true };
    } else if (role) {
      if (role.includes(",")) {
        query.role = { $in: role.split(",").map((r) => r.trim()) };
      } else {
        query.role = role;
      }
    } else if (memberType) {
      query.role = memberType === "Alumni Member" ? "Alumni" : memberType;
    }

    if (domain) query.domain = domain;
    if (isAlumni !== undefined && leadership !== "true") {
      if (isAlumni === "true") {
        query.role = "Alumni";
      } else {
        query.role = { $ne: "Alumni" };
      }
    }

    const teamMembers = await TeamMember.find(query).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: teamMembers,
    });
  } catch (error) {
    console.error("List team members error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving team roster",
    });
  }
};

// Admin list: can query active or archived
const listAdminTeamMembers = async (req, res) => {
  try {
    const { archived } = req.query;
    let query = {};

    if (archived === "true") {
      query.isArchived = true;
    } else if (archived === "false") {
      query.isArchived = false;
    }

    const teamMembers = await TeamMember.find(query).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: teamMembers,
    });
  } catch (error) {
    console.error("Admin list team error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getTeamMember = async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }
    res.json({
      success: true,
      data: teamMember,
    });
  } catch (error) {
    console.error("Get team member error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Coordinator-controlled Member Creation Flow:
 * Club Coordinator -> Create Team Member -> Assign Role -> Assign Domain -> Assign Email -> Assign Initial Password
 * Password is encrypted and stored. Member receives credentials and can log in.
 */
const createTeamMember = async (req, res) => {
  try {
    const {
      name,
      role,
      memberType,
      domain,
      isAlumni,
      email,
      password,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      bio,
      joinDate,
      graduationYear,
      image,
      customPermissions,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full Name is required",
      });
    }

    if (!domain || !domain.trim()) {
      return res.status(400).json({
        success: false,
        message: "Domain is required",
      });
    }

    if (!ALLOWED_DOMAINS.includes(domain.trim())) {
      return res.status(400).json({
        success: false,
        message: `Domain must be one of: ${ALLOWED_DOMAINS.join(", ")}`,
      });
    }

    // Determine canonical role
    let finalRole = "";
    if (Boolean(isAlumni) || role === "Alumni" || memberType === "Alumni Member") {
      finalRole = "Alumni";
    } else {
      const candidateRole = (role || memberType || "").trim();
      if (!candidateRole) {
        return res.status(400).json({
          success: false,
          message: "Role is required for team members",
        });
      }
      if (!ALLOWED_ROLES.includes(candidateRole)) {
        return res.status(400).json({
          success: false,
          message: `Role must be one of: ${ALLOWED_ROLES.join(", ")}`,
        });
      }
      finalRole = candidateRole;
    }

    const isAlumniMember = finalRole === "Alumni";

    // Handle email & credentials
    let memberEmail = email ? email.toLowerCase().trim() : "";
    if (!memberEmail) {
      if (isAlumniMember) {
        const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
        memberEmail = `${sanitized}@alumni.nexsync.org`;
      } else {
        return res.status(400).json({
          success: false,
          message: "Email address is required for active command members to enable authentication.",
        });
      }
    }

    // Check email uniqueness
    const existingMember = await TeamMember.findOne({
      email: memberEmail,
      isArchived: { $ne: true },
    });
    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: `A team member with email '${memberEmail}' already exists.`,
      });
    }

    let passwordHash = null;
    let validPermissions = [];

    if (!isAlumniMember) {
      // Hash password (use provided password or coordinator-provisioned default)
      const rawPassword = password && password.trim() ? password.trim() : "NexSync@2026!";
      passwordHash = await bcrypt.hash(rawPassword, 10);

      if (finalRole === "Club Coordinator") {
        validPermissions = Object.values(PERMISSIONS);
      } else {
        validPermissions = filterAssignablePermissions(customPermissions);
      }
    }

    const teamMember = new TeamMember({
      name: name.trim(),
      email: memberEmail,
      passwordHash,
      role: finalRole,
      domain: domain.trim(),
      customPermissions: validPermissions,
      image: image ? formatImageUrl(image) : "",
      bio: bio ? bio.trim() : "",
      linkedinUrl: linkedinUrl ? linkedinUrl.trim() : "",
      githubUrl: githubUrl ? githubUrl.trim() : "",
      portfolioUrl: portfolioUrl ? portfolioUrl.trim() : "",
      joinDate: joinDate ? new Date(joinDate) : undefined,
      graduationYear: graduationYear ? graduationYear.trim() : "",
      isAlumni: isAlumniMember,
      isArchived: false,
      createdBy: req.user?._id,
    });

    await teamMember.save();

    // Remove passwordHash from returned payload
    const responseData = teamMember.toObject();
    delete responseData.passwordHash;

    res.status(201).json({
      success: true,
      message: "Team member provisioned and registered successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Create team member error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error creating team member",
    });
  }
};

const updateTeamMember = async (req, res) => {
  try {
    const {
      name,
      role,
      memberType,
      domain,
      isAlumni,
      email,
      password,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      bio,
      joinDate,
      graduationYear,
      image,
    } = req.body;

    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    // Role resolution
    let targetRole = member.role;
    if (Boolean(isAlumni) || role === "Alumni" || memberType === "Alumni Member") {
      targetRole = "Alumni";
    } else if (role || memberType) {
      const candidate = (role || memberType).trim();
      if (ALLOWED_ROLES.includes(candidate)) {
        targetRole = candidate;
      }
    }

    if (name !== undefined) member.name = name.trim();
    member.role = targetRole;
    member.isAlumni = targetRole === "Alumni";

    if (domain !== undefined) {
      if (!ALLOWED_DOMAINS.includes(domain)) {
        return res.status(400).json({
          success: false,
          message: `Domain must be one of: ${ALLOWED_DOMAINS.join(", ")}`,
        });
      }
      member.domain = domain;
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== member.email) {
        const dup = await TeamMember.findOne({
          email: normalizedEmail,
          _id: { $ne: member._id },
          isArchived: { $ne: true },
        });
        if (dup) {
          return res.status(409).json({
            success: false,
            message: `Email '${normalizedEmail}' is already assigned to another team member.`,
          });
        }
        member.email = normalizedEmail;
      }
    }

    // If new password provided, encrypt and update
    if (password && password.trim() && targetRole !== "Alumni") {
      member.passwordHash = await bcrypt.hash(password.trim(), 10);
    } else if (targetRole === "Alumni") {
      member.passwordHash = null;
      member.customPermissions = [];
    }

    if (linkedinUrl !== undefined) member.linkedinUrl = linkedinUrl.trim();
    if (githubUrl !== undefined) member.githubUrl = githubUrl.trim();
    if (portfolioUrl !== undefined) member.portfolioUrl = portfolioUrl.trim();
    if (bio !== undefined) member.bio = bio.trim();
    if (joinDate !== undefined) member.joinDate = joinDate ? new Date(joinDate) : null;
    if (graduationYear !== undefined) member.graduationYear = graduationYear.trim();
    if (image !== undefined) member.image = formatImageUrl(image);

    await member.save();

    const responseData = member.toObject();
    delete responseData.passwordHash;

    res.json({
      success: true,
      message: "Team member updated successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Update team member error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error updating team member",
    });
  }
};

/**
 * Coordinator-controlled permission management for Executive & Wing Members
 */
const updateMemberPermissions = async (req, res) => {
  try {
    const { customPermissions } = req.body;
    const member = await TeamMember.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    if (member.role === "Club Coordinator") {
      return res.status(400).json({
        success: false,
        message: "Club Coordinator always retains full system permissions and cannot be restricted.",
      });
    }

    if (member.role === "Alumni") {
      return res.status(400).json({
        success: false,
        message: "Alumni records do not possess active management permissions.",
      });
    }

    // Filter to allowed assignable permissions (strictly prevents granting coordinator-exclusive permissions)
    const sanitizedPermissions = filterAssignablePermissions(customPermissions);

    member.customPermissions = sanitizedPermissions;
    await member.save();

    res.json({
      success: true,
      message: `Permissions updated successfully for ${member.name}`,
      data: {
        memberId: member._id,
        role: member.role,
        customPermissions: sanitizedPermissions,
      },
    });
  } catch (error) {
    console.error("Update member permissions error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error updating member permissions",
    });
  }
};

// Soft-delete: Move to archives
const archiveTeamMember = async (req, res) => {
  try {
    const teamMember = await TeamMember.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    res.json({
      success: true,
      message: "Team member archived successfully",
      data: teamMember,
    });
  } catch (error) {
    console.error("Archive team member error:", error);
    res.status(500).json({
      success: false,
      message: "Server error archiving team member",
    });
  }
};

// Restore from archives
const restoreTeamMember = async (req, res) => {
  try {
    const teamMember = await TeamMember.findByIdAndUpdate(
      req.params.id,
      { isArchived: false },
      { new: true }
    );

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    res.json({
      success: true,
      message: "Team member restored successfully",
      data: teamMember,
    });
  } catch (error) {
    console.error("Restore team member error:", error);
    res.status(500).json({
      success: false,
      message: "Server error restoring team member",
    });
  }
};

// Hard delete: permanently remove from DB (only from archives)
const deleteTeamMember = async (req, res) => {
  try {
    const teamMember = await TeamMember.findByIdAndDelete(req.params.id);
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    res.json({
      success: true,
      message: "Team member permanently deleted from database",
    });
  } catch (error) {
    console.error("Delete team member error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting team member",
    });
  }
};

module.exports = {
  listTeamMembers,
  listAdminTeamMembers,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  updateMemberPermissions,
  archiveTeamMember,
  restoreTeamMember,
  deleteTeamMember,
};
