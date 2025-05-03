const express = require("express");
const router = express.Router();
const { getAll } = require("../controllers/officerController");

router.post("/getAll", getAll);


module.exports = router;


