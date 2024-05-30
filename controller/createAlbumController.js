const albumsSchema = require('../models/albumsSchema');
const createStarSchema = require('../models/newStarSchema');  // Model for the star collection
const cloudinary = require('../config/cloudinaryConfig');

// Function to sanitize filename
function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

// Function to upload a single image to Cloudinary
async function uploadToCloudinary(buffer, folder, filename) {
    return new Promise((resolve, reject) => {
        const sanitizedFilename = sanitizeFilename(filename);  // Sanitize and replace spaces with underscores
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

// Function to create a webp thumbnail URL with max size 300px, crop limit
function createThumbnailUrl(url) {
    const parts = url.split('upload/');
    const baseUrl = parts[0] + 'upload/';
    const imageUrl = parts[1];
    return `${baseUrl}c_limit,w_300,h_300,q_auto,f_webp/${imageUrl}`;
}

async function createAlbumController(req, res) {
    console.log('createAlbumController');
    try {
        const { albumname, starname } = req.body;  // Extract album name and star ID from request body

        // Log the incoming data to check if they are correctly sent
        console.log('Request body:', req.body);

        // Validate the required fields
        if (!albumname) {
            return res.status(400).json({ message: 'Album name is required' });
        }

        // Check if files are present in the request
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images provided' });
        }

        const uploadQueue = [];  // Queue to hold upload promises

        // Upload files in batches of 5
        for (let i = 0; i < req.files.length; i += 5) {
            const batchFiles = req.files.slice(i, i + 5);  // Get the next batch of files
            const batchUploads = batchFiles.map(file => {
                return new Promise(async (resolve, reject) => {
                    try {
                        const result = await uploadToCloudinary(file.buffer, `albums/${albumname}`, file.originalname);  // Pass the original filename to upload function
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
            uploadQueue.push(Promise.all(batchUploads));  // Push the batch upload promise to the queue
        }

        // Wait for all batches to upload
        const uploadResults = await Promise.all(uploadQueue.flat());

        // Extract URLs and create album images array
        const albumImages = uploadResults.flat().map(result => ({
            imageurl: result.secure_url,
            thumburl: createThumbnailUrl(result.secure_url),
            tags: result.tags || req.body.tags || []  // Get tags from Cloudinary result or request body
        }));

        // Create a new album object
        const newAlbum = new albumsSchema({
            albumname: albumname,
            albumimages: albumImages,
            starname: starname  // Directly use the star ID from the request body
        });

        // Save the new album object to the database
        const savedAlbum = await newAlbum.save();

        // Update the corresponding star collection document with the new album ID
        const updateResult = await createStarSchema.findByIdAndUpdate(
            starname,  // Update by star ID
            { $push: { starAlbums: savedAlbum._id } },  // Assuming 'starAlbums' is the field in the star schema
            { new: true }
        );

        console.log('Update Result:', updateResult);

        res.status(201).json(savedAlbum);  // Respond with the saved album object
    } catch (error) {
        console.error('Error in createAlbumController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = createAlbumController;
