require("../config/database");
const LiveTransactionTable = require("../models/LiveTransactionTable");

const successPercentageToday = async (req, res) => {
  try {
    const currentDate = new Date();
    const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
      "0" +
      (currentDate.getMonth() + 1)
    ).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;
    const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
      "0" +
      (currentDate.getMonth() + 1)
    ).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

    const transactions = await LiveTransactionTable.find({
      transactiondate: { $gte: fromDate, $lte: toDate },
    });

    const totalTransactions = transactions.length;

    const successfulTransactions = transactions.filter(
      (transaction) => transaction.Status === "Success"
    );

    const successCount = successfulTransactions.length;

    const successPercentage =
      totalTransactions === 0 ? 0 : (successCount / totalTransactions) * 100;

    const successAmount = successfulTransactions.reduce(
      (total, transaction) => {
        return total + transaction.amount;
      },
      0
    );

    res.status(200).json({
      successPercentage: successPercentage.toFixed(2),
      successAmount: successAmount.toFixed(3),
      totalTransactions,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const weeklyStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const results = [];
    let successThisWeek = 0;
    let failedThisWeek = 0;
    const transactionCounts = [];
    const previousWeekSuccessCounts = {};
    let totalNumTxn = 0;

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(currentDate);
      dayDate.setDate(currentDate.getDate() - i);

      const formattedFromDate = `${("0" + dayDate.getDate()).slice(-2)}/${(
        "0" +
        (dayDate.getMonth() + 1)
      ).slice(-2)}/${dayDate.getFullYear()} 00:00:00`;

      const formattedToDate = `${("0" + dayDate.getDate()).slice(-2)}/${(
        "0" +
        (dayDate.getMonth() + 1)
      ).slice(-2)}/${dayDate.getFullYear()} 23:59:59`;

      const totalTransactions = await LiveTransactionTable.find({
        transactiondate: {
          $gte: formattedFromDate,
          $lte: formattedToDate,
        },
      });

      const { successTransactions, failedTransactions } =
        totalTransactions.reduce(
          (result, transaction) => {
            if (transaction.Status === "Success") {
              result.successTransactions.push(transaction);
            } else if (transaction.Status === "Failed") {
              result.failedTransactions.push(transaction);
            }
            return result;
          },
          { successTransactions: [], failedTransactions: [] }
        );

      const successAmount = successTransactions.reduce(
        (total, txn) => total + txn.amount,
        0
      );
      console.log("successAMout", successAmount);
      const failedAmount = failedTransactions.reduce(
        (total, txn) => total + txn.amount,
        0
      );
      console.log("failedAmount", failedAmount);
      results.push({
        date: formattedFromDate.split(" ")[0],
        successCount: successTransactions.length,
        failedCount: failedTransactions.length,
      });
      console.log("results", results);
      successThisWeek += successAmount;
      failedThisWeek += failedAmount;

      const transactionCount = totalTransactions.length;

      transactionCounts.push({
        date: dayDate.toLocaleDateString("en-US"),
        count: transactionCount,
      });

      totalNumTxn += transactionCount;
    }

    for (let i = 7; i < 14; i++) {
      const dayDate = new Date(currentDate);
      dayDate.setDate(currentDate.getDate() - i);

      const fromDate = `${("0" + dayDate.getDate()).slice(-2)}/${(
        "0" +
        (dayDate.getMonth() + 1)
      ).slice(-2)}/${dayDate.getFullYear()} 00:00:00`;
      const toDate = `${("0" + dayDate.getDate()).slice(-2)}/${(
        "0" +
        (dayDate.getMonth() + 1)
      ).slice(-2)}/${dayDate.getFullYear()} 23:59:59`;

      const successfulCount = await LiveTransactionTable.countDocuments({
        transactiondate: {
          $gte: fromDate,
          $lte: toDate,
        },
        Status: "Success",
      });
      previousWeekSuccessCounts[dayDate.toLocaleDateString("en-US")] =
        successfulCount;
    }

    const totalThisWeek = parseFloat(
      (successThisWeek + failedThisWeek).toFixed(3)
    );
    const totalPreviousWeekSuccessCount = Object.values(
      previousWeekSuccessCounts
    ).reduce((total, count) => total + count, 0);

    let percentageChange;
    if (totalPreviousWeekSuccessCount !== 0) {
      percentageChange =
        ((successThisWeek - totalPreviousWeekSuccessCount) /
          (totalPreviousWeekSuccessCount + successThisWeek)) *
        100;
    } else {
      percentageChange = 100;
    }
    successThisWeek = parseFloat(successThisWeek.toFixed(3));
    failedThisWeek = parseFloat(failedThisWeek.toFixed(3));

    res.status(200).json({
      results,
      successThisWeek,
      failedThisWeek,
      totalThisWeek,
      transactionCounts,
      totalNumTxn,
      percentageChange,
    });
  } catch (error) {
    console.error("Error calculating past seven days counts:", error);
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

    const currentWeekTransactions = await LiveTransactionTable.find({
      transactiondate: {
        $gte: formattedCurrentWeekStartDate,
        $lte: formattedCurrentWeekEndDate,
      },
    });

    const previousWeekTransactions = await LiveTransactionTable.find({
      transactiondate: {
        $gte: formattedPreviousWeekStartDate,
        $lte: formattedPreviousWeekEndDate,
      },
    });

    const { currentWeekVisaTransactions, currentWeekMastercardTransactions } =
      currentWeekTransactions.reduce(
        (result, transaction) => {
          if (transaction.cardtype === "Visa") {
            result.currentWeekVisaTransactions.push(transaction);
          } else if (transaction.cardtype === "Mastercard") {
            result.currentWeekMastercardTransactions.push(transaction);
          }
          return result;
        },
        {
          currentWeekVisaTransactions: [],
          currentWeekMastercardTransactions: [],
        }
      );

    const { previousWeekVisaTransactions, previousWeekMastercardTransactions } =
      previousWeekTransactions.reduce(
        (result, transaction) => {
          if (transaction.cardtype === "Visa") {
            result.previousWeekVisaTransactions.push(transaction);
          } else if (transaction.cardtype === "Mastercard") {
            result.previousWeekMastercardTransactions.push(transaction);
          }
          return result;
        },
        {
          previousWeekVisaTransactions: [],
          previousWeekMastercardTransactions: [],
        }
      );

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

    const visaDifference = parseFloat(
      (currentWeekVisaAmount - previousWeekVisaAmount).toFixed(3)
    );
    const mastercardDifference = parseFloat(
      (currentWeekMastercardAmount - previousWeekMastercardAmount).toFixed(3)
    );

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

    const filteredTransactions = transactionsCurrentWeek.filter(
      (transaction) => transaction.country !== "0"
    );

    filteredTransactions.forEach((transaction) => {
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
      return (
        countryStats[b].transactionCount - countryStats[a].transactionCount
      );
    });

    const top4Countries = sortedCountries.slice(0, 4);
    const sumOfAmounts = parseFloat(
      top4Countries
        .reduce((sum, country) => {
          return sum + countryStats[country].totalAmount;
        }, 0)
        .toFixed(3)
    );

    const results = top4Countries.map((country) => ({
      country: country,
      transactionCount: parseFloat(
        countryStats[country].transactionCount.toFixed(3)
      ),
      totalAmount: parseFloat(countryStats[country].totalAmount.toFixed(3)),
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

const successlast6Months = async (req, res) => {
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
      transactiondate: { $gte: fromDate, $lte: toDate },
      Status: "Success",
    });

    const successfulTransactionsPreviousMonth = await LiveTransactionTable.find(
      {
        transactiondate: {
          $gte: fromDatePreviousMonth,
          $lte: toDatePreviousMonth,
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

    totalAmountTransactions = parseFloat(totalAmountTransactions.toFixed(3));
    numSuccessfulTransactions += successfulTransactionsThisMonth.length;
    totalAmountSuccessfulTransactions += successfulTransactionsThisMonth.reduce(
      (acc, txn) => acc + txn.amount,
      0
    );

    totalAmountSuccessfulTransactions = parseFloat(
      totalAmountSuccessfulTransactions.toFixed(3)
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
  weeklyStats,
  weeklyCardComparison,
  weeklyTop4Countries,
  successlast6Months,
  monthlyTransactionMetrics,
};
