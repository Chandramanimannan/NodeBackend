const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const {
  searchTransactionReport,
  quickSearch,
  multiTransactions,
  transactionsToday,
  transactionsYesterday,
  transactionsLast7Days,
  transactionsLast15Days,
  transactionsLast30Days,
  transactionsLastYear,
} = require("../controllers/reportscontroller");

const router = express.Router();

// Define user routes
router.post("/transactionreport", verifyToken, searchTransactionReport);
router.get("/transactionreport", verifyToken, quickSearch);
router.post("/multisearch", verifyToken, multiTransactions);
router.get("/reporttoday", verifyToken, transactionsToday);
router.get("/reportyesterday", verifyToken, transactionsYesterday);
router.get("/reportlast7days", verifyToken, transactionsLast7Days);
router.get("/reportlast15days", verifyToken, transactionsLast15Days);
router.get("/reportlast30days", verifyToken, transactionsLast30Days);
router.get("/reportlastyear", verifyToken, transactionsLastYear);

module.exports = router;
