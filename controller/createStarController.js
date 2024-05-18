const newStarSchema = require("../models/newStarSchema");
const cloudinary = require('../config/cloudinaryConfig');

function uploadToCloudinary(buffer, folder, transformations) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, transformation: transformations },
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

        // Check if avatar and coverImage files exist in request
        if (!req.files || !req.files.starprofile || !req.files.starcover) {
            console.log('Avatar and coverImage files are not present in the request');
            return res.status(400).json({ message: 'Avatar and coverImage files are required' });
        }

        // Upload images to Cloudinary with transformations
        const avatarResult = await uploadToCloudinary(
            req.files.starprofile[0].buffer,
            'avatars',
            [{ width: 2000, crop: "limit", format: "webp" }]
        );
        const coverImageResult = await uploadToCloudinary(
            req.files.starcover[0].buffer,
            'covers',
            [{ width: 500, crop: "limit", format: "webp" }]
        );

        // Create a new star object with image URLs
        const newStar = new newStarSchema({
            starname,
            starprofile: avatarResult.secure_url,
            starcover: coverImageResult.secure_url,
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
