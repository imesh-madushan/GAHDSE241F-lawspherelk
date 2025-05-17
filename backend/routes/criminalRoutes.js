const express = require('express');
const router = express.Router();
const { getAllCriminals, getCriminalById, createCriminal, updateCriminal, deleteCriminal, searchCriminals } = require('../controllers/criminalController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Get all criminals
router.get('/getAllCriminals', getAllCriminals);

// Search criminals
router.get('/search', searchCriminals);

// Get single criminal by ID
router.get('/:id', getCriminalById);

// Create new criminal record
router.post('/', createCriminal);

// Update criminal record
router.put('/:id', updateCriminal);

// Delete criminal record
router.delete('/:id', deleteCriminal);


module.exports = router; 