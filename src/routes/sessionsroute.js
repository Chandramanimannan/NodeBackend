const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  login,
  updateUser,
  userDetails,
  sendOTPByEmail,
  resetPassword,
} = require("../controllers/sessionscontroller");

const router = express.Router();

// Define user routes
router.post("/login", login);
router.put("/updateuser", verifyToken, updateUser);
router.get("/userdetails", verifyToken, userDetails);
router.post("/forgotpassword", verifyToken, sendOTPByEmail),
  router.patch("/resetpassword", verifyToken, resetPassword),
  (module.exports = router);
