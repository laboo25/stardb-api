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

async function deleteStarController(req, res) {
    try {
        const { starId } = req.params;

        // Check if the star exists
        const star = await newStarSchema.findById(starId);
        if (!star) {
            return res.status(404).json({ message: 'Star not found' });
        }

        // Delete the star from the database
        await newStarSchema.findByIdAndDelete(starId);

        res.status(200).json({ message: 'Star deleted successfully' });
    } catch (error) {
        console.error('Error in deleteStarController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
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

        // Update the star in the database
        await newStarSchema.findByIdAndUpdate(
            starId,
            { starname },
            { new: true }
        );

        res.status(200).json({ message: 'Star updated successfully' });
    } catch (error) {
        console.error('Error in updateStarController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { deleteStarController, updateStarController };
