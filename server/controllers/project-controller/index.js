const Project = require("../../models/Project");

const createProject = async (req, res) => {
  try {
    const { projectId, projectName, description, techStack, status } = req.body;

    if (!projectId || !projectName || !description || !techStack) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const existingProject = await Project.findOne({ projectId });
    if (existingProject) {
      return res.status(409).json({
        success: false,
        message: "Project with this ID already exists",
      });
    }

    const project = new Project({
      projectId,
      projectName,
      description,
      techStack: Array.isArray(techStack) ? techStack : [techStack],
      status: status || "IN PROGRESS",
      createdBy: req.user._id,
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const listProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("List projects error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { projectName, description, techStack, status } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        projectName,
        description,
        techStack: Array.isArray(techStack) ? techStack : [techStack],
        status,
      },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
};
