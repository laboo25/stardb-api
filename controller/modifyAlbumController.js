const albumsSchema = require('../models/albumsSchema');
const createStarSchema = require('../models/newStarSchema'); // Model for the star collection
const cloudinary = require('../config/cloudinaryConfig');

async function deleteAlbumController(req, res) {
    console.log('deleteAlbumController');
    try {
        const { albumId } = req.params; // Extract album ID from request parameters

        // Check if the album exists
        const album = await albumsSchema.findById(albumId);
        if (!album) {
            return res.status(404).json({ message: 'Album not found' });
        }

        // Delete images from Cloudinary and remove from album
        await Promise.all(album.albumimages.map(async (image) => {
            try {
                await cloudinary.uploader.destroy(image.public_id);
            } catch (error) {
                console.error('Error deleting image from Cloudinary:', error);
            }
        }));

        // Delete the album folder from Cloudinary
        try {
            await cloudinary.api.delete_folder(`albums/${album.albumname}`);
        } catch (error) {
            console.error('Error deleting album folder from Cloudinary:', error);
        }

        // Delete the album from the database
        await albumsSchema.findByIdAndDelete(albumId);

        // Remove the album ID from the corresponding star collection document
        await createStarSchema.findOneAndUpdate(
            { staralbums: albumId }, // Find by album ID in staralbums array
            { $pull: { staralbums: albumId } }, // Remove album ID from staralbums array
            { new: true }
        );

        res.status(200).json({ message: 'Album deleted successfully' });
    } catch (error) {
        console.error('Error in deleteAlbumController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function updateAlbumController(req, res) {
    console.log('updateAlbumController');
    try {
        const { albumId } = req.params; // Extract album ID from request parameters
        const { albumname, starname } = req.body; // Extract updated album name and star name from request body

        // Check if the album exists
        const album = await albumsSchema.findById(albumId);
        if (!album) {
            return res.status(404).json({ message: 'Album not found' });
        }

        // Validate the required fields
        if (!albumname) {
            return res.status(400).json({ message: 'Album name is required' });
        }
        if (!starname) {
            return res.status(400).json({ message: 'Star name is required' });
        }

        // Update the album in the database
        await albumsSchema.findByIdAndUpdate(
            albumId,
            { albumname: albumname, starname: starname },
            { new: true }
        );

        res.status(200).json({ message: 'Album updated successfully' });
    } catch (error) {
        console.error('Error in updateAlbumController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { deleteAlbumController, updateAlbumController };
