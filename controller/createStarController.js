const newStarSchema = require("../models/newStarSchema");
const cloudinary = require('../config/cloudinaryConfig');
const sharp = require('sharp');

// Function to upload a single image to Cloudinary with transformations and custom filename
async function uploadToCloudinary(buffer, filename, isProfile, transformations, maxSizeKb) {
    try {
        const sanitizedFilename = filename.trim().replace(/\s+/g, '_'); // Remove spaces and replace with underscores
        const folder = isProfile ? 'avatars' : 'covers'; // Determine folder based on isProfile flag
        const public_id = `${sanitizedFilename}_${isProfile ? 'profile' : 'cover'}`; // Construct public_id with sanitized filename and type

        // Resize image to meet the maxSizeKb requirement
        const resizedBuffer = await sharp(buffer)
            .resize({ width: transformations[0].width, height: transformations[0].height, fit: 'inside' })
            .toFormat('webp', { quality: 80 }) // Adjust quality as needed
            .toBuffer();

        // Ensure the image size is within the maxSizeKb limit
        let finalBuffer = resizedBuffer;
        if (resizedBuffer.length > maxSizeKb * 1024) {
            const reduceQuality = Math.max(Math.floor((maxSizeKb * 1024) / resizedBuffer.length * 80), 30); // Min quality 30
            finalBuffer = await sharp(buffer)
                .resize({ width: transformations[0].width, height: transformations[0].height, fit: 'inside' })
                .toFormat('webp', { quality: reduceQuality })
                .toBuffer();
        }

        // Upload resized image to Cloudinary
        return new Promise((resolve, reject) => {
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
            stream.end(finalBuffer);
        });
    } catch (error) {
        throw new Error(`Error processing image: ${error.message}`);
    }
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
                [{ width: 1200, crop: "limit" }], // Transformations
                90 // Max size in KB for profile image
            );
            starprofileUrl = avatarResult.secure_url;
        }

        // Upload cover image if it exists
        if (req.files && req.files.starcover) {
            const coverImageResult = await uploadToCloudinary(
                req.files.starcover[0].buffer,
                starname, // Use starname as the filename for cover image
                false, // Indicate it's not a profile image
                [{ width: 500, crop: "limit" }], // Transformations
                17 // Max size in KB for cover image
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
