const express = require("express");
const router = express.Router();
const { createOnlineComplaint, viewOnlineComplaint, } = require("../controllers/onlineComplaintController");

// Route to submit an online complaint
router.post("/create", createOnlineComplaint);
router.get("/view/:id", viewOnlineComplaint);

module.exports = router;
