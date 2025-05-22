const express = require("express");
const router = express.Router();
const { getAll, searchOfficers, getOfficerById, toggleOfficerAccount } = require("../controllers/officerController");

router.post("/getAll", getAll);
router.post("/search", searchOfficers);
router.get("/:id", getOfficerById);
router.patch("/toggleaccountstatus", toggleOfficerAccount);
module.exports = router;


