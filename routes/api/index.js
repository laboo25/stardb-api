// routes/api/index.js

const express = require('express')
const router = express.Router();
const createStarRoute = require('./createStarRoute')
const starBioRoute = require('./starBioRoute')
const createStarImagesRoute = require('./createStarImagesRoute')
const albumRoute = require('./albumRoute')


router.use('/create-star', createStarRoute)
router.use('/star-bio', starBioRoute)
router.use('/images', createStarImagesRoute)
router.use('/albums', albumRoute)
module.exports = router