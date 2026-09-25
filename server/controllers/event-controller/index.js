const mongoose = require("mongoose");
const Event = require("../../models/Event");

const formatImageUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("data:image/") || trimmed.startsWith("/")) {
    return trimmed;
  }
  const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
  }
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1] && (trimmed.includes("drive.google.com") || trimmed.includes("docs.google.com"))) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }
  if (!/^https?:\/\//i.test(trimmed) && trimmed.includes(".")) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

/**
 * Validate cover image and video media URLs/data payloads
 */
const validateMedia = (coverImage, videoUrl) => {
  if (coverImage && typeof coverImage === "string" && coverImage.trim()) {
    const trimmed = coverImage.trim();
    const isUrl = /^https?:\/\/.+/i.test(trimmed);
    const isAsset = /^\/assets\/.+/i.test(trimmed);
    const isDataUri = /^data:image\/[a-zA-Z0-9+.-]+;base64,/i.test(trimmed);
    if (!isUrl && !isAsset && !isDataUri) {
      throw new Error(
        "Cover image must be a valid HTTP/HTTPS URL, asset path (/assets/...), or image base64 data URI."
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

// Public list: non-archived events
const listEvents = async (req, res) => {
  try {
    const { status, eventType } = req.query;
    let query = { isArchived: { $ne: true } };

    if (status) query.status = status;
    if (eventType) query.eventType = eventType;

    const events = await Event.find(query)
      .populate("createdBy", "name role domain image")
      .sort({ startDate: 1 });

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("List events error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving events",
    });
  }
};

// Admin list: can query active or archived
const listAdminEvents = async (req, res) => {
  try {
    const { archived } = req.query;
    let query = {};

    if (archived === "true") {
      query.isArchived = true;
    } else if (archived === "false") {
      query.isArchived = { $ne: true };
    }

    const events = await Event.find(query)
      .populate("createdBy", "name role domain image")
      .sort({ startDate: -1 });

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("Admin list events error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getEvent = async (req, res) => {
  try {
    let event = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      event = await Event.findById(req.params.id).populate("createdBy", "name role domain image");
    }
    if (!event) {
      event = await Event.findOne({ _id: req.params.id }).populate("createdBy", "name role domain image");
    }
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      coverImage,
      image,
      videoUrl,
      galleryImages,
      startDate,
      endDate,
      timeRange,
      duration,
      location,
      eventType,
      status,
      rsvpLink,
      redirectUrl,
      registrationDeadline,
      organizer,
      isFeatured,
      registeredCount,
    } = req.body;

    if (!title || !description || !startDate || !location) {
      return res.status(400).json({
        success: false,
        message: "Event title, description, start date, and location are required",
      });
    }

    const rawCover = (coverImage || image || "").trim();
    const primaryCover = formatImageUrl(rawCover);
    const primaryVideo = (videoUrl || "").trim();

    // Validate media
    validateMedia(primaryCover, primaryVideo);

    let calculatedStatus = status;
    if (!calculatedStatus) {
      const now = new Date();
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : start;
      if (now < start) calculatedStatus = "Upcoming";
      else if (now >= start && now <= end) calculatedStatus = "Ongoing";
      else calculatedStatus = "Completed";
    }

    const link = (rsvpLink || redirectUrl || "").trim();

    let processedGallery = [];
    if (Array.isArray(galleryImages)) {
      processedGallery = galleryImages
        .map((g) => formatImageUrl(String(g).trim()))
        .filter(Boolean);
    }

    const event = new Event({
      title: title.trim(),
      description: description.trim(),
      coverImage: primaryCover,
      image: primaryCover,
      videoUrl: primaryVideo,
      galleryImages: processedGallery,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      timeRange: timeRange ? timeRange.trim() : "",
      duration: duration ? duration.trim() : "",
      location: location.trim(),
      eventType: eventType ? eventType.trim() : "EVENT",
      status: calculatedStatus,
      rsvpLink: link,
      redirectUrl: link,
      registrationDeadline: registrationDeadline
        ? new Date(registrationDeadline)
        : undefined,
      organizer: organizer ? organizer.trim() : "NexSync Autonomous Mobility",
      isFeatured: Boolean(isFeatured),
      registeredCount: registeredCount !== undefined ? Number(registeredCount) : 0,
      isArchived: false,
      createdBy: req.user?._id,
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Server error creating event",
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      coverImage,
      image,
      videoUrl,
      galleryImages,
      startDate,
      endDate,
      timeRange,
      duration,
      location,
      eventType,
      status,
      rsvpLink,
      redirectUrl,
      registrationDeadline,
      organizer,
      isFeatured,
      registeredCount,
    } = req.body;

    const rawCover = coverImage !== undefined ? coverImage.trim() : image !== undefined ? image.trim() : undefined;
    const primaryCover = rawCover !== undefined ? formatImageUrl(rawCover) : undefined;
    const primaryVideo = videoUrl !== undefined ? videoUrl.trim() : undefined;

    // Validate media if provided
    validateMedia(primaryCover, primaryVideo);

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (primaryCover !== undefined) {
      updateData.coverImage = primaryCover;
      updateData.image = primaryCover;
    }
    if (primaryVideo !== undefined) updateData.videoUrl = primaryVideo;

    if (galleryImages !== undefined && Array.isArray(galleryImages)) {
      updateData.galleryImages = galleryImages.map((g) => formatImageUrl(String(g).trim())).filter(Boolean);
    }

    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (timeRange !== undefined) updateData.timeRange = timeRange.trim();
    if (duration !== undefined) updateData.duration = duration.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (eventType !== undefined) updateData.eventType = eventType.trim();
    if (status !== undefined) updateData.status = status;

    const link = rsvpLink !== undefined ? rsvpLink.trim() : redirectUrl !== undefined ? redirectUrl.trim() : undefined;
    if (link !== undefined) {
      updateData.rsvpLink = link;
      updateData.redirectUrl = link;
    }

    if (registrationDeadline !== undefined) {
      updateData.registrationDeadline = registrationDeadline ? new Date(registrationDeadline) : null;
    }

    if (organizer !== undefined) updateData.organizer = organizer.trim();
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (registeredCount !== undefined) updateData.registeredCount = Number(registeredCount);

    const event = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Server error updating event",
    });
  }
};

const archiveEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    res.json({
      success: true,
      message: "Event moved to archives",
      data: event,
    });
  } catch (error) {
    console.error("Archive event error:", error);
    res.status(500).json({
      success: false,
      message: "Server error archiving event",
    });
  }
};

const restoreEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isArchived: false },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    res.json({
      success: true,
      message: "Event restored successfully",
      data: event,
    });
  } catch (error) {
    console.error("Restore event error:", error);
    res.status(500).json({
      success: false,
      message: "Server error restoring event",
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    res.json({
      success: true,
      message: "Event permanently erased from database",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting event",
    });
  }
};

module.exports = {
  listEvents,
  listAdminEvents,
  getEvent,
  createEvent,
  updateEvent,
  archiveEvent,
  restoreEvent,
  deleteEvent,
};
