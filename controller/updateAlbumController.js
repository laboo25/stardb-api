const albumsSchema = require('../models/albumsSchema');
const starSchema = require('../models/newStarSchema');
const cloudinary = require('../config/cloudinaryConfig');

function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

async function uploadToCloudinary(buffer, folder, filename) {
    const timestamp = Date.now();
    const sanitizedFilename = sanitizeFilename(`${filename}_${timestamp}`);
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

async function updateAlbumController(req, res) {
    console.log('updateAlbumController invoked');
    try {
        const { albumId } = req.params;
        const { albumname, starname, tags } = req.body;

        if (!albumId) {
            return res.status(400).json({ message: 'Album ID is required' });
        }

        const album = await albumsSchema.findById(albumId);
        if (!album) {
            return res.status(404).json({ message: 'Album not found' });
        }

        if (albumname) {
            album.albumname = albumname;
        }

        if (req.files && req.files.length > 0) {
            const albumPromises = req.files.map(async (file) => {
                const result = await uploadToCloudinary(file.buffer, `albums/${albumname || album.albumname}`, file.originalname);
                return {
                    imageurl: result.secure_url,
                    thumburl: createThumbnailUrl(result.secure_url),
                    tags: tags || []
                };
            });

            const newAlbumImages = await Promise.all(albumPromises);
            album.albumimages.push(...newAlbumImages);
        }

        // const starnameArray = Array.isArray(starname) ? starname : (starname ? [starname] : []);
        const starnameArray = Array.isArray(starname) ? starname.map(id => mongoose.Types.ObjectId(id)) : [];

        if (starnameArray.length > 0) {
            album.starname = starnameArray;
        }

        const updatedAlbum = await album.save();

        await Promise.all(starnameArray.map(starId => {
            return starSchema.findByIdAndUpdate(
                starId,
                { $push: { starAlbums: updatedAlbum._id } },
                { new: true }
            );
        }));

        console.log('Album updated successfully:', updatedAlbum);

        res.status(200).json(updatedAlbum);
    } catch (error) {
        console.error('Error in updateAlbumController:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}


module.exports = updateAlbumController;
