const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");

// @desc    Create Assignment (Teacher only)
// @route   POST /api/assignments
const createAssignment = async (req, res) => {
  try {
    const { title, description, courseCode, semester, deadline } =
      req.body;

    if (
      !title ||
      !description ||
      !courseCode ||
      !semester ||
      !deadline
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide all required fields",
        });
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const assignment = await Assignment.create({
      title,
      description,
      courseCode,
      semester,
      deadline,
      teacher: req.user._id,
      fileUrl,
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Assignments (Filter by Department/Semester or Teacher)
// @route   GET /api/assignments
const getAssignments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "student") {
      query.department = req.user.department;
      if (req.user.semester) query.semester = req.user.semester;
    } else if (req.user.role === "teacher") {
      query.teacher = req.user._id;
    }

    const assignments = await Assignment.find(query)
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit Assignment Solution (Student only)
// @route   POST /api/assignments/:id/submit
const submitAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload your solution file" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    // Check if already submitted
    let existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id,
    });

    const fileUrl = `/uploads/${req.file.filename}`;

    if (existingSubmission) {
      existingSubmission.fileUrl = fileUrl;
      existingSubmission.status = "submitted";
      await existingSubmission.save();
      return res.json({
        success: true,
        message: "Submission updated",
        data: existingSubmission,
      });
    }

    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user._id,
      fileUrl,
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Assignment submitted successfully",
        data: submission,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Submissions for an Assignment (Teacher only)
// @route   GET /api/assignments/:id/submissions
const getAssignmentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id })
      .populate("student", "name email department semester")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Grade a Submission (Teacher only)
// @route   PUT /api/assignments/submissions/:submissionId/grade
const gradeSubmission = async (req, res) => {
  try {
    const { marks, feedback } = req.body;

    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }

    submission.marks = marks;
    submission.feedback = feedback || "";
    submission.status = "graded";
    await submission.save();

    res.json({
      success: true,
      message: "Submission graded successfully",
      data: submission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  submitAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
};
