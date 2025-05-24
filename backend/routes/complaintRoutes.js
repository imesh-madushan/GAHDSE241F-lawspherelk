const express = require("express");
const router = express.Router();
const { getAllComplaints, getComplaintById, searchComplaints } = require("../controllers/complainController")

router.get("/getAllComplaints", getAllComplaints);
router.get("/search", searchComplaints);
router.get("/:id", getComplaintById);

module.exports = router;

