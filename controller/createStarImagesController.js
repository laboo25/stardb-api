const starImagesSchema = require('../models/starImagesSchema');
const createStarSchema = require('../models/newStarSchema');
const cloudinary = require('../config/cloudinaryConfig');
const mongoose = require('mongoose'); // Import mongoose for ObjectId validation

// Function to create a webp thumbnail URL with max size 300px
function createThumbnailUrl(url) {
    const parts = url.split('upload/');
    const baseUrl = parts[0] + 'upload/';
    const imageUrl = parts[1];
    return `${baseUrl}c_limit,w_300,h_300,q_auto,f_webp/${imageUrl}`;
}

async function createStarImagesController(req, res) {
    try {
        const { starname: starIds, subfolder, tags } = req.body; // Extract starname (IDs), subfolder, and tags from request body

        let stars = [];
        if (starIds && starIds.length > 0) {
            // Validate if each starId is a valid ObjectId
            for (const starId of starIds) {
                if (!mongoose.Types.ObjectId.isValid(starId)) {
                    return res.status(400).json({ message: 'Invalid star ID' });
                }
            }

            // Fetch the actual star documents from the database using the IDs if provided
            stars = await createStarSchema.find({ _id: { $in: starIds } });
            if (stars.length !== starIds.length) {
                return res.status(404).json({ message: 'One or more stars not found' });
            }
        }

        // Check if files are present in the request
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images provided' });
        }

        const uploadQueue = []; // Queue to hold upload promises

        // Upload files in batches of 5
        for (let i = 0; i < req.files.length; i += 5) {
            const batchFiles = req.files.slice(i, i + 5); // Get the next batch of files
            const batchUploads = batchFiles.map(file => {
                return new Promise((resolve, reject) => {
                    const folderPath = subfolder ? `images/${subfolder}` : 'images'; // Define folder path including subfolder if provided
                    const stream = cloudinary.uploader.upload_stream({
                        folder: folderPath,
                        public_id: `${starIds.join('-') || 'generic'}-images/${file.originalname}-${Date.now()}`
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
            uploadQueue.push(Promise.all(batchUploads)); // Push the batch upload promise to the queue
        }

        // Wait for all batches to upload
        const uploadResults = await Promise.all(uploadQueue.flat());

        // Extract URLs and create thumbnail URLs
        const images = uploadResults.flat().map(result => ({
            imageurl: result.secure_url,
            imageThumb: createThumbnailUrl(result.secure_url),
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [] // Get tags from request body, split and trim them
        }));

        // Create a new starImages object
        const newStarImages = new starImagesSchema({
            starname: starIds || [], // Use the star IDs for the starname field in starImagesSchema, or an empty array if not provided
            starImages: images,
        });

        // Save the new starImages object to the database
        const savedStarImages = await newStarImages.save();

        if (starIds && starIds.length > 0) {
            // Update the corresponding star collection documents with the new starImages ID
            await createStarSchema.updateMany(
                { _id: { $in: starIds } }, // Update by star IDs
                { $push: { starImages: savedStarImages._id } }, // Correct the field name
                { new: true }
            );
        }

        res.status(201).json(savedStarImages); // Respond with the saved star images object
    } catch (error) {
        console.error('Error in createStarImagesController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = createStarImagesController;
