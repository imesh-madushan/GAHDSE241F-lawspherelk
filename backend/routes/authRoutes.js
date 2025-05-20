const express = require("express");
const router = express.Router();
const { login, validateCookies, getProfile, updateProfile } = require("../controllers/authController");

router.post("/login", login);
// router.post("/register", register);
router.get("/checkAuth", validateCookies);
router.get("/me", getProfile);
// router.get("/logout", logout);
router.put("/profile", updateProfile);

module.exports = router;


