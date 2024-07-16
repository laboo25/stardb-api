// Require the StarBio and StarAlbum models
// const StarBio = require("../models/starBioSchema");
// const StarAlbum = require("../models/albumsSchema");
const newStarSchema = require("../models/newStarSchema");

// Your getAllStar controller function
async function getAllStar(req, res) {
    try {
        // Retrieve all stars from the database with related models populated as arrays
        const allStars = await newStarSchema.find()
            

        res.status(200).json(allStars); // Respond with the array of all stars
    } catch (error) {
        console.error('Error in getAllStar:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = getAllStar;
