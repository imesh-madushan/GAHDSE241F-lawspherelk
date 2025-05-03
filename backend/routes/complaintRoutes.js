const express = require("express");
const router = express.Router();
const { getAllComplaints, getComplaintById } = require("../controllers/complainController")

router.get("/getAllComplaints", getAllComplaints);
router.get("/:id", getComplaintById);

module.exports = router;

