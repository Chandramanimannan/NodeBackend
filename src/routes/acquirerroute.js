const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  createAcquirer,
  getAcquirer,
} = require("../controllers/acquirerscontroller");

const router = express.Router();

// Define user routes
router.post("/acquirers", verifyToken, createAcquirer);
router.get("/acquirers", verifyToken, getAcquirer);

module.exports = router;
