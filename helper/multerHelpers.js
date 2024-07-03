// helpers/multerHelpers.js
const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 300 * 1024 * 1024 // Limit file size to 50MB
  }
});

module.exports = upload;
