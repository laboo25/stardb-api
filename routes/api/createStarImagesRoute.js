const express = require('express');
const router = express.Router();
const upload = require('../../helper/multerHelpers');
const createStarImagesController = require('../../controller/createStarImagesController');
const getAllImages = require('../../controller/getAllImages');
const deleteImageController = require('../../controller/deleteImageController');

router.post('/create-star-images', upload.array('images', 100), createStarImagesController);
router.put('/update/:starImageId')
router.get('/get-all-images', getAllImages);
router.delete('/delete-star-image/:starImageId/:imageId', deleteImageController);


module.exports = router;
