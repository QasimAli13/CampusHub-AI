// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "campushub_secret",
      );
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "User not found" });
      }
      return next();
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Token invalid or expired" });
    }
  }
  return res
    .status(401)
    .json({ success: false, message: "Not authorized, no token" });
};

// Roles normalizer: handles lowercase/uppercase and teacher/faculty
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
    const userRole = (req.user.role || "").toLowerCase();
    const normalizedUserRole = userRole === "teacher" ? "faculty" : userRole;
    const allowed = roles.map((r) => r.toLowerCase());

    if (!allowed.includes(normalizedUserRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied for role '${req.user.role}'`,
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
