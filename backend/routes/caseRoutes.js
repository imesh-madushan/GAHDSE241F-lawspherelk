const express = require("express");
const router = express.Router();
const { getAllCases, getCaseById, searchCases, createCase } = require("../controllers/caseController");


router.get("/getAllCases", getAllCases);
router.get("/search", searchCases);
router.post("/create", createCase);
router.get("/:id", getCaseById);

module.exports = router;
