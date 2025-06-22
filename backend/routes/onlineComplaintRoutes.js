const express = require("express");
const router = express.Router();
const {
  createOnlineComplaint,
  createOnlineComplaintWithFileUpload,
  viewOnlineComplaint,
  getAllOnlineComplaints,
  searchOnlineComplaints,
  getOnlineComplaintById,
  updateOnlineComplaint,
  closeOnlineComplaint,
} = require("../controllers/onlineComplaintController");

// Route to submit an online complaint with file upload support (same as evidence system)
router.post("/create", createOnlineComplaintWithFileUpload);
router.get("/view/:id", viewOnlineComplaint);

// Protected routes - OIC and Crime OIC only
router.get("/getAll", getAllOnlineComplaints);
router.get("/search", searchOnlineComplaints);
router.get("/:complaintId", getOnlineComplaintById);
router.put("/update", updateOnlineComplaint);
router.patch("/close", closeOnlineComplaint);

module.exports = router;
