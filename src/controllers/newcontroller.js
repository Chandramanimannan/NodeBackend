require("../config/database");

const Ratetable = require("../models/Ratetable");
const Settlementtable = require("../models/Settlementtable");
const LiveTransactionTable = require("../models/LiveTransactionTable");
const Client = require("../models/Client");

async function fun(req, res) {
  try {
    const {
      fromDate,
      toDate,
      company_name,
      eur_no_of_refund,
      usd_no_of_refund,
      eur_refund_amount,
      usd_refund_amount,
      eur_no_of_chargeback,
      usd_no_of_chargeback,
      eur_chargeback_amount,
      usd_chargeback_amount,
      eur_to_usd_exc_rate,
      usd_to_eur_exc_rate,
      note,
    } = req.body;

    var [year, month, day] = fromDate.substring(0, 10).split("-");
    const formattedfromDate = `${day}/${month}/${year} 18:25:00`;

    [year, month, day] = toDate.substring(0, 10).split("-");
    const formattedtoDate = `${day}/${month}/${year} 23:59:59`;

    console.table({ formattedfromDate, formattedtoDate });

    const refund_count = parseFloat(eur_no_of_refund + usd_no_of_refund);
    console.log(refund_count);
    const chargeback_count = parseFloat(
      eur_no_of_chargeback + usd_no_of_chargeback
    );
    console.log(chargeback_count);
    const refund_amount = eur_refund_amount + usd_refund_amount;

    console.log(refund_amount);
    const chargeback_amount = eur_chargeback_amount + usd_chargeback_amount;
    console.log(chargeback_amount);

    const client_data = await Client.findOne({ company_name });
    const rates = await Ratetable.findOne({ company_name: company_name });

    const all_txn_of_company = await LiveTransactionTable.aggregate([
      {
        $match: {
          merchant: company_name,
          transactiondate: {
            $gte: formattedfromDate,
            $lte: formattedtoDate,
          },
        },
      },
      {
        $group: {
          _id: "$Status", // Group by the currency field
          totalTransactions: { $sum: 1 }, // Count total transactions for each currency
          totalAmount: { $sum: "$amount" }, // Calculate total amount for each currency
          // Add more operations as needed
        },
      },
    ]);

    console.log(all_txn_of_company);

    all_txn_of_company.forEach((statusGroup) => {
      const status = statusGroup._id;
      const totalTransactions = statusGroup.totalTransactions;
      const totalAmount = statusGroup.totalAmount;

      if (status === "Success") {
        app_count = totalTransactions;
        app_vol = totalAmount;
      } else if (status === "Failed") {
        dec_count = totalTransactions;
        dec_vol = totalAmount;
      }

      console.log(
        `Status: ${status}, Total Transactions: ${totalTransactions}, Total Amount: ${totalAmount}`
      );
    });

    console.table({ app_count, dec_count, app_vol, dec_vol });

    const MDR_amount = parseFloat((app_vol * (rates.MDR / 100)).toFixed(3));
    const app_amount = parseFloat((app_count * rates.txn_app).toFixed(3));
    const dec_amount = parseFloat((dec_count * rates.txn_dec).toFixed(3));
    const RR_amount = parseFloat((app_vol * (rates.RR / 100)).toFixed(3));

    const amt_after_fees = parseFloat(
      (app_vol - MDR_amount - app_amount - dec_amount - RR_amount).toFixed(3)
    );

    const settlement_fee_amount = parseFloat(
      (amt_after_fees * (rates.settlement_fee / 100)).toFixed(3)
    );

    const settlement_amount = parseFloat(
      (amt_after_fees - settlement_fee_amount).toFixed(3)
    );

    const total_refund_amount =
      parseFloat(refund_count) * rates.refund_fee + parseFloat(refund_amount);

    const total_chargeback_amount =
      parseFloat(chargeback_count) * rates.chargeback_fee +
      parseFloat(chargeback_amount);

    const settlement_vol = parseFloat(
      (
        settlement_amount -
        total_refund_amount -
        total_chargeback_amount
      ).toFixed(3)
    );
    console.table([
      MDR_amount,
      app_amount,
      dec_amount,
      RR_amount,
      settlement_fee_amount,
      total_refund_amount,
      total_chargeback_amount,
      settlement_vol,
    ]);

    const settlementDate = new Date();

    formattedSettlementDate = `${("0" + settlementDate.getDate()).slice(-2)}/${(
      "0" +
      (settlementDate.getMonth() + 1)
    ).slice(-2)}/${settlementDate.getFullYear()}`;

    settlement_record = {
      client_id: client_data["client_id"],
      company_name,
      fromDate: formattedfromDate.substring(0, 10),
      toDate: formattedtoDate.substring(0, 10),
      total_vol: app_vol,
      eur_app_count: app_count,
      eur_dec_count: dec_count,

      MDR_amount,
      app_amount,
      dec_amount,
      RR_amount,
      settlement_fee_amount,
      eur_no_of_refund,
      usd_no_of_refund,
      eur_refund_amount,
      usd_refund_amount,
      eur_no_of_chargeback,
      usd_no_of_chargeback,
      eur_chargeback_amount,
      usd_chargeback_amount,
      total_refund_amount,
      total_chargeback_amount,
      date_settled: formattedSettlementDate,
      settlement_vol,
      note,
    };

    res.json(settlement_record);
  } catch {}
}

module.exports = { fun };
