// backend/controllers/studentController.js
const Student = require("../models/Student");

// 1. Get all students (with optional search/filter)
const getAllStudents = async (req, res) => {
  try {
    const { search, department, batch } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (department) query.department = department;
    if (batch) query.batch = batch;

    const students = await Student.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error("Get Students Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error fetching students." });
  }
};

// 2. Get single student by ID
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student record not found." });
    }
    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// 3. Create / Admit new student (Admin only)
const createStudent = async (req, res) => {
  try {
    const {
      name,
      rollNumber,
      email,
      phone,
      department,
      batch,
      semester,
      guardianName,
      guardianPhone,
      feeStatus,
    } = req.body;

    if (!name || !rollNumber || !email) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, Roll Number, and Email are required.",
        });
    }

    const existingStudent = await Student.findOne({
      $or: [{ rollNumber }, { email }],
    });
    if (existingStudent) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Roll Number or Email already registered.",
        });
    }

    const newStudent = await Student.create({
      name,
      rollNumber,
      email,
      phone,
      department,
      batch,
      semester,
      guardianName,
      guardianPhone,
      feeStatus: feeStatus || "Pending",
      status: "Enrolled",
    });

    return res
      .status(201)
      .json({
        success: true,
        data: newStudent,
        message: "Student admitted successfully.",
      });
  } catch (error) {
    console.error("Create Student Error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to create student.",
      });
  }
};

// 4. Update student record
const updateStudent = async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    if (!updatedStudent) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found." });
    }

    return res
      .status(200)
      .json({
        success: true,
        data: updatedStudent,
        message: "Student updated successfully.",
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to update student." });
  }
};

// 5. Delete student record
const deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found." });
    }
    return res
      .status(200)
      .json({ success: true, message: "Student record removed." });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete student." });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
