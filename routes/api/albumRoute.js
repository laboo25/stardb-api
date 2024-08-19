const express = require('express');
const router = express.Router();
const upload = require('../../helper/multerHelpers');
const createAlbumController = require('../../controller/createAlbumController');
const updateAlbumController = require('../../controller/updateAlbumController');
const getAllAlbums = require('../../controller/getAllAlbums');
const deleteAlbumController = require('../../controller/deleteAlbumController');


router.post('/create-album', upload.array('albums', 999), createAlbumController);
router.put('/update/:albumId', upload.array('albumimages', 999), updateAlbumController);
// router.delete('/delete-album/:albumId', deleteAlbumController);
router.delete('/delete-album/:albumId/:imageId?', deleteAlbumController);
router.get('/get-all-albums', getAllAlbums);

module.exports = router;
