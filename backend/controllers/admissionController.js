// backend/controllers/admissionController.js
const Student = require("../models/Student");
const User = require("../models/User");

// 1. Get all students with optional search & filters
exports.getAllAdmissions = async (req, res) => {
  try {
    const { search, department, semester } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { admissionNo: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (department) query.department = department;
    if (semester) query.semester = Number(semester);

    const students = await Student.find(query)
      .populate("user", "name email role isVerified")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Register / Create a new admission
exports.createAdmission = async (req, res) => {
  try {
    const {
      fullName,
      admissionNo,
      email,
      gender,
      department,
      semester,
      section,
      guardianName,
      guardianPhone,
      guardianEmail,
      address,
      monthlyFee,
    } = req.body;

    if (
      !fullName ||
      !admissionNo ||
      !email ||
      !department ||
      !guardianName ||
      !guardianPhone
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    const existingAdmission = await Student.findOne({ admissionNo });
    if (existingAdmission) {
      return res.status(400).json({
        success: false,
        message: `Student with Admission No '${admissionNo}' already exists.`,
      });
    }

    // Auto-link with User account if user already registered with this email
    const linkedUser = await User.findOne({ email });

    const student = await Student.create({
      user: linkedUser ? linkedUser._id : null,
      admissionNo,
      fullName,
      email,
      gender: gender || "Male",
      department,
      semester: Number(semester) || 1,
      section: section || "A",
      guardianName,
      guardianPhone,
      guardianEmail,
      address,
      monthlyFee: Number(monthlyFee) || 0,
      status: "Enrolled",
    });

    return res.status(201).json({
      success: true,
      message: "Student admitted successfully",
      data: student,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update student admission details
exports.updateAdmission = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student record not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Student record updated",
      data: student,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Delete admission record
exports.deleteAdmission = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Student record removed",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
