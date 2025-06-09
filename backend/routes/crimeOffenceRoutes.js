const express = require("express");
const router = express.Router();
const {
  getAllOffences,
  searchOffences,
  createOffence,
  getOffenceById,
  updateOffence,
  linkEvidence,
  addVictim,
} = require("../controllers/crimeOffenceController");

router.get("/getAllOffences", getAllOffences);
router.get("/search", searchOffences);
router.post("/create", createOffence);
router.put("/update", updateOffence);
router.post("/linkEvidence", linkEvidence);
router.post("/addVictim", addVictim);
router.get("/:id", getOffenceById);


module.exports = router;
