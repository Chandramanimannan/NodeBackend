const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  signup,
  getUsers,
  updateUser,
  userDetails,
} = require("../controllers/userscontroller");

const router = express.Router();

// Define user routes
router.post("/signup", signup);
router.get("/signup", verifyToken, getUsers);
router.patch("/updateUser", verifyToken, updateUser);
router.get("/userdetails", verifyToken, userDetails);

module.exports = router;
