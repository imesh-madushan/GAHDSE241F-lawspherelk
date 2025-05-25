const express = require("express");
const router = express.Router();
const { getAllCases, getCaseById, searchCases } = require("../controllers/caseController");


router.get("/getAllCases", getAllCases);
router.get("/search", searchCases);
router.get("/:id", getCaseById);

module.exports = router;
