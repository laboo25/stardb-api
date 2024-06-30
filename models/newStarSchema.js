const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const createStarSchema = new Schema({
    starname: {
        type: String,
        required: true
    },
    starcover: {
        type: String,
    },
    starprofile: {
        type: String,
    },
    starbio: {
        type: Schema.Types.ObjectId,
        ref: 'StarBio'
    },
    starImages: [{
        type: Schema.Types.ObjectId,
        ref: 'starImage'
    }],
    starAlbums: [{
        type: Schema.Types.ObjectId,
        ref: 'starAlbum'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('starList', createStarSchema);
