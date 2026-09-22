const TeamMember = require("../../models/TeamMember");

const createTeamMember = async (req, res) => {
  try {
    const { name, role, section, yearTag, linkedinUrl, image } = req.body;

    if (!name || !role || !section || !linkedinUrl) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!linkedinUrl.startsWith('http://') && !linkedinUrl.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        message: "LinkedIn URL must be a valid http or https URL",
      });
    }

    const teamMember = new TeamMember({
      name,
      role,
      section,
      yearTag,
      linkedinUrl,
      image,
      createdBy: req.user._id,
    });

    await teamMember.save();

    res.status(201).json({
      success: true,
      message: "Team member created successfully",
      data: teamMember,
    });
  } catch (error) {
    console.error("Create team member error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const listTeamMembers = async (req, res) => {
  try {
    const teamMembers = await TeamMember.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: teamMembers,
    });
  } catch (error) {
    console.error("List team members error:", error);
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

const updateTeamMember = async (req, res) => {
  try {
    const { name, role, section, yearTag, linkedinUrl, image } = req.body;

    if (linkedinUrl && !linkedinUrl.startsWith('http://') && !linkedinUrl.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        message: "LinkedIn URL must be a valid http or https URL",
      });
    }

    const teamMember = await TeamMember.findByIdAndUpdate(
      req.params.id,
      {
        name,
        role,
        section,
        yearTag,
        linkedinUrl,
        image,
      },
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
      message: "Team member updated successfully",
      data: teamMember,
    });
  } catch (error) {
    console.error("Update team member error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

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
      message: "Team member deleted successfully",
    });
  } catch (error) {
    console.error("Delete team member error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createTeamMember,
  listTeamMembers,
  getTeamMember,
  updateTeamMember,
  deleteTeamMember,
};
