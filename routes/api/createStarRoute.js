// routes/api/createStarRoute.js

const express = require('express');
const router = express.Router();
const upload = require('../../helper/multerHelpers');
const createStarController = require('../../controller/createStarController');
const getAllStar = require('../../controller/getAllStar');
const { updateStarController, deleteStarController } = require('../../controller/modifyStarController');

// Define the fields to accept in the request
const uploadFields = [
    { name: 'starprofile', maxCount: 1 },
    { name: 'starcover', maxCount: 1 }
];

// Use the correct field names in upload.fields()
router.post('/create-new-star', upload.fields(uploadFields), createStarController);
router.delete('/delete-star', deleteStarController)
router.put('/update-star', updateStarController)
router.get('/get-all-star', getAllStar)

module.exports = router;
