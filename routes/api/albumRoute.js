// routes/api/starBioRoute.js

const express = require('express');
const router = express.Router();
const upload = require('../../helper/multerHelpers');
const createAlbumController = require('../../controller/createAlbumCOntroller');
const { deleteAlbumController, updateAlbumController } = require('../../controller/modifyAlbumController');
const getAllAlbums = require('../../controller/getAllAlbums');

router.post('/create-album', upload.array('albums', 100), createAlbumController);
router.put('/update', updateAlbumController)
router.delete('/delete-album', deleteAlbumController)
router.get('/get-all-albums', getAllAlbums)

module.exports = router