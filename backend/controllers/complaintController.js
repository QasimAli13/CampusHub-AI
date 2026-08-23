const Complaint = require("../models/Complaint");

// @desc    Create a Complaint Ticket (Student / Teacher)
// @route   POST /api/complaints
const createComplaint = async (req, res) => {
  try {
    const { title, description, category, severity } = req.body;

    if (!title || !description || !category) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all required fields." });
    }

    const attachment = req.file ? `/uploads/${req.file.filename}` : null;

    const complaint = await Complaint.create({
      student: req.user._id,
      title,
      description,
      category,
      severity: severity || "medium",
      attachment,
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Complaints (Admin sees all, Student sees own)
// @route   GET /api/complaints
const getComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "student") {
      query.student = req.user._id;
    }

    const complaints = await Complaint.find(query)
      .populate("student", "name email department")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Complaint Status (Admin only)
// @route   PUT /api/complaints/:id/status
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint ticket not found." });
    }

    complaint.status = status || complaint.status;
    if (adminNotes) complaint.adminNotes = adminNotes;
    await complaint.save();

    // Real-time socket emit to the student who raised the ticket
    const io = req.app.get("socketio");
    if (io) {
      io.to(complaint.student.toString()).emit("complaint_status_changed", {
        ticketId: complaint._id,
        title: complaint.title,
        status: complaint.status,
        adminNotes: complaint.adminNotes,
      });
    }

    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createComplaint, getComplaints, updateComplaintStatus };
