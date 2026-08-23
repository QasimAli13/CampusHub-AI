// backend/controllers/examController.js
const Exam = require("../models/Exam");
const Student = require("../models/Student");

const calculateGrade = (obtained, total) => {
  const percentage = (obtained / total) * 100;
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
};

// 1. Create a new Exam Schedule
const createExam = async (req, res) => {
  try {
    const {
      title,
      examType,
      subject,
      department,
      semester,
      examDate,
      totalMarks,
      passingMarks,
    } = req.body;

    if (
      !title ||
      !subject ||
      !department ||
      !semester ||
      !examDate ||
      !totalMarks
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required exam fields.",
      });
    }

    const exam = await Exam.create({
      title,
      examType: examType || "Midterm",
      subject,
      department,
      semester: Number(semester),
      examDate: new Date(examDate),
      totalMarks: Number(totalMarks),
      passingMarks: Number(passingMarks) || Number(totalMarks) * 0.5,
      results: [],
    });

    return res.status(201).json({
      success: true,
      message: "Exam scheduled successfully.",
      data: exam,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Fetch all scheduled exams
const getAllExams = async (req, res) => {
  try {
    const { department, semester, examType } = req.query;
    let filter = {};

    if (department) filter.department = department;
    if (semester) filter.semester = Number(semester);
    if (examType) filter.examType = examType;

    const exams = await Exam.find(filter).sort({ examDate: -1 });

    return res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. Submit or Update marks for students in an Exam
const submitExamMarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { marksList } = req.body; // Array: [{ studentId, obtainedMarks }]

    if (!Array.isArray(marksList) || marksList.length === 0) {
      return res.status(400).json({
        success: false,
        message: "marksList array is required.",
      });
    }

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam record not found.",
      });
    }

    const processedResults = marksList.map((item) => {
      const marks = Number(item.obtainedMarks) || 0;
      const grade = calculateGrade(marks, exam.totalMarks);
      const status = marks >= exam.passingMarks ? "Pass" : "Fail";

      return {
        student: item.studentId,
        obtainedMarks: marks,
        grade,
        status,
      };
    });

    exam.results = processedResults;
    await exam.save();

    return res.status(200).json({
      success: true,
      message: `Marks recorded for ${processedResults.length} students.`,
      data: exam,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Get single exam with populated students sheet
const getExamDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findById(id).populate(
      "results.student",
      "fullName admissionNo department semester",
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createExam,
  getAllExams,
  submitExamMarks,
  getExamDetails,
};
