const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/verifyToken");

const {
  AdminsuccessPercentageToday,
  AdminweeklyStats,
  AdminweeklyCardComparison,
  AdminweeklyTop4Countries,
  Adminsuccesslast6Months,
  AdminmonthlyTransactionMetrics,
} = require("../controllers/admindashboardcontroller");

const {
  DummysuccessPercentageToday,
  DummyweeklyStats,
  DummyweeklyCardComparison,
  DummyweeklyTop4Countries,
  Dummysuccesslast6Months,
  DummymonthlyTransactionMetrics,
} = require("../controllers/dummydashboardcontroller");

const handleDashboardRequest = (req, res, next) => {
  const userRole = req.user.role;

  const controllers = {
    admin: {
      todaystats: AdminsuccessPercentageToday,
      weeklystats: AdminweeklyStats,
      cardcomparison: AdminweeklyCardComparison,
      weeklyTop4Countries: AdminweeklyTop4Countries,
      successlast6Months: Adminsuccesslast6Months,
      monthlyTransactionMetrics: AdminmonthlyTransactionMetrics,
    },
    user: {
      todaystats: DummysuccessPercentageToday,
      weeklystats: DummyweeklyStats,
      cardcomparison: DummyweeklyCardComparison,
      weeklyTop4Countries: DummyweeklyTop4Countries,
      successlast6Months: Dummysuccesslast6Months,
      monthlyTransactionMetrics: DummymonthlyTransactionMetrics,
    },
  };

  const controller = controllers[userRole][req.path.split("/")[2]];
  console.log(controller);
  if (controller) {
    return controller(req, res, next);
  } else {
    return res.status(403).json({ error: "Role not supported" });
  }
};

router.get("/dashboard/todaystats", verifyToken, handleDashboardRequest);
router.get("/dashboard/weeklystats", verifyToken, handleDashboardRequest);
router.get("/dashboard/cardcomparison", verifyToken, handleDashboardRequest);
router.get(
  "/dashboard/weeklyTop4Countries",
  verifyToken,
  handleDashboardRequest
);
router.get(
  "/dashboard/successlast6Months",
  verifyToken,
  handleDashboardRequest
);
router.get(
  "/dashboard/monthlyTransactionMetrics",
  verifyToken,
  handleDashboardRequest
);

module.exports = router;
