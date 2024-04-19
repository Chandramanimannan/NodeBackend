const express = require("express");
const {
  successPercentageToday,
  weeklyStats,
  weeklyCardComparison,
  weeklyTop4Countries,
  successlast6Months,
  monthlyTransactionMetrics,
} = require("../controllers/newdashboard");

const router = express.Router();

router.get("/dashboard/todaystats", successPercentageToday);
router.get("/dashboard/weeklystats", weeklyStats);
router.get("/dashboard/cardcomparison", weeklyCardComparison);
router.get("/dashboard/weeklyTop4Countries", weeklyTop4Countries);
router.get("/dashboard/successlast6Months", successlast6Months);
router.get("/dashboard/monthlyTransactionMetrics", monthlyTransactionMetrics);

module.exports = router;
