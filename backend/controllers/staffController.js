// backend/controllers/staffController.js
const Staff = require("../models/Staff");
const User = require("../models/User");

// 1. Get All Staff Members
const getAllStaff = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    let filter = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
      ];
    }

    if (department) filter.department = department;
    if (status) filter.status = status;

    const staffList = await Staff.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: staffList.length,
      data: staffList,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Register New Staff Member
const createStaff = async (req, res) => {
  try {
    const {
      fullName,
      employeeId,
      email,
      phone,
      department,
      designation,
      qualification,
      monthlySalary,
      joiningDate,
    } = req.body;

    if (
      !fullName ||
      !employeeId ||
      !email ||
      !phone ||
      !department ||
      !designation
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const existingStaff = await Staff.findOne({ employeeId });
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: `Employee ID '${employeeId}' already exists.`,
      });
    }

    // Check if a User account already exists with this email
    const linkedUser = await User.findOne({ email });

    const staff = await Staff.create({
      user: linkedUser ? linkedUser._id : null,
      employeeId,
      fullName,
      email,
      phone,
      department,
      designation,
      qualification: qualification || "Masters",
      monthlySalary: Number(monthlySalary) || 0,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      status: "Active",
    });

    return res.status(201).json({
      success: true,
      message: "Staff member registered successfully.",
      data: staff,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update Staff Member Details
const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!staff) {
      return res
        .status(404)
        .json({ success: false, message: "Staff member not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Staff details updated.",
      data: staff,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Delete Staff Record
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res
        .status(404)
        .json({ success: false, message: "Staff member not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Staff record deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
};
