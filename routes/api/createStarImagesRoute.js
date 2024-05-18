// routes/api/starBioRoute.js

const express = require('express');
const router = express.Router();
const upload = require('../../helper/multerHelpers')
const createStarBioController = require('../../controller/createStarImagesController')

router.post('/create-star-images', upload.array('images', 100), createStarBioController);

module.exports = router