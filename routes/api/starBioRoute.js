// routes/api/starBioRoute.js

const express = require('express');
const createStarBioController = require('../../controller/createStarBioController');
const { deleteStarBioController, updateStarBioController } = require('../../controller/modifyStarBio');
const getAllBio = require('../../controller/getAllBio');
const router = express.Router();


router.post('/create-star-bio', createStarBioController);
router.delete('/delete-bio/:starBioId', deleteStarBioController)
router.put('/update-bio/:starBioId', updateStarBioController)
router.get('/get-all-bio', getAllBio)

module.exports = router