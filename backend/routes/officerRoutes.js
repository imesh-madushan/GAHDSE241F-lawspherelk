const express = require("express");
const router = express.Router();
const { getAll, searchOfficers } = require("../controllers/officerController");

router.post("/getAll", getAll);
router.post("/search", searchOfficers);

module.exports = router;


