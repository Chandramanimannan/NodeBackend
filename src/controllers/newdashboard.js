require("../config/database");
const LiveTransactionTable = require("../models/LiveTransactionTable");

const successPercentageToday = async (req, res) => {
  try {
    const currentDate = new Date();
    console.log(currentDate);

    const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
      "0" +
      (currentDate.getMonth() + 1)
    ).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;

    const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
      "0" +
      (currentDate.getMonth() + 1)
    ).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;
    console.log(fromDate);
    console.log(toDate);
    const successfulTransactions = await LiveTransactionTable.countDocuments({
      transactiondate: {
        $gte: fromDate,
        $lte: toDate,
      },
      Status: "Success",
    });
    console.log("success", successfulTransactions);
    const totalTransactions = await LiveTransactionTable.countDocuments({
      transactiondate: {
        $gte: fromDate,
        $lte: toDate,
      },
    });
    console.log("total", totalTransactions);
    let successPercentage;
    if (totalTransactions === 0) {
      successPercentage = 0;
    } else {
      successPercentage = (successfulTransactions / totalTransactions) * 100;
    }

    res.status(200).json({
      successPercentage: successPercentage.toFixed(2),
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const successAmountToday = async (req, res) => {
  try {
    const currentDate = new Date();

    const fromDate = `${currentDate.getFullYear()}-${(
      "0" +
      (currentDate.getMonth() + 1)
    ).slice(-2)}-${("0" + currentDate.getDate()).slice(-2)} 00:00:00`;

    const toDate = `${currentDate.getFullYear()}-${(
      "0" +
      (currentDate.getMonth() + 1)
    ).slice(-2)}-${("0" + currentDate.getDate()).slice(-2)} 23:59:59`;

    const successAmounts = await LiveTransactionTable.aggregate([
      {
        $match: {
          transactiondate: {
            $gte: fromDate,
            $lte: toDate,
          },
          Status: "Success",
        },
      },
      {
        $group: {
          _id: null,
          successAmount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          successAmount: 1,
        },
      },
    ]);

    res.status(200).json(successAmounts);
  } catch (error) {
    console.error("Error calculating success amount:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const transactionCountToday = async (req, res) => {
  try {
    // Get current date
    const currentDate = new Date();

    // Format fromDate
    const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
      "0" +
      (currentDate.getMonth() + 1)
    ).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;

    // Format toDate
    const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
      "0" +
      (currentDate.getMonth() + 1)
    ).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

    // Calculate total number of transactions for the day
    const totalTransactions = await LiveTransactionTable.countDocuments({
      transactiondate: {
        $gte: fromDate,
        $lte: toDate,
      },
    });

    res.status(200).json({ totalTransactions });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const weeklySuccessVsFailed = async (req, res) => {
  try {
    const currentDate = new Date();
    const results = [];

    for (let i = 0; i < 7; i++) {
      const countsForDay = [];
      const dayDate = new Date();
      dayDate.setDate(currentDate.getDate() - i);

      const fromDate = `${("0" + dayDate.getDate()).slice(-2)}/${(
        "0" +
        (dayDate.getMonth() + 1)
      ).slice(-2)}/${dayDate.getFullYear()} 00:00:00`;
      const toDate = `${("0" + dayDate.getDate()).slice(-2)}/${(
        "0" +
        (dayDate.getMonth() + 1)
      ).slice(-2)}/${dayDate.getFullYear()} 23:59:59`;

      const successCount = await LiveTransactionTable.countDocuments({
        transactiondate: {
          $gte: fromDate,
          $lt: toDate,
        },
        Status: "Success",
      });

      const failedCount = await LiveTransactionTable.countDocuments({
        transactiondate: {
          $gte: fromDate,
          $lt: toDate,
        },
        Status: "Failed",
      });

      countsForDay.push({
        date: dayDate.toISOString().split("T")[0],
        successCount,
        failedCount,
      });

      results.push(countsForDay);
    }
    res.status(200).json({ results });
  } catch (error) {
    console.error("Error calculating past seven days counts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const weeklyTransactionAmount = async (req, res) => {
  try {
    let successThisWeek = 0;
    let failedThisWeek = 0;

    for (let i = 0; i <= 6; i++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - i);

      const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
        "0" +
        (currentDate.getMonth() + 1)
      ).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;
      const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
        "0" +
        (currentDate.getMonth() + 1)
      ).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

      const successTransactions = await LiveTransactionTable.find({
        transactiondate: {
          $gte: fromDate,
          $lt: toDate,
        },
        Status: "Success",
      });
      successTransactions.forEach((txn) => {
        successThisWeek += txn.amount;
      });

      const failedTransactions = await LiveTransactionTable.find({
        transactiondate: {
          $gte: fromDate,
          $lt: toDate,
        },
        Status: "Failed",
      });
      failedTransactions.forEach((txn) => {
        failedThisWeek += txn.amount;
      });
    }

    const totalThisWeek = successThisWeek + failedThisWeek;

    res.status(200).json({ successThisWeek, failedThisWeek, totalThisWeek });
  } catch (error) {
    console.error("Error calculating transaction amounts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const weeklyTransactionCount = async (req, res) => {
  try {
    const transactionCounts = {};

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - i);

      const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
        "0" +
        (currentDate.getMonth() + 1)
      ).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;
      const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
        "0" +
        (currentDate.getMonth() + 1)
      ).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

      const transactionCount = await LiveTransactionTable.countDocuments({
        transactiondate: {
          $gte: fromDate,
          $lte: toDate,
        },
      });

      transactionCounts[currentDate.toLocaleDateString("en-US")] =
        transactionCount;
    }

    const totalThisWeek = Object.values(transactionCounts).reduce(
      (total, count) => total + count,
      0
    );

    res.status(200).json({ ...transactionCounts, totalThisWeek });
  } catch (error) {
    console.error("Error calculating transaction counts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const weeklyCardComparison = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentWeekStartDate = new Date(currentDate);
    currentWeekStartDate.setDate(currentDate.getDate() - 6);

    const currentWeekEndDate = new Date(currentDate);

    const previousWeekStartDate = new Date(currentWeekStartDate);
    previousWeekStartDate.setDate(previousWeekStartDate.getDate() - 7);
    const previousWeekEndDate = new Date(previousWeekStartDate);
    previousWeekEndDate.setDate(previousWeekEndDate.getDate() + 6);

    const formattedCurrentWeekStartDate = `${(
      "0" + currentWeekStartDate.getDate()
    ).slice(-2)}/${("0" + (currentWeekStartDate.getMonth() + 1)).slice(
      -2
    )}/${currentWeekStartDate.getFullYear()} 00:00:00`;
    const formattedCurrentWeekEndDate = `${(
      "0" + currentWeekEndDate.getDate()
    ).slice(-2)}/${("0" + (currentWeekEndDate.getMonth() + 1)).slice(
      -2
    )}/${currentWeekEndDate.getFullYear()} 23:59:59`;

    const formattedPreviousWeekStartDate = `${(
      "0" + previousWeekStartDate.getDate()
    ).slice(-2)}/${("0" + (previousWeekStartDate.getMonth() + 1)).slice(
      -2
    )}/${previousWeekStartDate.getFullYear()} 00:00:00`;
    const formattedPreviousWeekEndDate = `${(
      "0" + previousWeekEndDate.getDate()
    ).slice(-2)}/${("0" + (previousWeekEndDate.getMonth() + 1)).slice(
      -2
    )}/${previousWeekEndDate.getFullYear()} 23:59:59`;

    const currentWeekVisaTransactions = await LiveTransactionTable.find({
      transactiondate: {
        $gte: formattedCurrentWeekStartDate,
        $lte: formattedCurrentWeekEndDate,
      },
      cardtype: "Visa",
    });

    const previousWeekVisaTransactions = await LiveTransactionTable.find({
      transactiondate: {
        $gte: formattedPreviousWeekStartDate,
        $lte: formattedPreviousWeekEndDate,
      },
      cardtype: "Visa",
    });

    const currentWeekMastercardTransactions = await LiveTransactionTable.find({
      transactiondate: {
        $gte: formattedCurrentWeekStartDate,
        $lte: formattedCurrentWeekEndDate,
      },
      cardtype: "Mastercard",
    });

    const previousWeekMastercardTransactions = await LiveTransactionTable.find({
      transactiondate: {
        $gte: formattedPreviousWeekStartDate,
        $lte: formattedPreviousWeekEndDate,
      },
      cardtype: "Mastercard",
    });

    const currentWeekVisaAmount = currentWeekVisaTransactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );
    const previousWeekVisaAmount = previousWeekVisaTransactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );

    const currentWeekMastercardAmount =
      currentWeekMastercardTransactions.reduce(
        (total, transaction) => total + transaction.amount,
        0
      );
    const previousWeekMastercardAmount =
      previousWeekMastercardTransactions.reduce(
        (total, transaction) => total + transaction.amount,
        0
      );

    const visaDifference = currentWeekVisaAmount - previousWeekVisaAmount;
    const mastercardDifference =
      currentWeekMastercardAmount - previousWeekMastercardAmount;

    res.status(200).json({ visaDifference, mastercardDifference });
  } catch (error) {
    console.error("Error calculating card transaction difference:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const weeklyTop4Countries = async (req, res) => {
  try {
    const countryStats = {};

    const today = new Date();
    const fromWeekDate = new Date(today);
    fromWeekDate.setDate(today.getDate() - 6);
    const toWeekDate = new Date(today);

    const formattedFromWeekDate = `${("0" + fromWeekDate.getDate()).slice(
      -2
    )}/${("0" + (fromWeekDate.getMonth() + 1)).slice(
      -2
    )}/${fromWeekDate.getFullYear()} 00:00:00`;
    const formattedToWeekDate = `${("0" + toWeekDate.getDate()).slice(-2)}/${(
      "0" +
      (toWeekDate.getMonth() + 1)
    ).slice(-2)}/${toWeekDate.getFullYear()} 23:59:59`;

    const transactionsCurrentWeek = await LiveTransactionTable.find({
      transactiondate: {
        $gte: formattedFromWeekDate,
        $lte: formattedToWeekDate,
      },
    });

    transactionsCurrentWeek.forEach((transaction) => {
      const country = transaction.country;

      if (!countryStats[country]) {
        countryStats[country] = {
          transactionCount: 0,
          totalAmount: 0,
        };
      }

      countryStats[country].transactionCount++;
      countryStats[country].totalAmount += transaction.amount;
    });

    const sortedCountries = Object.keys(countryStats).sort((a, b) => {
      return countryStats[b].totalAmount - countryStats[a].totalAmount;
    });

    const top4Countries = sortedCountries.slice(0, 4);
    const sumOfAmounts = top4Countries.reduce((sum, country) => {
      return sum + countryStats[country].totalAmount;
    }, 0);

    const results = top4Countries.map((country) => ({
      country: country,
      transactionCount: countryStats[country].transactionCount,
      totalAmount: countryStats[country].totalAmount,
    }));

    res.status(200).json({
      topCountries: results,
      sumOfAmounts: sumOfAmounts,
    });
  } catch (error) {
    console.error("Error calculating top 4 country stats for the week:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const weeklySuccessMetrics = async (req, res) => {
  try {
    const results = {};

    const currentWeekSuccessCounts = {};
    const previousWeekSuccessCounts = {};

    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date();
      currentDate.setDate(today.getDate() - i);

      const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
        "0" +
        (currentDate.getMonth() + 1)
      ).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;
      const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
        "0" +
        (currentDate.getMonth() + 1)
      ).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

      const successCount = await LiveTransactionTable.countDocuments({
        transactiondate: {
          $gte: fromDate,
          $lte: toDate,
        },
        Status: "Success",
      });
      currentWeekSuccessCounts[currentDate.toLocaleDateString("en-US")] =
        successCount;
    }

    for (let i = 7; i < 14; i++) {
      const currentDate = new Date();
      currentDate.setDate(today.getDate() - i);

      const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
        "0" +
        (currentDate.getMonth() + 1)
      ).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;
      const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
        "0" +
        (currentDate.getMonth() + 1)
      ).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

      const successCount = await LiveTransactionTable.countDocuments({
        transactiondate: {
          $gte: fromDate,
          $lte: toDate,
        },
        Status: "Success",
      });
      previousWeekSuccessCounts[currentDate.toLocaleDateString("en-US")] =
        successCount;
    }

    const totalCurrentWeekSuccessCount = Object.values(
      currentWeekSuccessCounts
    ).reduce((total, count) => total + count, 0);
    const totalPreviousWeekSuccessCount = Object.values(
      previousWeekSuccessCounts
    ).reduce((total, count) => total + count, 0);

    let percentageChange;
    if (totalPreviousWeekSuccessCount !== 0) {
      percentageChange =
        ((totalCurrentWeekSuccessCount - totalPreviousWeekSuccessCount) /
          (totalPreviousWeekSuccessCount + totalCurrentWeekSuccessCount)) *
        100;
    } else {
      percentageChange = 100;
    }

    results["currentWeekSuccessCounts"] = currentWeekSuccessCounts;
    results["percentageChange"] = percentageChange;

    res.status(200).json({ results });
  } catch (error) {
    console.error("Error calculating weekly success percentage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const last6Months = async (req, res) => {
  try {
    const today = new Date();
    let sixMonthsAgo = new Date(
      today.getFullYear(),
      today.getMonth() - 5,
      today.getDate()
    );

    while (sixMonthsAgo.getMonth() < 0) {
      sixMonthsAgo.setFullYear(sixMonthsAgo.getFullYear() - 1);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() + 12);
    }

    const salesByMonth = [];
    let totalSalesAmountAllMonths = 0;

    for (let i = 0; i < 6; i++) {
      const fromDate = `${("0" + sixMonthsAgo.getDate()).slice(-2)}/${(
        "0" +
        (sixMonthsAgo.getMonth() + 1)
      ).slice(-2)}/${sixMonthsAgo.getFullYear()} 00:00:00`;
      const nextMonthDate = `${("0" + sixMonthsAgo.getDate()).slice(-2)}/${(
        "0" +
        (sixMonthsAgo.getMonth() + 2)
      ).slice(-2)}/${sixMonthsAgo.getFullYear()} 23:59:59`;

      const sales = await LiveTransactionTable.find({
        transactiondate: {
          $gte: fromDate,
          $lt: nextMonthDate,
        },
      });

      let totalSalesAmount = 0;
      for (const sale of sales) {
        totalSalesAmount += sale.amount;
        totalSalesAmountAllMonths += sale.amount;
      }

      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      salesByMonth.push({
        month: `${
          monthNames[sixMonthsAgo.getMonth()]
        } ${sixMonthsAgo.getFullYear()}`,
        totalSalesAmount,
      });

      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() + 1);
    }

    res.status(200).json({ salesByMonth, totalSalesAmountAllMonths });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const monthlyTransactionMetrics = async (req, res) => {
  try {
    let numTransactions = 0;
    let numSuccessfulTransactions = 0;
    let totalAmountTransactions = 0;
    let totalAmountSuccessfulTransactions = 0;

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const firstDayOfPreviousMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );

    const lastDayOfPreviousMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    );

    const fromDate = `${("0" + firstDayOfMonth.getDate()).slice(-2)}/${(
      "0" +
      (firstDayOfMonth.getMonth() + 1)
    ).slice(-2)}/${firstDayOfMonth.getFullYear()} 00:00:00`;
    const toDate = `${("0" + today.getDate()).slice(-2)}/${(
      "0" +
      (today.getMonth() + 1)
    ).slice(-2)}/${today.getFullYear()} 23:59:59`;
    const fromDatePreviousMonth = `${(
      "0" + firstDayOfPreviousMonth.getDate()
    ).slice(-2)}/${("0" + (firstDayOfPreviousMonth.getMonth() + 1)).slice(
      -2
    )}/${firstDayOfPreviousMonth.getFullYear()} 00:00:00`;
    const toDatePreviousMonth = `${(
      "0" + lastDayOfPreviousMonth.getDate()
    ).slice(-2)}/${("0" + (lastDayOfPreviousMonth.getMonth() + 1)).slice(
      -2
    )}/${lastDayOfPreviousMonth.getFullYear()} 23:59:59`;

    const successfulTransactionsThisMonth = await LiveTransactionTable.find({
      transactiondate: { $gte: fromDate, $lt: toDate },
      Status: "Success",
    });

    const successfulTransactionsPreviousMonth = await LiveTransactionTable.find(
      {
        transactiondate: {
          $gte: fromDatePreviousMonth,
          $lt: toDatePreviousMonth,
        },
        Status: "Success",
      }
    );

    const allTransactions = await LiveTransactionTable.find({
      transactiondate: { $gte: fromDate, $lt: toDate },
    });

    numTransactions += allTransactions.length;
    totalAmountTransactions += allTransactions.reduce(
      (acc, txn) => acc + txn.amount,
      0
    );

    numSuccessfulTransactions += successfulTransactionsThisMonth.length;
    totalAmountSuccessfulTransactions += successfulTransactionsThisMonth.reduce(
      (acc, txn) => acc + txn.amount,
      0
    );

    const numSuccessfulTransactionsPreviousMonth =
      successfulTransactionsPreviousMonth.length;
    const totalAmountSuccessfulTransactionsPreviousMonth =
      successfulTransactionsPreviousMonth.reduce(
        (acc, txn) => acc + txn.amount,
        0
      );

    const growthPercentage =
      ((numSuccessfulTransactions - numSuccessfulTransactionsPreviousMonth) /
        numSuccessfulTransactionsPreviousMonth) *
      100;

    res.json({
      numTransactions,
      numSuccessfulTransactions,
      totalAmountTransactions,
      totalAmountSuccessfulTransactions,
      growthPercentage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
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
};
