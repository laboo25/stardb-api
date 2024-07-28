const albumsSchema = require('../models/albumsSchema');
const starSchema = require('../models/newStarSchema');
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

async function createAlbumController(req, res) {
    console.log('createAlbumController invoked');
    try {
        const { albumname, starname, tags } = req.body;

        if (!albumname) {
            return res.status(400).json({ message: 'Album name is required' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images provided' });
        }

        const albumPromises = req.files.map(async (file) => {
            console.log(`Uploading file: ${file.originalname}`);
            const result = await uploadToCloudinary(file.buffer, `albums/${albumname}`, file.originalname);
            console.log(`Uploaded file: ${result.secure_url}`);
            return {
                imageurl: result.secure_url,
                thumburl: createThumbnailUrl(result.secure_url),
                tags: tags || []
            };
        });

        const albumImages = await Promise.all(albumPromises);
        console.log('All images uploaded');

        const starnameArray = Array.isArray(starname) ? starname : (starname ? [starname] : []);

        const newAlbum = new albumsSchema({
            albumname,
            albumimages: albumImages,
            starname: starnameArray
        });

        const savedAlbum = await newAlbum.save();
        console.log('Album saved to database:', savedAlbum);

        await Promise.all(starnameArray.map(starId => {
            console.log(`Updating star schema for starId: ${starId}`);
            return starSchema.findByIdAndUpdate(
                starId,
                { $push: { starAlbums: savedAlbum._id } },
                { new: true }
            );
        }));

        console.log('Album created successfully:', savedAlbum);

        res.status(201).json(savedAlbum);
    } catch (error) {
        console.error('Error in createAlbumController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = createAlbumController;
