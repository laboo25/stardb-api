const albumsSchema = require('../models/albumsSchema');
const starSchema = require('../models/newStarSchema');
const cloudinary = require('../config/cloudinaryConfig');

async function deleteAlbumController(req, res) {
    try {
        const { albumId, imageId } = req.params;

        // Find the album
        const album = await albumsSchema.findById(albumId);

        if (!album) {
            return res.status(404).json({ message: 'Album not found' });
        }

        if (imageId) {
            // If imageId is provided, delete the specific image from the album

            // Find the image to delete
            const image = album.albumimages.id(imageId);

            if (!image) {
                return res.status(404).json({ message: 'Image not found in album' });
            }

            // Delete image from Cloudinary
            const publicId = image.imageurl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);

            // Remove image from albumimages array
            album.albumimages.pull({ _id: imageId });
            await album.save();

            return res.status(200).json({ message: 'Image deleted successfully from album' });
        } else {
            // If imageId is not provided, delete the entire album

            // Delete images from Cloudinary
            await Promise.all(album.albumimages.map(async (image) => {
                const publicId = image.imageurl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }));

            // Delete the album
            await albumsSchema.findByIdAndDelete(albumId);

            // Remove the album from star's albums
            await starSchema.updateMany(
                { _id: { $in: album.starname } },
                { $pull: { starAlbums: albumId } }
            );

            return res.status(200).json({ message: 'Album deleted successfully' });
        }
    } catch (error) {
        console.error('Error in deleteAlbumController:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = deleteAlbumController;
