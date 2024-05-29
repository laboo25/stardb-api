const newStarSchema = require("../models/newStarSchema");
const cloudinary = require('../config/cloudinaryConfig');
const path = require('path');

// Function to upload a single image to Cloudinary with transformations and original file name
function uploadToCloudinary(buffer, folder, filename, transformations) {
    return new Promise((resolve, reject) => {
        const sanitizedFilename = path.parse(filename).name.trim().replace(/\s+/g, '_');
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: sanitizedFilename, // Use the sanitized filename without extension
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

        // Upload avatar image if it exists
        if (req.files && req.files.starprofile) {
            const avatarResult = await uploadToCloudinary(
                req.files.starprofile[0].buffer,
                'avatars',
                req.files.starprofile[0].originalname, // Pass original filename
                [{ width: 2000, crop: "limit" }]
            );
            starprofileUrl = avatarResult.secure_url;
        }

        // Upload cover image if it exists
        if (req.files && req.files.starcover) {
            const coverImageResult = await uploadToCloudinary(
                req.files.starcover[0].buffer,
                'covers',
                req.files.starcover[0].originalname, // Pass original filename
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
