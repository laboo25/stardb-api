const newStarSchema = require("../models/newStarSchema");
const cloudinary = require('../config/cloudinaryConfig');

async function deleteImageFromCloudinary(imageUrl) {
    if (!imageUrl) return;
    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0]; // Extract the public ID properly
    return cloudinary.uploader.destroy(publicId);
}

async function deleteStarController(req, res) {
    try {
        const { starId, field } = req.params;
        
        if (!starId) {
            return res.status(400).json({ message: 'Star ID is required' });
        }

        const star = await newStarSchema.findById(starId);
        if (!star) {
            return res.status(404).json({ message: 'Star not found' });
        }

        if (field) {
            // Handle the deletion of individual fields
            switch (field) {
                case 'starcover':
                    await deleteImageFromCloudinary(star.starcover);
                    star.starcover = undefined;
                    break;
                case 'starprofile':
                    await deleteImageFromCloudinary(star.starprofile);
                    star.starprofile = undefined;
                    break;
                case 'starname':
                    star.starname = undefined;
                    break;
                case 'starImages':
                    // Assuming starImages contains URLs
                    for (const imageUrl of star.starImages) {
                        await deleteImageFromCloudinary(imageUrl);
                    }
                    star.starImages = [];
                    break;
                case 'starAlbums':
                    star.starAlbums = [];
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid field specified' });
            }

            await star.save();
            return res.status(200).json({ message: `Field ${field} deleted successfully` });
        } else {
            // Delete all related images in Cloudinary
            if (star.starcover) await deleteImageFromCloudinary(star.starcover);
            if (star.starprofile) await deleteImageFromCloudinary(star.starprofile);
            for (const imageUrl of star.starImages) {
                await deleteImageFromCloudinary(imageUrl);
            }

            // Delete the star document
            await newStarSchema.findByIdAndDelete(starId);

            return res.status(200).json({ message: 'Star deleted successfully' });
        }
    } catch (error) {
        console.error('Error in deleteStarController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = deleteStarController;
