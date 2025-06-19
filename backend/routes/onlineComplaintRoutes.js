const express = require("express");
const router = express.Router();
const { createOnlineComplaint } = require("../controllers/onlineComplaintController");

// Route to submit an online complaint
router.post("/create", createOnlineComplaint);

module.exports = router;
