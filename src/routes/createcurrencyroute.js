const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  createCurrency,
  getCurrency,
  searchCurrency,
  deleteCurrency,
  updateCurrency,    
} = require("../controllers/currenciescontroller");

const router = express.Router();

router.post("/mastersettings/currency", verifyToken, createCurrency);
router.get("/mastersettings/currency", verifyToken, getCurrency);
router.post("/mastersettings/searchcurrency", verifyToken, searchCurrency);
router.delete("/mastersettings/deletecurrency", verifyToken, deleteCurrency);
router.put("/mastersettings/updatecurrency", verifyToken, updateCurrency);

module.exports = router;
