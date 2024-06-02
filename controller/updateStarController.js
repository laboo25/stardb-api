const newStarSchema = require("../models/newStarSchema");
const cloudinary = require('../config/cloudinaryConfig');

// Function to delete an image from Cloudinary
async function deleteImageFromCloudinary(imageUrl) {
    if (!imageUrl) return;
    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
    return cloudinary.uploader.destroy(publicId);
}

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

async function updateStarController(req, res) {
    try {
        const { starId } = req.params;
        const { starname } = req.body;

        // Check if the star exists
        const star = await newStarSchema.findById(starId);
        if (!star) {
            return res.status(404).json({ message: 'Star not found' });
        }

        // Initialize variables for image URLs
        let starprofileUrl = star.starprofile;
        let starcoverUrl = star.starcover;

        // Upload new profile image if provided
        if (req.files && req.files.starprofile) {
            if (star.starprofile) {
                await deleteImageFromCloudinary(star.starprofile); // Delete old profile image
            }
            const avatarResult = await uploadToCloudinary(
                req.files.starprofile[0].buffer,
                starname || star.starname, // Use updated starname or existing starname
                true, // Indicate it's a profile image
                [{ width: 2000, crop: "limit" }]
            );
            starprofileUrl = avatarResult.secure_url;
        }

        // Upload new cover image if provided
        if (req.files && req.files.starcover) {
            if (star.starcover) {
                await deleteImageFromCloudinary(star.starcover); // Delete old cover image
            }
            const coverImageResult = await uploadToCloudinary(
                req.files.starcover[0].buffer,
                starname || star.starname, // Use updated starname or existing starname
                false, // Indicate it's not a profile image
                [{ width: 500, crop: "limit" }]
            );
            starcoverUrl = coverImageResult.secure_url;
        }

        // Update star data
        star.starname = starname || star.starname;
        star.starprofile = starprofileUrl;
        star.starcover = starcoverUrl;

        // Save the updated star object to the database
        const updatedStar = await star.save();

        res.status(200).json(updatedStar); // Respond with the updated star object
    } catch (error) {
        console.error('Error updating star:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = updateStarController;
