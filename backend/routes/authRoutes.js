const express = require("express");
const router = express.Router();
const { login, validateCookies } = require("../controllers/authController");

router.post("/login", login);
// router.post("/register", register);
router.get("/checkAuth", validateCookies);
// router.get("/logout", logout);

module.exports = router;


