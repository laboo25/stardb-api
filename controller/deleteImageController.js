const starImagesSchema = require('../models/starImagesSchema');
const cloudinary = require('../config/cloudinaryConfig');

async function deleteImageController(req, res) {
    try {
        const { starImageId, imageId } = req.params;

        if (!starImageId || !imageId) {
            return res.status(400).json({ message: 'Star Image ID and Image ID are required' });
        }

        const starImage = await starImagesSchema.findById(starImageId);
        if (!starImage) {
            return res.status(404).json({ message: 'Star Image not found' });
        }

        const image = starImage.starImages.id(imageId);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Extract the public ID from the Cloudinary URL
        const publicId = image.imageurl.split('/').pop().split('.')[0];

        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(publicId);

        // Remove the image from the starImages array
        image.remove();

        // Save the updated document
        await starImage.save();

        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error in deleteImageController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = deleteImageController;
