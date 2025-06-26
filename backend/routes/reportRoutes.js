const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// Generate case report PDF
router.get("/case/:caseId/pdf", reportController.generateCaseReport);

// Get report generation history for a case
router.get("/case/:caseId/history", reportController.getReportHistory);

module.exports = router;
