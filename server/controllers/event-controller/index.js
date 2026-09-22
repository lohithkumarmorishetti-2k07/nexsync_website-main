const Event = require("../../models/Event");

const createEvent = async (req, res) => {
  try {
    const { title, category, description, startDate, endDate, timeRange, duration, location, redirectUrl } = req.body;

    if (!title || !category || !description || !startDate || !endDate || !timeRange || !duration || !location || !redirectUrl) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        message: "redirectUrl must be a valid http or https URL",
      });
    }

    const event = new Event({
      title,
      category,
      description,
      startDate,
      endDate,
      timeRange,
      duration,
      location,
      redirectUrl,
      registeredCount: 0,
      createdBy: req.user._id,
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const listEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("List events error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
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

const updateEvent = async (req, res) => {
  try {
    const { title, category, description, startDate, endDate, timeRange, duration, location, redirectUrl } = req.body;

    if (redirectUrl && !redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        message: "redirectUrl must be a valid http or https URL",
      });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title,
        category,
        description,
        startDate,
        endDate,
        timeRange,
        duration,
        location,
        redirectUrl,
      },
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
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
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
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  deleteEvent,
};
