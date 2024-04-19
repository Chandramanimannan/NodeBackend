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

module.exports = {
  createTransactiontable,
  getTransactiontable,
  quickSearch,
};
