const express = require('express');
const router = express.Router();
const { getAllOffences, searchOffences, createOffence, getOffenceById, updateOffence } = require('../controllers/crimeOffenceController');

router.get('/getAllOffences', getAllOffences);
router.get('/search', searchOffences);
router.post('/create', createOffence);
router.put('/update', updateOffence);
router.get('/:id', getOffenceById);

module.exports = router;