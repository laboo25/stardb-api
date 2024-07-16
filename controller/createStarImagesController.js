const starImagesSchema = require('../models/starImagesSchema');
const createStarSchema = require('../models/newStarSchema');
const cloudinary = require('../config/cloudinaryConfig');
const mongoose = require('mongoose');

function createThumbnailUrl(url) {
    const parts = url.split('upload/');
    const baseUrl = parts[0] + 'upload/';
    const imageUrl = parts[1];
    return `${baseUrl}c_limit,w_300,h_300,q_auto,f_webp/${imageUrl}`;
}

async function createStarImagesController(req, res) {
    try {
        const { starIds, subfolder, tags } = req.body;

        let stars = [];
        if (starIds && starIds.length > 0) {
            for (const starId of starIds) {
                if (!mongoose.Types.ObjectId.isValid(starId)) {
                    return res.status(400).json({ message: 'Invalid star ID' });
                }
            }
            stars = await createStarSchema.find({ _id: { $in: starIds } });
            if (stars.length !== starIds.length) {
                return res.status(404).json({ message: 'One or more stars not found' });
            }
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images provided' });
        }

        // Sanitize subfolder name
        const sanitizedSubfolder = subfolder ? subfolder.replace(/\s+/g, '-') : 'images';

        // Upload images to Cloudinary
        const uploadQueue = [];
        for (let i = 0; i < req.files.length; i += 5) {
            const batchFiles = req.files.slice(i, i + 5);
            const batchUploads = batchFiles.map(file => {
                return new Promise((resolve, reject) => {
                    const folderPath = `images/${sanitizedSubfolder}`;
                    const sanitizedFilename = file.originalname.replace(/\s+/g, '-');
                    const publicId = `${starIds ? starIds.join('-') : 'generic'}-images/${sanitizedFilename}-${Date.now()}`;
                    const stream = cloudinary.uploader.upload_stream({
                        folder: folderPath,
                        public_id: publicId
                    }, (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    });
                    stream.end(file.buffer);
                });
            });
            uploadQueue.push(Promise.all(batchUploads));
        }

        const uploadResults = await Promise.all(uploadQueue.flat());

        // Create images array with URLs and thumbnails
        const images = uploadResults.flat().map(result => ({
            imageurl: result.secure_url,
            imageThumb: createThumbnailUrl(result.secure_url),
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []

            
        }));
        

        // Save images in the starImages schema
        const newStarImages = new starImagesSchema({
            starname: starIds || [], // Optional starname
            starImages: images,
        });

        const savedStarImages = await newStarImages.save();

        // Update star documents if starIds are provided
        if (starIds && starIds.length > 0) {
            await createStarSchema.updateMany(
                { _id: { $in: starIds } },
                { $push: { starImages: savedStarImages._id } },
                { new: true }
            );
        }

        res.status(201).json(savedStarImages);
    } catch (error) {
        console.error('Error in createStarImagesController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = createStarImagesController;