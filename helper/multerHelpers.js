const multer = require('multer');

// Use memory storage for uploading directly to Cloudinary
const storage = multer.memoryStorage();

// Set file size limit to 50MB for each file
const upload = multer({
  storage: storage,
  limits: { fileSize: 300 * 1024 * 1024 }, // 50MB per file
});

module.exports = upload;
