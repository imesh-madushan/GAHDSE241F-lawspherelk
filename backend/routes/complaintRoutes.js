const express = require("express");
const router = express.Router();
const { getAllComplaints } = require("../controllers/complainController")

router.get("/getAllComplaints", getAllComplaints);

module.exports = router;

