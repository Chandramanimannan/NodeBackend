const express = require("express");
const {
  successPercentageToday,
  successAmountToday,
  transactionCountToday,
  weeklySuccessVsFailed,
  weeklyTransactionAmount,
  weeklyTransactionCount,
  weeklyCardComparison,
  weeklyTop4Countries,
  weeklySuccessMetrics,
  monthlyTransactionMetrics,
  last6Months,
} = require("../controllers/newdashboard");

const router = express.Router();

router.get("/dashboardcards/card1", successPercentageToday);
router.get("/dashboardcards/card2", successAmountToday);
router.get("/dashboardcards/card3", transactionCountToday);
router.get("/dashboardcards/card4", weeklySuccessVsFailed);
router.get("/dashboardcards/card5", weeklyTransactionAmount);
router.get("/dashboardcards/card6", weeklyTransactionCount);
router.get("/dashboardcards/card7", weeklyCardComparison);
router.get("/dashboardcards/card8", weeklyTop4Countries);
router.get("/dashboardcards/card9", weeklySuccessMetrics);
router.get("/dashboardcards/card10", monthlyTransactionMetrics);
router.get("/dashboardcards/card11", last6Months);

module.exports = router;
