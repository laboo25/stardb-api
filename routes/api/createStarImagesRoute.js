// routes/api/starBioRoute.js

const express = require('express');
const router = express.Router();
const upload = require('../../helper/multerHelpers')
const createStarBioController = require('../../controller/createStarImagesController');
const getAllImages = require('../../controller/getAllImages');

router.post('/create-star-images', upload.array('images', 100), createStarBioController);
router.get('/get-all-images', getAllImages)

module.exports = router