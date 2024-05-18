// routes/index.js

const express = require('express')
const router = express.Router();
const starRouter = require('./api/index')

router.use('/stars', starRouter)

module.exports = router