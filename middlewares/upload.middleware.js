const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Configure multer storage and file name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Create multer upload instance
const upload = multer({ storage: storage });

const uploadMiddleware = (req, res, next) => {
  upload.array("files", 5)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    const files = req.files;
    const errors = [];

    files.forEach((file) => {
      const allowedTypes = ["csv"];
      const maxSize = 20 * 1024 * 1024; // 20MB

      if (!allowedTypes.includes(file.mimetype)) {
        errors.push(`Invalid file type: ${file.originalname}`);
      }

      if (file.size > maxSize) {
        errors.push(`File too large: ${file.originalname}`);
      }
    });

    // Handle validation errors
    if (errors.length > 0) {
      // Remove uploaded files
      files.forEach((file) => {
        fs.unlinkSync(file.path);
      });
      return res.status(400).json({ errors });
    }
    req.files = files;
    next();
  });
};

module.exports = uploadMiddleware;
