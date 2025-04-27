const express = require("express");
const router = express.Router();
const { getAllCases } = require("../controllers/caseController")

router.get("/getAllCases", getAllCases);

module.exports = router;
