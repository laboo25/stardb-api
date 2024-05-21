const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const starBioSchema = new Schema({
    starname: {
        type: Schema.Types.ObjectId,
        ref: 'starList',
        required: true
    },
    aliases: [{ type: String }],
    birthname: { type: String },
    birthplace: { type: String },
    birthdate: { type: Date },
    deathdate: { type: Date },
    occupation: [{ type: String }],
    status: { type: String },
    start: { type: Number },
    end: { type: Number },
    ethnicity: { type: String },
    height: { type: String },
    hair: { type: String },
    eyes: { type: String },
    shoesize: { type: Number },
    measurement: [{
        cup: { type: String },
        bust: { type: Number },
        waist: { type: Number },
        hips: { type: Number }
    }],
    tattoos: { type: String },
    piercings: { type: String },
    skills: [{ type: String }],
    pubic: { type: String },
    boobs: { type: String },
});

module.exports = mongoose.model('starBio', starBioSchema);
