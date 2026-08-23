const Event = require("../models/Event");

// @desc    Create Society Event (Society Admin / Admin)
// @route   POST /api/events
const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, capacity } = req.body;

    if (!title || !description || !date || !location || !capacity) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all required fields." });
    }

    const posterUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const event = await Event.create({
      title,
      description,
      date,
      location,
      capacity: Number(capacity),
      posterUrl,
      organizer: req.user._id,
    });

    // Notify all campus users in real-time
    const io = req.app.get("socketio");
    if (io) {
      io.emit("new_campus_event", {
        title: event.title,
        date: event.date,
        location: event.location,
      });
    }

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Upcoming Events
// @route   GET /api/events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("organizer", "name email")
      .populate("registeredStudents", "name email department")
      .sort({ date: 1 });

    res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register for an Event (Student)
// @route   POST /api/events/:id/register
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found." });
    }

    if (event.registeredStudents.includes(req.user._id)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You are already registered for this event.",
        });
    }

    if (event.registeredStudents.length >= event.capacity) {
      return res
        .status(400)
        .json({ success: false, message: "Event seats are fully booked." });
    }

    event.registeredStudents.push(req.user._id);
    await event.save();

    res.json({
      success: true,
      message: "Successfully registered for event!",
      registeredCount: event.registeredStudents.length,
      seatsRemaining: event.capacity - event.registeredStudents.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createEvent, getEvents, registerForEvent };
