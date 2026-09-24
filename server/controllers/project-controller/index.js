const mongoose = require("mongoose");
const Project = require("../../models/Project");

/**
 * Validate cover image and video media URLs/data payloads
 */
const validateMedia = (coverImage, videoUrl) => {
  if (coverImage && typeof coverImage === "string" && coverImage.trim()) {
    const trimmed = coverImage.trim();
    const isUrl = /^https?:\/\/.+/i.test(trimmed);
    const isAsset = /^\/assets\/.+/i.test(trimmed);
    const isDataUri = /^data:image\/(jpeg|png|webp|svg\+xml|gif);base64,[A-Za-z0-9+/=]+/i.test(trimmed);
    if (!isUrl && !isAsset && !isDataUri) {
      throw new Error(
        "Cover image must be a valid HTTP/HTTPS URL, asset path (/assets/...), or image base64 data URI (JPEG, PNG, WebP, SVG)."
      );
    }
  }

  if (videoUrl && typeof videoUrl === "string" && videoUrl.trim()) {
    const trimmed = videoUrl.trim();
    const isHttp = /^https?:\/\/.+/i.test(trimmed);
    const isYoutube = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))/i.test(trimmed);
    const isVimeo = /vimeo\.com\//i.test(trimmed);
    const isVideoFile = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed);
    const isVideoDataUri = /^data:video\/(mp4|webm|ogg);base64,[A-Za-z0-9+/=]+/i.test(trimmed);

    if (!isHttp && !isVideoDataUri) {
      throw new Error("Video URL must be a valid HTTP/HTTPS URL or video data URI.");
    }
    if (!isYoutube && !isVimeo && !isVideoFile && !isVideoDataUri) {
      throw new Error(
        "Video URL must be a valid YouTube, Vimeo, or direct video stream (.mp4, .webm, .ogg)."
      );
    }
  }
};

// Public list: non-archived projects
const listProjects = async (req, res) => {
  try {
    const { status, featured } = req.query;
    let query = { isArchived: { $ne: true } };

    if (status) query.status = status;
    if (featured === "true") query.isFeatured = true;

    const projects = await Project.find(query)
      .populate("createdBy", "name role domain image")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("List projects error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving project repository",
    });
  }
};

// Admin list: can query active or archived
const listAdminProjects = async (req, res) => {
  try {
    const { archived } = req.query;
    let query = {};

    if (archived === "true") {
      query.isArchived = true;
    } else if (archived === "false") {
      query.isArchived = false;
    }

    const projects = await Project.find(query)
      .populate("createdBy", "name role domain image")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Admin list projects error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getProject = async (req, res) => {
  try {
    let project = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      project = await Project.findById(req.params.id).populate("createdBy", "name role domain image");
    }
    if (!project) {
      project = await Project.findOne({ projectId: req.params.id }).populate("createdBy", "name role domain image");
    }
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

const createProject = async (req, res) => {
  try {
    const {
      projectId,
      projectName,
      description,
      coverImage,
      thumbnail,
      videoUrl,
      galleryImages,
      techStack,
      teamMembers,
      repoLink,
      demoLink,
      docLink,
      startDate,
      endDate,
      status,
      isFeatured,
    } = req.body;

    if (!projectId || !projectName || !description) {
      return res.status(400).json({
        success: false,
        message: "Project ID, Project Name, and Description are required",
      });
    }

    const existingProject = await Project.findOne({ projectId: projectId.trim() });
    if (existingProject) {
      return res.status(409).json({
        success: false,
        message: `Project with ID '${projectId}' already exists`,
      });
    }

    const primaryCover = (coverImage || thumbnail || "").trim();
    const primaryVideo = (videoUrl || "").trim();

    // Validate media
    validateMedia(primaryCover, primaryVideo);

    let processedTechStack = [];
    if (Array.isArray(techStack)) {
      processedTechStack = techStack.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof techStack === "string") {
      processedTechStack = techStack
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    let processedTeam = [];
    if (Array.isArray(teamMembers)) {
      processedTeam = teamMembers.map((m) => String(m).trim()).filter(Boolean);
    } else if (typeof teamMembers === "string") {
      processedTeam = teamMembers
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
    }

    let processedGallery = [];
    if (Array.isArray(galleryImages)) {
      processedGallery = galleryImages.map((g) => String(g).trim()).filter(Boolean);
    }

    const validStatuses = ["Future", "Active", "Completed", "Alumni"];
    const projectStatus = validStatuses.includes(status) ? status : "Active";

    const project = new Project({
      projectId: projectId.trim(),
      projectName: projectName.trim(),
      description: description.trim(),
      coverImage: primaryCover,
      thumbnail: primaryCover,
      videoUrl: primaryVideo,
      galleryImages: processedGallery,
      techStack: processedTechStack,
      teamMembers: processedTeam,
      repoLink: repoLink ? repoLink.trim() : "",
      demoLink: demoLink ? demoLink.trim() : "",
      docLink: docLink ? docLink.trim() : "",
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status: projectStatus,
      isFeatured: Boolean(isFeatured),
      isArchived: false,
      createdBy: req.user?._id,
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: "Project build registered successfully",
      data: project,
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Error creating project",
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const {
      projectId,
      projectName,
      description,
      coverImage,
      thumbnail,
      videoUrl,
      galleryImages,
      techStack,
      teamMembers,
      repoLink,
      demoLink,
      docLink,
      startDate,
      endDate,
      status,
      isFeatured,
    } = req.body;

    const primaryCover = coverImage !== undefined ? coverImage.trim() : thumbnail !== undefined ? thumbnail.trim() : undefined;
    const primaryVideo = videoUrl !== undefined ? videoUrl.trim() : undefined;

    // Validate media if provided
    validateMedia(primaryCover, primaryVideo);

    const updateData = {};
    if (projectId !== undefined) updateData.projectId = projectId.trim();
    if (projectName !== undefined) updateData.projectName = projectName.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (primaryCover !== undefined) {
      updateData.coverImage = primaryCover;
      updateData.thumbnail = primaryCover;
    }
    if (primaryVideo !== undefined) updateData.videoUrl = primaryVideo;

    if (techStack !== undefined) {
      if (Array.isArray(techStack)) {
        updateData.techStack = techStack.map((t) => String(t).trim()).filter(Boolean);
      } else if (typeof techStack === "string") {
        updateData.techStack = techStack.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }

    if (teamMembers !== undefined) {
      if (Array.isArray(teamMembers)) {
        updateData.teamMembers = teamMembers.map((m) => String(m).trim()).filter(Boolean);
      } else if (typeof teamMembers === "string") {
        updateData.teamMembers = teamMembers.split(",").map((m) => m.trim()).filter(Boolean);
      }
    }

    if (galleryImages !== undefined && Array.isArray(galleryImages)) {
      updateData.galleryImages = galleryImages.map((g) => String(g).trim()).filter(Boolean);
    }

    if (repoLink !== undefined) updateData.repoLink = repoLink.trim();
    if (demoLink !== undefined) updateData.demoLink = demoLink.trim();
    if (docLink !== undefined) updateData.docLink = docLink.trim();
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (status !== undefined) updateData.status = status;
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);

    const project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

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
    res.status(400).json({
      success: false,
      message: error.message || "Error updating project",
    });
  }
};

const archiveProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
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
      message: "Project moved to archives",
      data: project,
    });
  } catch (error) {
    console.error("Archive project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error archiving project",
    });
  }
};

const restoreProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { isArchived: false },
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
      message: "Project restored successfully",
      data: project,
    });
  } catch (error) {
    console.error("Restore project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error restoring project",
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
      message: "Project permanently erased from database",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting project",
    });
  }
};

module.exports = {
  listProjects,
  listAdminProjects,
  getProject,
  createProject,
  updateProject,
  archiveProject,
  restoreProject,
  deleteProject,
};
