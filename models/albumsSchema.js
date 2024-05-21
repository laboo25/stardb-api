const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const albumsSchema = new Schema({
    albumname: { type: String },
    albumimages: [{
        imageurl: { type: String },
        thumburl: { type: String },
        tags: [{ type: String }]
    }],
    starname: {
        type: Schema.Types.ObjectId,
        ref: 'starList',  // Ensure this references the correct model
        required: true
    }
});

module.exports = mongoose.model('starAlbum', albumsSchema);
