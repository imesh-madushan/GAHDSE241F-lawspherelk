const express = require('express');
const router = express.Router();
const { getAllCriminals, getCriminalById, createCriminal, updateCriminal, searchCriminals } = require('../controllers/criminalController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/getAllCriminals', getAllCriminals);
router.get('/search', searchCriminals);
router.post('/create', createCriminal);
router.put('/update', updateCriminal);
router.get('/:id', getCriminalById);

module.exports = router;