const starBioSchema = require('../models/starBioSchema');

async function getAllBio(req, res) {
    try {
        // Retrieve all star bios from the database
        const allStarBios = await starBioSchema.find();

        res.status(200).json(allStarBios); // Respond with the array of all star bios
    } catch (error) {
        console.error('Error in getAllBio:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = getAllBio;
