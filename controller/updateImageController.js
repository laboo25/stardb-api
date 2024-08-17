const starImagesSchema = require('../models/starImagesSchema');
const createStarSchema = require('../models/newStarSchema');
const cloudinary = require('../config/cloudinaryConfig');

function createThumbnailUrl(url) {
    const parts = url.split('upload/');
    const baseUrl = parts[0] + 'upload/';
    const imageUrl = parts[1];
    return `${baseUrl}c_limit,w_300,h_300,q_auto,f_webp/${imageUrl}`;
}

async function updateImageController(req, res) {
    try {
        const { starImageId } = req.params;
        const { starIds, tags } = req.body;

        if (!starImageId) {
            return res.status(400).json({ message: 'Star Image ID is required' });
        }

        const starImage = await starImagesSchema.findById(starImageId);
        if (!starImage) {
            return res.status(404).json({ message: 'Star Image not found' });
        }

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

        if (req.files && req.files.length > 0) {
            // Upload new images to Cloudinary
            const uploadQueue = req.files.map(file => {
                return new Promise((resolve, reject) => {
                    const folderPath = `images/${starImageId}`;
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

            const uploadResults = await Promise.all(uploadQueue);

            // Update images array with new URLs and thumbnails
            starImage.starImages = uploadResults.map(result => ({
                imageurl: result.secure_url,
                imageThumb: createThumbnailUrl(result.secure_url),
                tags: tags ? tags.split(',').map(tag => tag.trim()) : []
            }));
        }

        // Update the starname field if provided
        if (starIds && starIds.length > 0) {
            starImage.starname = starIds;
        }

        const updatedStarImage = await starImage.save();

        // Update the star documents if starIds are provided
        if (starIds && starIds.length > 0) {
            await createStarSchema.updateMany(
                { _id: { $in: starIds } },
                { $push: { starImages: updatedStarImage._id } },
                { new: true }
            );
        }

        res.status(200).json(updatedStarImage);
    } catch (error) {
        console.error('Error in updateImageController:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = updateImageController;
