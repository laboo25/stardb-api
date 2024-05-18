
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials from environment variables
cloudinary.config({ 
    cloud_name: "dnphaxunn", 
    api_key: "485634565795159", 
    api_secret: "bPN1ieGAT-FLG1dj_SuSB_M0AbQ"
});

module.exports = cloudinary;
