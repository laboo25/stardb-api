const newStarSchema = require("../models/newStarSchema");
const cloudinary = require('../config/cloudinaryConfig');

// Function to upload a single image to Cloudinary with transformations and original file name
function uploadToCloudinary(buffer, folder, filename, transformations) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: filename.split('.')[0], // Use the original filename without extension
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

        // Check if avatar and coverImage files exist in request
        if (!req.files || !req.files.starprofile || !req.files.starcover) {
            console.log('Avatar and coverImage files are not present in the request');
            return res.status(400).json({ message: 'Avatar and coverImage files are required' });
        }

        // Upload images to Cloudinary with transformations
        const avatarResult = await uploadToCloudinary(
            req.files.starprofile[0].buffer,
            'avatars',
            req.files.starprofile[0].originalname, // Pass original filename
            [{ width: 2000, crop: "limit" }]
        );

        const coverImageResult = await uploadToCloudinary(
            req.files.starcover[0].buffer,
            'covers',
            req.files.starcover[0].originalname, // Pass original filename
            [{ width: 500, crop: "limit" }]
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
