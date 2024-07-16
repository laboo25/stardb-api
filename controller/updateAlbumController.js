const albumsSchema = require('../models/albumsSchema');
const cloudinary = require('../config/cloudinaryConfig');

function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

async function uploadToCloudinary(buffer, folder, filename) {
    const sanitizedFilename = sanitizeFilename(filename);
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: folder, public_id: sanitizedFilename },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }
        );
        stream.end(buffer);
    });
}

function createThumbnailUrl(url) {
    const parts = url.split('upload/');
    const baseUrl = parts[0] + 'upload/';
    const imageUrl = parts[1];
    return `${baseUrl}c_limit,w_300,h_300,q_auto,f_webp/${imageUrl}`;
}

const updateAlbumController = async (req, res) => {
    try {
        const albumId = req.params.albumId;
        const { albumname, starname } = req.body;
        const files = req.files;

        if (!albumname) {
            return res.status(400).json({ message: 'Album name is required' });
        }

        const album = await albumsSchema.findById(albumId);
        if (!album) {
            return res.status(404).json({ message: 'Album not found' });
        }

        if (files && files.length > 0) {
            const updatedImages = await Promise.all(files.map(async (file) => {
                const uploadResult = await uploadToCloudinary(file.buffer, 'albums', file.originalname);
                return {
                    imageurl: uploadResult.secure_url,
                    thumburl: createThumbnailUrl(uploadResult.secure_url),
                    starname: starname,
                    tags: []
                };
            }));
            album.albumimages.push(...updatedImages);
        }

        album.albumname = albumname;
        album.starname = starname;
        await album.save();

        res.status(200).json({ message: 'Album updated successfully', album });
    } catch (error) {
        console.error('Error updating album:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = updateAlbumController;
