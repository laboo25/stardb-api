const starImagesSchema = require('../models/starImagesSchema');
const createStarSchema = require('../models/newStarSchema');
const cloudinary = require('../config/cloudinaryConfig');

// Function to create a webp thumbnail URL with max size 300px
function createThumbnailUrl(url) {
    const parts = url.split('upload/');
    const baseUrl = parts[0] + 'upload/';
    const imageUrl = parts[1];
    return `${baseUrl}c_limit,w_300,h_300,q_auto,f_webp/${imageUrl}`;
}

async function createStarImagesController(req, res) {
    console.log('createStarImagesController');
    try {
        const { starname: starId, subfolder } = req.body; // Extract starname (ID) and subfolder from request body

        // Fetch the actual star document from the database using the ID
        const star = await createStarSchema.findById(starId);
        if (!star) {
            return res.status(404).json({ message: 'Star not found' });
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
                    const stream = cloudinary.uploader.upload_stream({
                        folder: `images/${subfolder}`,
                        public_id: `${starId}-images/${file.originalname}`
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
            tags: result.tags || req.body.tags || [] // Get tags from Cloudinary result or request body
        }));

        // Create a new starImages object
        const newStarImages = new starImagesSchema({
            starname: starId, // Use the star ID for the starname field in starImagesSchema
            starImages: images,
        });

        // Save the new starImages object to the database
        const savedStarImages = await newStarImages.save();

        // Update the corresponding star collection document with the new starImages ID
        await createStarSchema.findByIdAndUpdate(
            starId, // Update by star ID
            { $push: { starImages: savedStarImages._id } }, // Correct the field name
            { new: true }
        );

        res.status(201).json(savedStarImages); // Respond with the saved star images object
    } catch (error) {
        console.error('Error in createStarImagesController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = createStarImagesController;
