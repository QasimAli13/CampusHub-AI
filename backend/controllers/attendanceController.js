// backend/controllers/attendanceController.js
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

const markBulkAttendance = async (req, res) => {
  try {
    const { date, attendanceList } = req.body;

    if (
      !date ||
      !Array.isArray(attendanceList) ||
      attendanceList.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Date and a valid attendanceList array are required.",
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const operations = attendanceList.map((item) => ({
      updateOne: {
        filter: {
          student: item.studentId,
          date: attendanceDate,
        },
        update: {
          $set: {
            student: item.studentId,
            date: attendanceDate,
            status: item.status || "Present",
            remarks: item.remarks || "",
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(operations);

    return res.status(200).json({
      success: true,
      message: `Successfully recorded attendance for ${attendanceList.length} students.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAttendanceSheet = async (req, res) => {
  try {
    const { date, department, semester } = req.query;

    const queryDate = date ? new Date(date) : new Date();
    queryDate.setHours(0, 0, 0, 0);

    const studentFilter = { status: "Enrolled" };
    if (department) studentFilter.department = department;
    if (semester) studentFilter.semester = Number(semester);

    const students = await Student.find(studentFilter).sort({ admissionNo: 1 });

    const attendanceRecords = await Attendance.find({ date: queryDate });

    const attendanceMap = {};
    attendanceRecords.forEach((record) => {
      attendanceMap[record.student.toString()] = {
        status: record.status,
        remarks: record.remarks,
      };
    });

    const sheet = students.map((s) => ({
      studentId: s._id,
      admissionNo: s.admissionNo,
      fullName: s.fullName,
      department: s.department,
      semester: s.semester,
      status: attendanceMap[s._id.toString()]?.status || "Present",
      remarks: attendanceMap[s._id.toString()]?.remarks || "",
    }));

    return res.status(200).json({
      success: true,
      date: queryDate,
      count: sheet.length,
      data: sheet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAttendanceStats = async (req, res) => {
  try {
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const [todayRecords, totalStudents] = await Promise.all([
      Attendance.find({ date: targetDate }),
      Student.countDocuments({ status: "Enrolled" }),
    ]);

    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;

    todayRecords.forEach((r) => {
      if (r.status === "Present") present++;
      if (r.status === "Absent") absent++;
      if (r.status === "Late") late++;
      if (r.status === "Leave") leave++;
    });

    const percentage =
      totalStudents > 0 ? ((present / totalStudents) * 100).toFixed(1) : 0;

    return res.status(200).json({
      success: true,
      data: {
        date: targetDate,
        totalStudents,
        markedCount: todayRecords.length,
        present,
        absent,
        late,
        leave,
        attendancePercentage: Number(percentage),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  markBulkAttendance,
  getAttendanceSheet,
  getAttendanceStats,
};
