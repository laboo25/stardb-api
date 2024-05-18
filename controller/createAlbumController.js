const albumsSchema = require('../models/albumsSchema');
const createStarSchema = require('../models/newStarSchema');
const cloudinary = require('../config/cloudinaryConfig');

async function uploadToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: folder }, (error, result) => {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
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
    console.log('createAlbumController');
    try {
        const { albumname, starname } = req.body;
        console.log('Request body:', req.body);

        if (!albumname) {
            return res.status(400).json({ message: 'Album name is required' });
        }
        if (!starname) {
            return res.status(400).json({ message: 'Star name is required' });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images provided' });
        }

        const uploadQueue = [];
        for (let i = 0; i < req.files.length; i += 5) {
            const batchFiles = req.files.slice(i, i + 5);
            const batchUploads = batchFiles.map(file => {
                return new Promise(async (resolve, reject) => {
                    try {
                        const result = await uploadToCloudinary(file.buffer, `albums/${albumname}`);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
            uploadQueue.push(Promise.all(batchUploads));
        }

        const uploadResults = await Promise.all(uploadQueue.flat());

        const albumImages = uploadResults.flat().map(result => ({
            imageurl: result.secure_url,
            thumburl: createThumbnailUrl(result.secure_url),
            tags: result.tags || req.body.tags || []
        }));

        const newAlbum = new albumsSchema({
            albumname: albumname,
            albumimages: albumImages,
            starname: starname
        });

        const savedAlbum = await newAlbum.save();

        await createStarSchema.findOneAndUpdate(
            { starname: starname },
            { $push: { staralbums: savedAlbum._id } },
            { new: true }
        );

        res.status(201).json(savedAlbum);
    } catch (error) {
        console.error('Error in createAlbumController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = createAlbumController;
