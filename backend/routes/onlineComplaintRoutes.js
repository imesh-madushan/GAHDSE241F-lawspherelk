const express = require("express");
const router = express.Router();
const {
  createOnlineComplaint,
  createOnlineComplaintWithFileUpload,
  viewOnlineComplaint,
} = require("../controllers/onlineComplaintController");

// Route to submit an online complaint with file upload support (same as evidence system)
router.post("/create", createOnlineComplaintWithFileUpload);
router.get("/view/:id", viewOnlineComplaint);

module.exports = router;
