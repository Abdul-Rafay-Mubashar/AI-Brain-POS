// routes/authRoute.js
const express = require("express");
const router = express.Router();

const auth = require("../controllers/authController");
const protect = require("../middleware/authmiddleware");

router.post("/signup", auth.signup);
router.post("/login", auth.login);
router.get("/me", protect, auth.getMe);
router.post("/verify-password", protect,auth.verifyPassword);
router.post("/verify-password-signup", auth.verifyPasswordSignUp);
router.post("/add-faceid", protect, auth.addFaceId);
router.post("/faceid-login", auth.faceLogin);



module.exports = router;