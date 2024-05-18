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
    starImages: [{ // Correct the field name
        type: Schema.Types.ObjectId,
        ref: 'starImage'
    }],
    staralbums: [{
        type: Schema.Types.ObjectId,
        ref: 'starAlbum'
    }]
});

module.exports = mongoose.model('starCollection', createStarSchema);
