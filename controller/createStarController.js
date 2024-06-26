const newStarSchema = require("../models/newStarSchema");
const cloudinary = require('../config/cloudinaryConfig');
const path = require('path');

// Function to upload a single image to Cloudinary with transformations and custom filename
function uploadToCloudinary(buffer, filename, isProfile, transformations) {
    return new Promise((resolve, reject) => {
        const sanitizedFilename = filename.trim().replace(/\s+/g, '_'); // Remove spaces and replace with underscores
        const folder = isProfile ? 'avatars' : 'covers'; // Determine folder based on isProfile flag
        const public_id = `${sanitizedFilename}_${isProfile ? 'profile' : 'cover'}`; // Construct public_id with sanitized filename and type
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id,
                transformation: transformations,
                format: 'webp' // Ensuring the format is webp
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        stream.end(buffer);
    });
}

async function createStarController(req, res) {
    try {
        const { starname } = req.body; // Extract data from request body

        // Check for duplicate starname
        const duplicate = await newStarSchema.findOne({ starname });
        if (duplicate) {
            return res.status(409).json({ message: 'Star already exists' });
        }

        // Initialize variables for image URLs
        let starprofileUrl = '';
        let starcoverUrl = '';

        // Upload profile image if it exists
        if (req.files && req.files.starprofile) {
            const avatarResult = await uploadToCloudinary(
                req.files.starprofile[0].buffer,
                starname, // Use starname as the filename for profile image
                true, // Indicate it's a profile image
                [{ width: 1200, crop: "limit" }]
            );
            starprofileUrl = avatarResult.secure_url;
        }

        // Upload cover image if it exists
        if (req.files && req.files.starcover) {
            const coverImageResult = await uploadToCloudinary(
                req.files.starcover[0].buffer,
                starname, // Use starname as the filename for cover image
                false, // Indicate it's not a profile image
                [{ width: 500, crop: "limit" }]
            );
            starcoverUrl = coverImageResult.secure_url;
        }

        // Create a new star object with image URLs
        const newStar = new newStarSchema({
            starname,
            starprofile: starprofileUrl,
            starcover: starcoverUrl,
        });

        // Save the new star object to the database
        const savedStar = await newStar.save();

        res.status(201).json(savedStar); // Respond with the saved star object
    } catch (error) {
        console.error('Error creating star:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = createStarController;
