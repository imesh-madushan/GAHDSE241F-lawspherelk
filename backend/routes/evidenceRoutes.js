const express = require("express");
const router = express.Router();
const {
  getAllEvidence,
  searchEvidence,
  createEvidence,
  updateEvidence,
  getEvidenceById,
  uploadAttachment,
  getAttachment,
} = require("../controllers/evidenceController");

router.get("/getAllEvidence", getAllEvidence);
router.get("/search", searchEvidence);
router.post("/create", createEvidence);
router.put("/update", updateEvidence);
router.post("/attachments/upload", uploadAttachment);
router.get("/attachments/:attachmentId", getAttachment);
router.get("/:id", getEvidenceById);

module.exports = router;
