const express = require("express");
const router = express.Router();
const { login, validateCookies, getProfile, updateProfile, uploadProfilePhotoMiddleware, uploadProfilePhoto } = require("../controllers/authController");

router.post("/login", login);
// router.post("/register", register);
router.get("/checkAuth", validateCookies);
router.get("/me", getProfile);
// router.get("/logout", logout);
router.put("/profile", updateProfile);
router.post("/profile/photo", uploadProfilePhotoMiddleware, uploadProfilePhoto);

module.exports = router;


