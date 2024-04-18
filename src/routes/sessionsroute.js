const express = require("express");
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
router.put("/updateuser", updateUser);
router.get("/userdetails", userDetails);
router.post("/forgotpassword", sendOTPByEmail),
  router.patch("/resetpassword", resetPassword),
  (module.exports = router);
