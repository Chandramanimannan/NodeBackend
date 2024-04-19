const express = require("express");
const {
  createTransactiontable,
  getTransactiontable,
  quickSearch,
} = require("../controllers/transactiontablescontroller");

const router = express.Router();

// Define user routes
router.post("/transactiontables", createTransactiontable);
router.get("/transactiontables", getTransactiontable);
router.get("/transactiontables/quicksearch", quickSearch);

module.exports = router;
