const express = require('express');
const router = express.Router();
const { getAllOffences, searchOffences } = require('../controllers/crimeOffenceController');

router.get('/getAllOffences', getAllOffences);
router.get('/search', searchOffences);

module.exports = router;