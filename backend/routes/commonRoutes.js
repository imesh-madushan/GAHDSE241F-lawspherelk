const express = require("express");
const router = express.Router();
const { getAllStatsCount } = require("../controllers/commonController")

router.get("/getAllStatsCount", getAllStatsCount);

module.exports = router;

