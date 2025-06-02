const express = require("express");
const router = express.Router();
const { getAll, searchOfficers, getOfficerById, toggleOfficerAccount, updateOfficer } = require("../controllers/officerController");

router.post("/getAll", getAll);
router.post("/search", searchOfficers);
router.patch("/toggleaccountstatus", toggleOfficerAccount);
router.put("/update", updateOfficer);
router.get("/:id", getOfficerById);
module.exports = router;


