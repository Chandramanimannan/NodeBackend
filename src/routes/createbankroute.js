const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  createBank,
  getBank,
  searchBank,
  deleteBank,
  updateBank,
} = require("../controllers/createbankscontroller");

const router = express.Router();

router.post("/mastersettings/bank", verifyToken, createBank);
router.get("/mastersettings/bank", verifyToken, getBank);
router.post("/mastersettings/searchbank", verifyToken, searchBank);
router.delete("/mastersettings/deletebank", verifyToken, deleteBank);
router.put("/mastersettings/updatebank", verifyToken, updateBank);

module.exports = router;
