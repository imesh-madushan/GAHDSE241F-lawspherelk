const express = require('express');
const router = express.Router();
const { getAllInvestigations, searchInvestigations, createInvestigation, getInvestigationById, updateInvestigation, addOfficerToInvestigation, removeOfficerFromInvestigation } = require('../controllers/investigationController');

router.get('/getAllInvestigations', getAllInvestigations);
router.get('/search', searchInvestigations);
router.post('/create', createInvestigation);
router.put('/update', updateInvestigation);
router.post('/addOfficer', addOfficerToInvestigation);
router.post('/removeOfficer', removeOfficerFromInvestigation);
router.get('/:id', getInvestigationById);


module.exports = router;
