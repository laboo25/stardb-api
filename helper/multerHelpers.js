// helpers/multerHelpers.js

const multer = require('multer');

// Set up memory storage
const storage = multer.memoryStorage();


const upload = multer({ storage });

module.exports = upload;
