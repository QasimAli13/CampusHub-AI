const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File Filter (PDFs, Docs, Images, Code files)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /pdf|doc|docx|png|jpg|jpeg|zip|txt|js|py|cpp/;
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");

  if (allowedExtensions.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("File format not supported! Only PDFs, Docs, Images, and Code files are allowed."), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB Max limit
  fileFilter: fileFilter,
});

module.exports = upload;