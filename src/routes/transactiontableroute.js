const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  createTransactiontable,
  getTransactiontable,
  quickSearch,
} = require("../controllers/transactiontablescontroller");

const router = express.Router();

// Define user routes
router.post("/transactiontables", verifyToken, createTransactiontable);
router.get("/transactiontables", verifyToken, getTransactiontable);
router.get("/transactiontables/quicksearch", verifyToken, quickSearch);

module.exports = router;
