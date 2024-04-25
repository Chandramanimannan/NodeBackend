const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  createRatetable,
  getRatetable,
  getRates,
  updateRatetable
} = require("../controllers/ratetablescontroller");

const router = express.Router();

// Define user routes
router.post("/ratetables", verifyToken, createRatetable);
router.get("/ratetables", verifyToken, getRatetable);
router.get("/getrates", verifyToken, getRates);
router.post("/updateratetables", verifyToken, updateRatetable);

module.exports = router;
