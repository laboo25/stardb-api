const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const starImagesSchema = new Schema({
    starname: {
        type: Schema.Types.ObjectId,
        ref: 'starCollection',
        required: true
    },
    starImages: [{
        imageurl: { type: String, required: true },
        imageThumb: { type: String },
        tags: [{ type: String }]
    }],
});

module.exports = mongoose.model('starImage', starImagesSchema);

