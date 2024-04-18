require("../config/database");
const Transactiontable = require("../models/Transactiontable");

async function createTransactiontable(req, res) {
  try {
    const {
      txnid,
      paymentgateway,
      merchantTxnId,
      merchant,
      orderNo,
      MID,
      cname,
      email,
      cardnumber,
      cardtype,
      country,
      amount,
      currency,
      Status,
      message,
      pdate,
      router,
      webURL,
    } = req.body;

    const transactionDate = new Date();

    // Format the transaction date as dd/mm/yyyy hh:mm:ss
    const formattedTransactionDate = `${("0" + transactionDate.getDate()).slice(
      -2
    )}/${("0" + (transactionDate.getMonth() + 1)).slice(
      -2
    )}/${transactionDate.getFullYear()} ${(
      "0" + transactionDate.getHours()
    ).slice(-2)}:${("0" + transactionDate.getMinutes()).slice(-2)}:${(
      "0" + transactionDate.getSeconds()
    ).slice(-2)}`;

    // Create a new Transactiontable
    const transactiontable = new Transactiontable({
      txnid,
      paymentgateway,
      merchantTxnId,
      merchant,
      orderNo,
      MID,
      cname,
      email,
      cardnumber,
      cardtype,
      country,
      amount,
      currency,
      transactiondate: formattedTransactionDate,
      Status,
      message,
      pdate,
      router,
      webURL,
    });

    // Save the Transactiontable to the database
    await transactiontable.save();

    res.status(201).json({
      message: "Transactiontable created successfully",
      transactiontable: transactiontable,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getTransactiontable(req, res) {
  try {
    const transactiontable = await Transactiontable.find();
    res.status(200).json(transactiontable);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// async function getTransactiontable(req, res) {
//   try {
//     const { page = 1, pageSize = 10 } = req.query;

//     let skip = (page - 1) * pageSize;
//     if (skip < 0) {
//       skip = 0;
//     }

//     const transactiontable = await Transactiontable.find().skip(skip).limit(pageSize);

//     res.status(200).json({
//       currentPage: parseInt(page),
//       pageSize: parseInt(pageSize),
//       totalItems: transactiontable.length,
//       transactiontable
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }

async function quickSearch(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Search value is required" });
  }

  try {
    const transaction = await Transactiontable.findOne({
      $or: [{ txnid: id }, { merchantTxnId: id }, { orderNo: id }],
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    return res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

//For successful transactions in a Day

async function successfulTransactions(req, res) {
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

    const result = await Transactiontable.find({
      transactiondate: {
        $gte: fromDate,
        $lte: toDate,
      },
      Status: "Success",
    });

    let totalAmount = result.reduce((total, txn) => total + txn.amount, 0);
    res.json({ totalAmount });
  } catch (error) {
    console.error("Error in fetching successful transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// For Pie chart

async function statistics(req, res) {
  try {
    // Get current date
    const currentDate = new Date();
    const fromDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
      "0" +
      (currentDate.getMonth() + 1)
    ).slice(-2)}/${currentDate.getFullYear()} 00:00:00`;

    const toDate = `${("0" + currentDate.getDate()).slice(-2)}/${(
      "0" +
      (currentDate.getMonth() + 1)
    ).slice(-2)}/${currentDate.getFullYear()} 23:59:59`;

    // Query transactions within the current day
    const transactions = await Transactiontable.find({
      transactiondate: { $gte: fromDate, $lte: toDate },
    });

    const successCount = transactions.filter(
      (transaction) => transaction.Status === "Success"
    ).length;
    const pendingCount = transactions.filter(
      (transaction) => transaction.Status === "Pending"
    ).length;
    const failedCount = transactions.filter(
      (transaction) => transaction.Status === "Failed"
    ).length;

    // Send response with counts for each status
    res.json({ successCount, pendingCount, failedCount });
  } catch (error) {
    console.error("Error in fetching transaction statistics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//For bar graph

async function successfulTransactionsForLast7Days(req, res) {
  try {
    const currentDate = new Date();
    const results = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);

      // Convert date to format yyyy/mm/dd
      const fromDate = `${("0" + date.getDate()).slice(-2)}/${(
        "0" +
        (date.getMonth() + 1)
      ).slice(-2)}/${date.getFullYear()} 00:00:00`;
      const toDate = `${("0" + date.getDate()).slice(-2)}/${(
        "0" +
        (date.getMonth() + 1)
      ).slice(-2)}/${date.getFullYear()} 23:59:59`;

      // Query successful transactions for each day
      const result = await Transactiontable.find({
        transactiondate: {
          $gte: fromDate,
          $lte: toDate,
        },
        Status: "Success",
      });

      // Count successful transactions for the day
      const successCount = result.length;

      // Add result to the array
      results.push({ date: fromDate, successCount });
    }

    res.json(results);
  } catch (error) {
    console.error(
      "Error in fetching successful transactions for last 7 days:",
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function transactionCountsForLastNDays(req, res) {
  try {
    const { days } = req.query;

    if (!days || isNaN(days) || days <= 0) {
      return res.status(400).json({
        error: "Invalid value for 'n'. Please provide a positive integer.",
      });
    }

    const currentDate = new Date();
    const results = [];

    for (let i = 1; i <= days; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);

      const fromDate = `${("0" + date.getDate()).slice(-2)}/${(
        "0" +
        (date.getMonth() + 1)
      ).slice(-2)}/${date.getFullYear()} 00:00:00`;
      const toDate = `${("0" + date.getDate()).slice(-2)}/${(
        "0" +
        (date.getMonth() + 1)
      ).slice(-2)}/${date.getFullYear()} 23:59:59`;

      const successCount = await Transactiontable.countDocuments({
        transactiondate: {
          $gte: fromDate,
          $lte: toDate,
        },
        Status: "Success",
      });

      const failedCount = await Transactiontable.countDocuments({
        transactiondate: {
          $gte: fromDate,
          $lte: toDate,
        },
        Status: "Failed",
      });

      const pendingCount = await Transactiontable.countDocuments({
        transactiondate: {
          $gte: fromDate,
          $lte: toDate,
        },
        Status: "Pending",
      });

      results.push({ date: fromDate, successCount, failedCount, pendingCount });
    }

    res.json(results);
  } catch (error) {
    console.error("Error in fetching transactions for last n days:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  createTransactiontable,
  getTransactiontable,
  quickSearch,
  successfulTransactions,
  statistics,
  successfulTransactionsForLast7Days,
  transactionCountsForLastNDays,
};
