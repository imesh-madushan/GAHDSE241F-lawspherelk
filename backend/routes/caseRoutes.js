const express = require("express");
const router = express.Router();
const { getAllCases, getCaseById } = require("../controllers/caseController");

router.get("/getAllCases", getAllCases);
router.get("/:id", getCaseById);

module.exports = router;
