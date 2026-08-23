const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendOtpEmail, sendResetPasswordEmail } = require("../utils/sendEmail");

// JWT Helper Function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// 1. REGISTER FUNCTION
const register = async (req, res) => {
  try {
    const { name, email, password, department, semester, role } = req.body;

    const cleanEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: cleanEmail });
    if (user && user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (user && !user.isVerified) {
      user.name = name;
      user.password = hashedPassword;
      user.department = department;
      user.semester = semester ? Number(semester) : 1;
      user.role = role || "student";
      user.verificationOtp = otp; // 👈 Exact Schema Field
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      user = await User.create({
        name,
        email: cleanEmail,
        password: hashedPassword,
        department,
        semester: semester ? Number(semester) : 1,
        role: role || "student",
        verificationOtp: otp, // 👈 Exact Schema Field
        otpExpires,
        isVerified: false,
      });
    }

    await sendOtpEmail(cleanEmail, otp);

    res.status(201).json({
      success: true,
      message: "Registration successful! Verification OTP sent to your email.",
      email: user.email,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. VERIFY OTP FUNCTION
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and OTP",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified. Please login.",
      });
    }

    console.log(
      "DB Verification OTP:",
      user.verificationOtp,
      "Received OTP:",
      cleanOtp,
    );

    // 1. Check OTP Match (Using verificationOtp)
    if (
      !user.verificationOtp ||
      String(user.verificationOtp).trim() !== cleanOtp
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code. Please check and try again.",
      });
    }

    // 2. Check Expiry
    if (new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({
        success: false,
        message: "OTP code has expired. Please request a new one.",
      });
    }

    // Mark as Verified & Clear OTP fields
    user.isVerified = true;
    user.verificationOtp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        semester: user.semester,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. RESEND OTP FUNCTION
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOtp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(cleanEmail, otp);

    res.status(200).json({
      success: true,
      message: "New OTP code sent to your email.",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. LOGIN FUNCTION
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in",
        notVerified: true,
        email: user.email,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        semester: user.semester,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. FORGOT PASSWORD FUNCTION (Uses resetToken)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetToken = hashedResetToken; // 👈 Matches Schema field
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    await sendResetPasswordEmail(cleanEmail, resetToken);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. RESET PASSWORD FUNCTION (Verifies resetToken)
const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      email: cleanEmail,
      resetToken: hashedResetToken,
      otpExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset link",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetToken = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful! You can now log in.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// EXPORTS AT THE END
// ==========================================
module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
};
