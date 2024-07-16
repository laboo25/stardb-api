const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const albumsSchema = new Schema({
    albumname: { type: String,
        requird: true
    },
    albumimages: [{
        imageurl: { type: String },
        thumburl: { type: String },
        tags: [{ type: String }]
    }],
    starname: [{
        type: Schema.Types.ObjectId,
        ref: 'starList',
        
    }]
});

module.exports = mongoose.model('starAlbum', albumsSchema);
