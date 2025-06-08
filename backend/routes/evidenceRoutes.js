const express = require('express');
const router = express.Router();
const { getAllEvidence, searchEvidence, createEvidence, updateEvidence, getEvidenceById } = require("../controllers/evidenceController")

router.get("/getAllEvidence", getAllEvidence);
router.get("/search", searchEvidence);
router.post("/create", createEvidence);
router.put("/update", updateEvidence);
router.get("/:id", getEvidenceById);

module.exports = router;

