const albumsSchema = require('../models/albumsSchema');

async function getAllAlbums(req, res) {
    console.log('getAllAlbums');
    try {
        // Retrieve all albums from the database
        const albums = await albumsSchema.find();
        res.status(200).json(albums);
    } catch (error) {
        console.error('Error in getAllAlbums:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = getAllAlbums;
