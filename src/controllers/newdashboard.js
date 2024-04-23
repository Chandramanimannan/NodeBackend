require("../config/database");
const LiveTransactionTable = require("../models/LiveTransactionTable");

const successPercentageToday = async (req, res) => {
  const { currency, merchant } = req.query;
  console.log("merchat", merchant);
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

    if (merchant) {
      transactions = await LiveTransactionTable.find({
        transactiondate: { $gte: fromDate, $lte: toDate },
        currency: currency,
        merchant: merchant,
      });
    } else {
      transactions = await LiveTransactionTable.find({
        transactiondate: { $gte: fromDate, $lte: toDate },
        currency: currency,
      });
    }
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
  const { currency, merchant } = req.query;
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

      if (merchant) {
        totalTransactions = await LiveTransactionTable.find({
          transactiondate: {
            $gte: formattedFromDate,
            $lte: formattedToDate,
          },
          currency: currency,
          merchant: merchant,
        });
      } else {
        totalTransactions = await LiveTransactionTable.find({
          transactiondate: {
            $gte: formattedFromDate,
            $lte: formattedToDate,
          },
          currency: currency,
        });
      }
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

      if (merchant) {
        successfulCount = await LiveTransactionTable.countDocuments({
          transactiondate: {
            $gte: fromDate,
            $lte: toDate,
          },
          Status: "Success",
          currency: currency,
          merchant: merchant,
        });
      } else {
        successfulCount = await LiveTransactionTable.countDocuments({
          transactiondate: {
            $gte: fromDate,
            $lte: toDate,
          },
          Status: "Success",
          currency: currency,
        });
      }
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
  const { currency, merchant } = req.query;
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

    if (merchant) {
      currentWeekTransactions = await LiveTransactionTable.find({
        transactiondate: {
          $gte: formattedCurrentWeekStartDate,
          $lte: formattedCurrentWeekEndDate,
        },
        currency: currency,
        merchant: merchant,
      });
    } else {
      currentWeekTransactions = await LiveTransactionTable.find({
        transactiondate: {
          $gte: formattedCurrentWeekStartDate,
          $lte: formattedCurrentWeekEndDate,
        },
        currency: currency,
      });
    }

    if (merchant) {
      previousWeekTransactions = await LiveTransactionTable.find({
        transactiondate: {
          $gte: formattedPreviousWeekStartDate,
          $lte: formattedPreviousWeekEndDate,
        },
        currency: currency,
        merchant: merchant,
      });
    } else {
      previousWeekTransactions = await LiveTransactionTable.find({
        transactiondate: {
          $gte: formattedPreviousWeekStartDate,
          $lte: formattedPreviousWeekEndDate,
        },
        currency: currency,
      });
    }

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
  const { currency, merchant } = req.query;
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

    if (merchant) {
      transactionsCurrentWeek = await LiveTransactionTable.find({
        transactiondate: {
          $gte: formattedFromWeekDate,
          $lte: formattedToWeekDate,
        },
        currency: currency,
        merchant: merchant,
      });
    } else {
      transactionsCurrentWeek = await LiveTransactionTable.find({
        transactiondate: {
          $gte: formattedFromWeekDate,
          $lte: formattedToWeekDate,
        },
        currency: currency,
      });
    }

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
  const { currency, merchant } = req.query;
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

      if (merchant) {
        transactions = await LiveTransactionTable.find({
          transactiondate: {
            $gte: formattedFromDate,
            $lte: formattedToDate,
          },
          currency: currency,
          merchant: merchant,
        });
      } else {
        transactions = await LiveTransactionTable.find({
          transactiondate: {
            $gte: formattedFromDate,
            $lte: formattedToDate,
          },
          currency: currency,
        });
      }
      console.log(formattedFromDate);
      console.log(formattedToDate);

      numTransactions += transactions.length;
      totalAmountTransactions += transactions.reduce(
        (total, txn) => total + txn.amount,
        0
      );
      totalAmountTransactions = parseFloat(totalAmountTransactions.toFixed(3));
      const successfulTransactions = transactions.filter(
        (txn) => txn.Status === "Success"
      );
      numSuccessfulTransactions += successfulTransactions.length;
      totalAmountSuccessfulTransactions += successfulTransactions.reduce(
        (total, txn) => total + txn.amount,
        0
      );
    }

    totalAmountSuccessfulTransactions = parseFloat(
      totalAmountSuccessfulTransactions.toFixed(3)
    );

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

      if (merchant) {
        transactions = await LiveTransactionTable.find({
          transactiondate: {
            $gte: formattedFromDate,
            $lte: formattedToDate,
          },
          currency: currency,
          merchant: merchant,
        });
      } else {
        transactions = await LiveTransactionTable.find({
          transactiondate: {
            $gte: formattedFromDate,
            $lte: formattedToDate,
          },
          currency: currency,
        });
      }
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
  const { currency, merchant } = req.query;
  try {
    if (merchant) {
      transactions = await LiveTransactionTable.find({
        Status: "Success",
        currency: currency,
        merchant: merchant,
      });
    } else {
      transactions = await LiveTransactionTable.find({
        Status: "Success",
        currency: currency,
      });
    }
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

      let totalAmount = filteredTransactions.reduce(
        (total, transaction) => total + transaction.amount,
        0
      );

      totalAmount = parseFloat(totalAmount.toFixed(3));

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
