const express = require("express");
const router = express.Router();
const {
  getAllAuditLogs,
  searchAuditLogs,
} = require("../controllers/auditController");

// Get all audit logs (optionally filtered by batch ID)
router.get("/logs", getAllAuditLogs);

// Search audit logs by batch ID or value
router.get("/search", searchAuditLogs);

module.exports = router;
