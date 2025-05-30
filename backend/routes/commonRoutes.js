const express = require("express");
const router = express.Router();
const { getAllStatsCount, logAuditTrail } = require("../controllers/commonController")

router.get("/getAllStatsCount", getAllStatsCount);
router.get("/getAuditHistory", logAuditTrail);

module.exports = router;

