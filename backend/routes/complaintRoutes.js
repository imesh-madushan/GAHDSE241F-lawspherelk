const express = require("express");
const router = express.Router();
const { getAllComplaints, getComplaintById, searchComplaints, createComplaint, closeComplaint } = require("../controllers/complainController")

router.get("/getAllComplaints", getAllComplaints);
router.get("/search", searchComplaints);
router.post("/create", createComplaint);
router.patch("/close", closeComplaint);
router.get("/:id", getComplaintById);

module.exports = router;

