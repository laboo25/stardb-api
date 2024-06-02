// controller/getAllImages.js

const starImagesSchema = require("../models/starImagesSchema");

async function getAllImages(req, res) {
    try {
        const getImages = await starImagesSchema.find();
        res.status(200).json(getImages);
    } catch(error) {
        console.error('getAllImages', error);
        res.status(500).json({ message: 'Internal Server Error in getAllImages' });
    }
}

module.exports = getAllImages;
