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
    const transactionCounts = [];
    let successThisWeek = 0;
    let failedThisWeek = 0;
    let totalNumTxn = 0;

    // Get start and end dates for the week
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - 6); // Start of the week
    const endDate = new Date(currentDate);

    // Fetch transactions for the entire week
    const totalTransactions = await LiveTransactionTable.find({
      transactiondate: { $gte: startDate, $lte: endDate },
    });

    // Process transactions for each day of the week
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const formattedDate = currentDate.toLocaleDateString("en-US");

      const transactionsOfDay = totalTransactions.filter(
        (transaction) =>
          transaction.transactiondate.toDateString() ===
          currentDate.toDateString()
      );

      const successAmount = transactionsOfDay
        .filter((txn) => txn.Status === "Success")
        .reduce((total, txn) => total + txn.amount, 0);
      const failedAmount = transactionsOfDay
        .filter((txn) => txn.Status === "Failed")
        .reduce((total, txn) => total + txn.amount, 0);

      results.push({
        date: formattedDate,
        successCount: transactionsOfDay.filter(
          (txn) => txn.Status === "Success"
        ).length,
        failedCount: transactionsOfDay.filter((txn) => txn.Status === "Failed")
          .length,
      });

      successThisWeek += successAmount;
      failedThisWeek += failedAmount;

      transactionCounts.push({
        date: formattedDate,
        count: transactionsOfDay.length,
      });

      totalNumTxn += transactionsOfDay.length;
    }

    // Calculate previous week's success counts
    const previousWeekSuccessCounts = {};
    for (let i = 7; i < 14; i++) {
      const previousDate = new Date(startDate);
      previousDate.setDate(startDate.getDate() - i);

      const fromDate = new Date(previousDate);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(previousDate);
      toDate.setHours(23, 59, 59, 999);

      const successfulCount = await LiveTransactionTable.countDocuments({
        transactiondate: { $gte: fromDate, $lte: toDate },
        Status: "Success",
      });

      previousWeekSuccessCounts[previousDate.toLocaleDateString("en-US")] =
        successfulCount;
    }

    // Calculate total this week and percentage change
    const totalThisWeek = parseFloat(
      (successThisWeek + failedThisWeek).toFixed(3)
    );
    const totalPreviousWeekSuccessCount = Object.values(
      previousWeekSuccessCounts
    ).reduce((total, count) => total + count, 0);
    const percentageChange =
      totalPreviousWeekSuccessCount !== 0
        ? ((successThisWeek - totalPreviousWeekSuccessCount) /
            (totalPreviousWeekSuccessCount + successThisWeek)) *
          100
        : 100;

    res.status(200).json({
      results,
      successThisWeek: parseFloat(successThisWeek.toFixed(3)),
      failedThisWeek: parseFloat(failedThisWeek.toFixed(3)),
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

const monthlyTransactionMetrics = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    let numTransactions = 0;
    let numSuccessfulTransactions = 0;
    let totalAmountTransactions = 0;
    let totalAmountSuccessfulTransactions = 0;

    for (let i = 0; i < 32; i++) {
      const dayDate = new Date(thirtyDaysAgo);
      dayDate.setDate(thirtyDaysAgo.getDate() + i);

      const formattedFromDate = `${("0" + dayDate.getDate()).slice(-2)}/${(
        "0" +
        (dayDate.getMonth() + 1)
      ).slice(-2)}/${dayDate.getFullYear()} 00:00:00`;
      const formattedToDate = `${("0" + dayDate.getDate()).slice(-2)}/${(
        "0" +
        (dayDate.getMonth() + 1)
      ).slice(-2)}/${dayDate.getFullYear()} 23:59:59`;

      const transactions = await LiveTransactionTable.find({
        transactiondate: {
          $gte: formattedFromDate,
          $lte: formattedToDate,
        },
      });
      console.log(formattedFromDate);
      console.log(formattedToDate);

      numTransactions += transactions.length;
      totalAmountTransactions += transactions.reduce(
        (total, txn) => total + txn.amount,
        0
      );

      const successfulTransactions = transactions.filter(
        (txn) => txn.Status === "Success"
      );
      numSuccessfulTransactions += successfulTransactions.length;
      totalAmountSuccessfulTransactions += successfulTransactions.reduce(
        (total, txn) => total + txn.amount,
        0
      );
    }

    let numTransactionsPreviousMonth = 0;
    let numSuccessfulTransactionsPreviousMonth = 0;

    for (let i = 32; i < 60; i++) {
      const dayDate = new Date(thirtyDaysAgo);
      dayDate.setDate(thirtyDaysAgo.getDate() + i);

      const formattedFromDate = `${("0" + dayDate.getDate()).slice(-2)}/${(
        "0" +
        (dayDate.getMonth() + 1)
      ).slice(-2)}/${dayDate.getFullYear()} 00:00:00`;
      const formattedToDate = `${("0" + dayDate.getDate()).slice(-2)}/${(
        "0" +
        (dayDate.getMonth() + 1)
      ).slice(-2)}/${dayDate.getFullYear()} 23:59:59`;

      const transactions = await LiveTransactionTable.find({
        transactiondate: {
          $gte: formattedFromDate,
          $lte: formattedToDate,
        },
      });

      numTransactionsPreviousMonth += transactions.length;

      const successfulTransactions = transactions.filter(
        (txn) => txn.Status === "Success"
      );
      numSuccessfulTransactionsPreviousMonth += successfulTransactions.length;
    }

    const growthPercentage =
      numSuccessfulTransactionsPreviousMonth === 0
        ? 100
        : ((numSuccessfulTransactions -
            numSuccessfulTransactionsPreviousMonth) /
            numSuccessfulTransactionsPreviousMonth) *
          100;

    res.status(200).json({
      numTransactions,
      numSuccessfulTransactions,
      totalAmountTransactions,
      totalAmountSuccessfulTransactions,
      growthPercentage,
    });
  } catch (error) {
    console.error("Error calculating last 30 days stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const successlast6Months = async (req, res) => {
  try {
    const transactions = await LiveTransactionTable.find({ Status: "Success" });

    const salesByMonth = {};
    let totalSales = 0;

    for (let i = 0; i < 6; i++) {
      const currentDate = new Date();
      const startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i + 1,
        0
      );

      const filteredTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(
          transaction.transactiondate.replace(
            /(\d{2})\/(\d{2})\/(\d{4})/,
            "$2/$1/$3"
          )
        );
        return transactionDate >= startDate && transactionDate <= endDate;
      });

      const totalAmount = filteredTransactions.reduce(
        (total, transaction) => total + transaction.amount,
        0
      );

      salesByMonth[
        startDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      ] = totalAmount;
      totalSales += totalAmount;
    }

    res.json({ salesByMonth, totalSales });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data" });
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
