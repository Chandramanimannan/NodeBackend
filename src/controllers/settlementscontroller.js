require("../config/database");
const nodemailer = require("nodemailer");

const Ratetable = require("../models/Ratetable");
const Settlementtable = require("../models/Settlementtable");
const LiveTransactionTable = require("../models/LiveTransactionTable");
const Client = require("../models/Client");

// 6 cases -

// 1. rates EUR txn EUR
// 2. rates USD txn USD
// 3. rates EUR txn USD
// 4. rates USD txn EUR
// 5. rates EUR txn EUR & USD
// 6. rates USD txn EUR & USD

async function createSettlement(req, res) {
  // try {
  //   const {
  //     fromDate,
  //     toDate,
  //     company_name,
  //     eur_no_of_refund,
  //     usd_no_of_refund,
  //     eur_refund_amount,
  //     usd_refund_amount,
  //     eur_no_of_chargeback,
  //     usd_no_of_chargeback,
  //     eur_chargeback_amount,
  //     usd_chargeback_amount,
  //     eur_to_usd_exc_rate,
  //     usd_to_eur_exc_rate,
  //     note,
  //   } = req.body;
  //   console.log("from", fromDate);
  //   console.log("to", toDate);

  //   var [year, month, day] = fromDate.substring(0, 10).split("-");
  //   const formattedfromDate = `${day}/${month}/${year} 00:00:00`;

  //   [year, month, day] = toDate.substring(0, 10).split("-");
  //   const formattedtoDate = `${day}/${month}/${year} 23:59:59`;
  //   console.log("from", formattedfromDate);
  //   console.log("to", formattedtoDate);

  //   //All transactions of Company between from and to date
  //   const all_txn_of_company = await LiveTransactionTable.find({
  //     merchant: company_name,
  //     transactiondate: {
  //       $gte: formattedfromDate,
  //       $lte: formattedtoDate,
  //     },
  //   });

  //   console.log("length", all_txn_of_company.length);

  //   currencies_data = await Client.findOne({ company_name });
  //   currencies = currencies_data["currency"];
  //   console.log("currencies_data", currencies_data.client_id);

  //   const app_dec_calculation = {};

  //   // Process each currency using the calculateCurrencyValues function
  //   currencies.forEach((currency) => {
  //     app_dec_calculation[currency] = calculateCurrencyValues(
  //       all_txn_of_company,
  //       currency
  //     );
  //   });

  //   console.log(app_dec_calculation);

  //   let total_app_count = 0;
  //   let total_dec_count = 0;

  //   // Iterate through each currency in the data object
  //   for (const currency in app_dec_calculation) {
  //     if (app_dec_calculation.hasOwnProperty(currency)) {
  //       // Sum up the approved volume and declined volume
  //       total_app_count += app_dec_calculation[currency].approved_count;
  //       total_dec_count += app_dec_calculation[currency].declined_count;
  //     }
  //   }

  //   console.log("app count", total_app_count);
  //   console.log("dec count", total_dec_count);

  //   //Extract rates of the company
  //   const rates = await Ratetable.findOne({ company_name: company_name });

  //   const refund_count =
  //     parseFloat(eur_no_of_refund) + parseFloat(usd_no_of_refund);
  //   console.log("refund_count", refund_count);

  //   const chargeback_count =
  //     parseFloat(eur_no_of_chargeback) + parseFloat(usd_no_of_chargeback);
  //   console.log("chargeback_count", chargeback_count);

  //   // Calculation begins
  //   if (currencies.length > 1) {
  //     // both currency processing
  //     if (rates.currency === "EUR") {
  //       console.log("In eur section");

  //       const usd_to_eur_vol =
  //         app_dec_calculation["USD"]["total_volume"] *
  //         parseFloat(usd_to_eur_exc_rate);

  //       total_vol = parseFloat(
  //         (usd_to_eur_vol + app_dec_calculation["EUR"]["total_volume"]).toFixed(
  //           3
  //         )
  //       );

  //       const usd_to_eur_refunds =
  //         parseFloat(usd_refund_amount) * parseFloat(usd_to_eur_exc_rate);

  //       refunds_amount = parseFloat(
  //         (usd_to_eur_refunds + parseFloat(eur_refund_amount)).toFixed(3)
  //       );

  //       const usd_to_eur_chargeback =
  //         parseFloat(usd_chargeback_amount) * parseFloat(usd_to_eur_exc_rate);
  //       chargebacks_amount = parseFloat(
  //         (usd_to_eur_chargeback + parseFloat(eur_chargeback_amount)).toFixed(3)
  //       );

  //       //Fess calculation

  //       result = {};
  //       result = calculateFees(
  //         rates,
  //         total_vol,
  //         total_app_count,
  //         total_dec_count,
  //         refund_count,
  //         refunds_amount,
  //         chargeback_count,
  //         chargebacks_amount
  //       );
  //       eur_settlement_vol = result.settlement_vol;
  //       settlement_vol = parseFloat(
  //         (eur_settlement_vol * eur_to_usd_exc_rate).toFixed(3)
  //       );
  //     } else {
  //       console.log("In usd section");

  //       const eur_to_usd_vol = parseFloat(
  //         (
  //           app_dec_calculation["EUR"]["total_volume"] *
  //           parseFloat(eur_to_usd_exc_rate)
  //         ).toFixed(3)
  //       );

  //       total_vol = parseFloat(
  //         (eur_to_usd_vol + app_dec_calculation["USD"]["total_volume"]).toFixed(
  //           3
  //         )
  //       );

  //       const eur_to_usd_refunds =
  //         parseFloat(eur_refund_amount) * parseFloat(eur_to_usd_exc_rate);
  //       refunds_amount = parseFloat(
  //         (
  //           parseFloat(eur_to_usd_refunds) + parseFloat(usd_refund_amount)
  //         ).toFixed(3)
  //       );
  //       const eur_to_usd_chargeback =
  //         parseFloat(eur_chargeback_amount) * parseFloat(eur_to_usd_exc_rate);
  //       chargebacks_amount = parseFloat(
  //         (
  //           parseFloat(eur_to_usd_chargeback) +
  //           parseFloat(usd_chargeback_amount)
  //         ).toFixed(3)
  //       );

  //       //Fess calculation
  //       result = {};
  //       result = calculateFees(
  //         rates,
  //         total_vol,
  //         total_app_count,
  //         total_dec_count,
  //         refund_count,
  //         refunds_amount,
  //         chargeback_count,
  //         chargebacks_amount
  //       );
  //       settlement_vol = result.settlement_vol;
  //     }
  //     const settlementDate = new Date();

  //     formattedSettlementDate = `${("0" + settlementDate.getDate()).slice(
  //       -2
  //     )}/${("0" + (settlementDate.getMonth() + 1)).slice(
  //       -2
  //     )}/${settlementDate.getFullYear()}`;

  //     settlement_record = {
  //       client_id: currencies_data["client_id"],
  //       company_name,
  //       fromDate: formattedfromDate.substring(0, 10),
  //       toDate: formattedtoDate.substring(0, 10),
  //       total_vol,
  //       eur_app_count: app_dec_calculation["EUR"]["approved_count"],
  //       eur_dec_count: app_dec_calculation["EUR"]["declined_count"],
  //       usd_app_count: app_dec_calculation["USD"]["approved_count"],
  //       usd_dec_count: app_dec_calculation["EUR"]["declined_count"],
  //       MDR_amount: result.MDR_amount,
  //       app_amount: result.app_amount,
  //       dec_amount: result.dec_amount,
  //       RR_amount: result.RR_amount,
  //       settlement_fee_amount: result.settlement_fee_amount,
  //       eur_no_of_refund,
  //       usd_no_of_refund,
  //       eur_refund_amount,
  //       usd_refund_amount,
  //       eur_no_of_chargeback,
  //       usd_no_of_chargeback,
  //       eur_chargeback_amount,
  //       usd_chargeback_amount,
  //       total_refund_amount: result.total_refund_amount,
  //       total_chargeback_amount: result.total_chargeback_amount,
  //       date_settled: formattedSettlementDate,
  //       settlement_vol,
  //       note,
  //     };
  //   } else {
  //     // single currency processing
  //     if (rates.currency === "USD" && currencies[0] === "EUR") {
  //       console.log("In usd section");

  //       total_vol = parseFloat(
  //         app_dec_calculation["EUR"]["approved_volume"].toFixed(3)
  //       );

  //       refunds_amount =
  //         parseFloat(eur_refund_amount) * parseFloat(eur_to_usd_exc_rate);

  //       chargebacks_amount =
  //         parseFloat(eur_chargeback_amount) * parseFloat(eur_to_usd_exc_rate);

  //       //Fess calculation
  //       result = {};
  //       result = calculateFees(
  //         rates,
  //         total_vol,
  //         total_app_count,
  //         total_dec_count,
  //         refund_count,
  //         refunds_amount,
  //         chargeback_count,
  //         chargebacks_amount
  //       );

  //       settlement_vol = result.settlement_vol;

  //       const settlementDate = new Date();
  //       formattedSettlementDate = `${("0" + settlementDate.getDate()).slice(
  //         -2
  //       )}/${("0" + (settlementDate.getMonth() + 1)).slice(
  //         -2
  //       )}/${settlementDate.getFullYear()}`;

  //       settlement_record = {
  //         client_id: currencies_data["client_id"],
  //         company_name,
  //         fromDate: formattedfromDate.substring(0, 10),
  //         toDate: formattedtoDate.substring(0, 10),
  //         total_vol,
  //         eur_app_count: app_dec_calculation["EUR"]["approved_count"],
  //         eur_dec_count: app_dec_calculation["EUR"]["declined_count"],
  //         MDR_amount: result.MDR_amount,
  //         app_amount: result.app_amount,
  //         dec_amount: result.dec_amount,
  //         RR_amount: result.RR_amount,
  //         settlement_fee_amount: result.settlement_fee_amount,
  //         eur_no_of_refund,
  //         eur_refund_amount,
  //         eur_no_of_chargeback,
  //         eur_chargeback_amount,
  //         total_refund_amount: result.total_refund_amount,
  //         total_chargeback_amount: result.total_chargeback_amount,
  //         date_settled: formattedSettlementDate,
  //         settlement_vol,
  //         note,
  //       };
  //     }

  //     if (rates.currency === "EUR" && currencies[0] === "USD") {
  //       total_vol =
  //         app_dec_calculation["USD"]["total_volume"] *
  //         parseFloat(usd_to_eur_exc_rate);

  //       refunds_amount =
  //         parseFloat(usd_refund_amount) * parseFloat(usd_to_eur_exc_rate);

  //       chargebacks_amount =
  //         parseFloat(usd_chargeback_amount) * parseFloat(usd_to_eur_exc_rate);

  //       //Fess calculation

  //       result = {};
  //       result = calculateFees(
  //         rates,
  //         total_vol,
  //         total_app_count,
  //         total_dec_count,
  //         refund_count,
  //         refunds_amount,
  //         chargeback_count,
  //         chargebacks_amount
  //       );
  //       eur_settlement_vol = result.settlement_vol;
  //       settlement_vol = parseFloat(
  //         (eur_settlement_vol * eur_to_usd_exc_rate).toFixed(3)
  //       );

  //       const settlementDate = new Date();

  //       formattedSettlementDate = `${("0" + settlementDate.getDate()).slice(
  //         -2
  //       )}/${("0" + (settlementDate.getMonth() + 1)).slice(
  //         -2
  //       )}/${settlementDate.getFullYear()}`;

  //       settlement_record = {
  //         client_id: currencies_data["client_id"],
  //         company_name,
  //         fromDate: formattedfromDate.substring(0, 10),
  //         toDate: formattedtoDate.substring(0, 10),
  //         total_vol,
  //         usd_app_count: app_dec_calculation["USD"]["approved_count"],
  //         usd_dec_count: app_dec_calculation["EUR"]["declined_count"],
  //         MDR_amount: result.MDR_amount,
  //         app_amount: result.app_amount,
  //         dec_amount: result.dec_amount,
  //         RR_amount: result.RR_amount,
  //         settlement_fee_amount: result.settlement_fee_amount,
  //         usd_no_of_refund,
  //         usd_refund_amount,
  //         usd_no_of_chargeback,
  //         eur_chargeback_amount,
  //         usd_chargeback_amount,
  //         total_refund_amount: result.total_refund_amount,
  //         total_chargeback_amount: result.total_chargeback_amount,
  //         date_settled: formattedSettlementDate,
  //         settlement_vol,
  //         note,
  //       };
  //     }

  //     if (rates.currency === "EUR" && currencies[0] === "EUR") {
  //       total_vol = parseFloat(
  //         app_dec_calculation["EUR"]["total_volume"].toFixed(3)
  //       );

  //       refunds_amount = parseFloat(eur_refund_amount);

  //       chargebacks_amount = parseFloat(eur_chargeback_amount);

  //       //Fess calculation
  //       result = {};
  //       result = calculateFees(
  //         rates,
  //         total_vol,
  //         total_app_count,
  //         total_dec_count,
  //         refund_count,
  //         refunds_amount,
  //         chargeback_count,
  //         chargebacks_amount
  //       );

  //       settlement_vol = result.settlement_vol;

  //       const settlementDate = new Date();
  //       formattedSettlementDate = `${("0" + settlementDate.getDate()).slice(
  //         -2
  //       )}/${("0" + (settlementDate.getMonth() + 1)).slice(
  //         -2
  //       )}/${settlementDate.getFullYear()}`;

  //       settlement_record = {
  //         client_id: currencies_data["client_id"],
  //         company_name,
  //         fromDate: formattedfromDate.substring(0, 10),
  //         toDate: formattedtoDate.substring(0, 10),
  //         total_vol,
  //         eur_app_count: app_dec_calculation["EUR"]["approved_count"],
  //         eur_dec_count: app_dec_calculation["EUR"]["declined_count"],
  //         MDR_amount: result.MDR_amount,
  //         app_amount: result.app_amount,
  //         dec_amount: result.dec_amount,
  //         RR_amount: result.RR_amount,
  //         settlement_fee_amount: result.settlement_fee_amount,
  //         eur_no_of_refund,
  //         eur_refund_amount,
  //         eur_no_of_chargeback,
  //         eur_chargeback_amount,
  //         total_refund_amount: result.total_refund_amount,
  //         total_chargeback_amount: result.total_chargeback_amount,
  //         date_settled: formattedSettlementDate,
  //         settlement_vol,
  //         note,
  //       };
  //     }

  //     if (rates.currency === "USD" && currencies[0] === "USD") {
  //       total_vol = app_dec_calculation["USD"]["total_volume"];

  //       refunds_amount = parseFloat(usd_refund_amount);

  //       chargebacks_amount = parseFloat(usd_chargeback_amount);

  //       //Fess calculation

  //       result = {};
  //       result = calculateFees(
  //         rates,
  //         total_vol,
  //         total_app_count,
  //         total_dec_count,
  //         refund_count,
  //         refunds_amount,
  //         chargeback_count,
  //         chargebacks_amount
  //       );

  //       settlement_vol = result.settlement_vol;

  //       const settlementDate = new Date();

  //       formattedSettlementDate = `${("0" + settlementDate.getDate()).slice(
  //         -2
  //       )}/${("0" + (settlementDate.getMonth() + 1)).slice(
  //         -2
  //       )}/${settlementDate.getFullYear()}`;

  //       settlement_record = {
  //         client_id: currencies_data["client_id"],
  //         company_name,
  //         fromDate: formattedfromDate.substring(0, 10),
  //         toDate: formattedtoDate.substring(0, 10),
  //         total_vol,
  //         usd_app_count: app_dec_calculation["USD"]["approved_count"],
  //         usd_dec_count: app_dec_calculation["EUR"]["declined_count"],
  //         MDR_amount: result.MDR_amount,
  //         app_amount: result.app_amount,
  //         dec_amount: result.dec_amount,
  //         RR_amount: result.RR_amount,
  //         settlement_fee_amount: result.settlement_fee_amount,
  //         usd_no_of_refund,
  //         usd_refund_amount,
  //         usd_no_of_chargeback,
  //         eur_chargeback_amount,
  //         usd_chargeback_amount,
  //         total_refund_amount: result.total_refund_amount,
  //         total_chargeback_amount: result.total_chargeback_amount,
  //         date_settled: formattedSettlementDate,
  //         settlement_vol,
  //         note,
  //       };
  //     }
  //   }

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
    const formattedfromDate = `${day}/${month}/${year} 13:00:00`;

    [year, month, day] = toDate.substring(0, 10).split("-");
    const formattedtoDate = `${day}/${month}/${year} 15:00:00`;

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

    const settlementRecordInstance = new Settlementtable(settlement_record);
    // Save the record to the database
    await settlementRecordInstance.save();

    res.status(201).json({
      success: true,
      settlement_record,
    });
    await Client.updateOne(
      { company_name: company_name },
      { last_settled_date: formattedSettlementDate }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function previewSettlement(req, res) {
  // try {
  //   const {
  //     fromDate,
  //     toDate,
  //     company_name,
  //     eur_no_of_refund,
  //     usd_no_of_refund,
  //     eur_refund_amount,
  //     usd_refund_amount,
  //     eur_no_of_chargeback,
  //     usd_no_of_chargeback,
  //     eur_chargeback_amount,
  //     usd_chargeback_amount,
  //     eur_to_usd_exc_rate,
  //     usd_to_eur_exc_rate,
  //     note,
  //   } = req.body;

  //   var [year, month, day] = fromDate.substring(0, 10).split("-");
  //   const formattedfromDate = `${day}/${month}/${year} 00:00:00`;

  //   [year, month, day] = toDate.substring(0, 10).split("-");
  //   const formattedtoDate = `${day}/${month}/${year} 23:59:59`;

  //   //All transactions of Company between from and to date
  //   const all_txn_of_company = await LiveTransactionTable.find({
  //     merchant: company_name,
  //     transactiondate: {
  //       $gte: formattedfromDate,
  //       $lte: formattedtoDate,
  //     },
  //   });

  //   currencies_data = await Client.findOne({ company_name });
  //   currencies = currencies_data["currency"];
  //   console.log(currencies[0]);
  //   const app_dec_calculation = {};

  //   // Process each currency using the calculateCurrencyValues function
  //   currencies.forEach((currency) => {
  //     app_dec_calculation[currency] = calculateCurrencyValues(
  //       all_txn_of_company,
  //       currency
  //     );
  //   });

  //   let total_app_count = 0;
  //   let total_dec_count = 0;

  //   // Iterate through each currency in the data object
  //   for (const currency in app_dec_calculation) {
  //     if (app_dec_calculation.hasOwnProperty(currency)) {
  //       // Sum up the approved volume and declined volume
  //       total_app_count += app_dec_calculation[currency].approved_count;
  //       total_dec_count += app_dec_calculation[currency].declined_count;
  //     }
  //   }

  //   //Extract rates of the company
  //   const rates = await Ratetable.findOne({ company_name: company_name });
  //   console.table([rates.currency, currencies[0]]);
  //   const refund_count =
  //     parseFloat(eur_no_of_refund) + parseFloat(usd_no_of_refund);

  //   const chargeback_count =
  //     parseFloat(eur_no_of_chargeback) + parseFloat(usd_no_of_chargeback);

  //   // Calculation begins
  //   if (currencies.length > 1) {
  //     // both currency processing
  //     if (rates.currency === "EUR") {
  //       console.log("In eur section");

  //       const usd_to_eur_vol =
  //         app_dec_calculation["USD"]["total_volume"] *
  //         parseFloat(usd_to_eur_exc_rate);

  //       total_vol = parseFloat(
  //         (usd_to_eur_vol + app_dec_calculation["EUR"]["total_volume"]).toFixed(
  //           3
  //         )
  //       );

  //       const usd_to_eur_refunds =
  //         parseFloat(usd_refund_amount) * parseFloat(usd_to_eur_exc_rate);

  //       refunds_amount = parseFloat(
  //         (usd_to_eur_refunds + parseFloat(eur_refund_amount)).toFixed(3)
  //       );

  //       const usd_to_eur_chargeback =
  //         parseFloat(usd_chargeback_amount) * parseFloat(usd_to_eur_exc_rate);
  //       chargebacks_amount = parseFloat(
  //         (usd_to_eur_chargeback + parseFloat(eur_chargeback_amount)).toFixed(3)
  //       );

  //       //Fess calculation

  //       result = {};
  //       result = calculateFees(
  //         rates,
  //         total_vol,
  //         total_app_count,
  //         total_dec_count,
  //         refund_count,
  //         refunds_amount,
  //         chargeback_count,
  //         chargebacks_amount
  //       );
  //       eur_settlement_vol = result.settlement_vol;
  //       settlement_vol = parseFloat(
  //         (eur_settlement_vol * eur_to_usd_exc_rate).toFixed(3)
  //       );
  //     } else {
  //       console.log("In usd section");

  //       const eur_to_usd_vol = parseFloat(
  //         (
  //           app_dec_calculation["EUR"]["total_volume"] *
  //           parseFloat(eur_to_usd_exc_rate)
  //         ).toFixed(3)
  //       );

  //       total_vol = parseFloat(
  //         (eur_to_usd_vol + app_dec_calculation["USD"]["total_volume"]).toFixed(
  //           3
  //         )
  //       );

  //       const eur_to_usd_refunds =
  //         parseFloat(eur_refund_amount) * parseFloat(eur_to_usd_exc_rate);
  //       refunds_amount = parseFloat(
  //         (
  //           parseFloat(eur_to_usd_refunds) + parseFloat(usd_refund_amount)
  //         ).toFixed(3)
  //       );
  //       const eur_to_usd_chargeback =
  //         parseFloat(eur_chargeback_amount) * parseFloat(eur_to_usd_exc_rate);
  //       chargebacks_amount = parseFloat(
  //         (
  //           parseFloat(eur_to_usd_chargeback) +
  //           parseFloat(usd_chargeback_amount)
  //         ).toFixed(3)
  //       );

  //       //Fess calculation
  //       result = {};
  //       result = calculateFees(
  //         rates,
  //         total_vol,
  //         total_app_count,
  //         total_dec_count,
  //         refund_count,
  //         refunds_amount,
  //         chargeback_count,
  //         chargebacks_amount
  //       );
  //       settlement_vol = result.settlement_vol;
  //     }
  //     const settlementDate = new Date();

  //     formattedSettlementDate = `${("0" + settlementDate.getDate()).slice(
  //       -2
  //     )}/${("0" + (settlementDate.getMonth() + 1)).slice(
  //       -2
  //     )}/${settlementDate.getFullYear()}`;

  //     settlement_record = {
  //       client_id: currencies_data["client_id"],
  //       company_name,
  //       fromDate: formattedfromDate.substring(0, 10),
  //       toDate: formattedtoDate.substring(0, 10),
  //       total_vol,
  //       eur_app_count: app_dec_calculation["EUR"]["approved_count"],
  //       eur_dec_count: app_dec_calculation["EUR"]["declined_count"],
  //       usd_app_count: app_dec_calculation["USD"]["approved_count"],
  //       usd_dec_count: app_dec_calculation["EUR"]["declined_count"],
  //       MDR_amount: result.MDR_amount,
  //       app_amount: result.app_amount,
  //       dec_amount: result.dec_amount,
  //       RR_amount: result.RR_amount,
  //       settlement_fee_amount: result.settlement_fee_amount,
  //       eur_no_of_refund,
  //       usd_no_of_refund,
  //       eur_refund_amount,
  //       usd_refund_amount,
  //       eur_no_of_chargeback,
  //       usd_no_of_chargeback,
  //       eur_chargeback_amount,
  //       usd_chargeback_amount,
  //       total_refund_amount: result.total_refund_amount,
  //       total_chargeback_amount: result.total_chargeback_amount,
  //       date_settled: formattedSettlementDate,
  //       settlement_vol,
  //       note,
  //     };
  //   } else {
  //     // single currency processing
  //     if (rates.currency === "USD" && currencies[0] === "EUR") {
  //       console.log("In usd section");

  //       total_vol = parseFloat(
  //         (
  //           app_dec_calculation["EUR"]["total_volume"] *
  //           parseFloat(eur_to_usd_exc_rate)
  //         ).toFixed(3)
  //       );

  //       refunds_amount =
  //         parseFloat(eur_refund_amount) * parseFloat(eur_to_usd_exc_rate);

  //       chargebacks_amount =
  //         parseFloat(eur_chargeback_amount) * parseFloat(eur_to_usd_exc_rate);

  //       //Fess calculation
  //       result = {};
  //       result = calculateFees(
  //         rates,
  //         total_vol,
  //         total_app_count,
  //         total_dec_count,
  //         refund_count,
  //         refunds_amount,
  //         chargeback_count,
  //         chargebacks_amount
  //       );

  //       settlement_vol = result.settlement_vol;

  //       const settlementDate = new Date();
  //       formattedSettlementDate = `${("0" + settlementDate.getDate()).slice(
  //         -2
  //       )}/${("0" + (settlementDate.getMonth() + 1)).slice(
  //         -2
  //       )}/${settlementDate.getFullYear()}`;

  //       settlement_record = {
  //         client_id: currencies_data["client_id"],
  //         company_name,
  //         fromDate: formattedfromDate.substring(0, 10),
  //         toDate: formattedtoDate.substring(0, 10),
  //         total_vol,
  //         eur_app_count: app_dec_calculation["EUR"]["approved_count"],
  //         eur_dec_count: app_dec_calculation["EUR"]["declined_count"],
  //         MDR_amount: result.MDR_amount,
  //         app_amount: result.app_amount,
  //         dec_amount: result.dec_amount,
  //         RR_amount: result.RR_amount,
  //         settlement_fee_amount: result.settlement_fee_amount,
  //         eur_no_of_refund,
  //         eur_refund_amount,
  //         eur_no_of_chargeback,
  //         eur_chargeback_amount,
  //         total_refund_amount: result.total_refund_amount,
  //         total_chargeback_amount: result.total_chargeback_amount,
  //         date_settled: formattedSettlementDate,
  //         settlement_vol,
  //         note,
  //       };
  //     }

  //     if (rates.currency === "EUR" && currencies[0] === "USD") {
  //       total_vol =
  //         app_dec_calculation["USD"]["total_volume"] *
  //         parseFloat(usd_to_eur_exc_rate);

  //       refunds_amount =
  //         parseFloat(usd_refund_amount) * parseFloat(usd_to_eur_exc_rate);

  //       chargebacks_amount =
  //         parseFloat(usd_chargeback_amount) * parseFloat(usd_to_eur_exc_rate);

  //       //Fess calculation

  //       result = {};
  //       result = calculateFees(
  //         rates,
  //         total_vol,
  //         total_app_count,
  //         total_dec_count,
  //         refund_count,
  //         refunds_amount,
  //         chargeback_count,
  //         chargebacks_amount
  //       );
  //       eur_settlement_vol = result.settlement_vol;
  //       settlement_vol = parseFloat(
  //         (eur_settlement_vol * eur_to_usd_exc_rate).toFixed(3)
  //       );

  //       const settlementDate = new Date();

  //       formattedSettlementDate = `${("0" + settlementDate.getDate()).slice(
  //         -2
  //       )}/${("0" + (settlementDate.getMonth() + 1)).slice(
  //         -2
  //       )}/${settlementDate.getFullYear()}`;

  //       settlement_record = {
  //         client_id: currencies_data["client_id"],
  //         company_name,
  //         fromDate: formattedfromDate.substring(0, 10),
  //         toDate: formattedtoDate.substring(0, 10),
  //         total_vol,
  //         usd_app_count: app_dec_calculation["USD"]["approved_count"],
  //         usd_dec_count: app_dec_calculation["EUR"]["declined_count"],
  //         MDR_amount: result.MDR_amount,
  //         app_amount: result.app_amount,
  //         dec_amount: result.dec_amount,
  //         RR_amount: result.RR_amount,
  //         settlement_fee_amount: result.settlement_fee_amount,
  //         usd_no_of_refund,
  //         usd_refund_amount,
  //         usd_no_of_chargeback,
  //         eur_chargeback_amount,
  //         usd_chargeback_amount,
  //         total_refund_amount: result.total_refund_amount,
  //         total_chargeback_amount: result.total_chargeback_amount,
  //         date_settled: formattedSettlementDate,
  //         settlement_vol,
  //         note,
  //       };
  //     }

  //     if (rates.currency === "EUR" && currencies[0] === "EUR") {
  //       total_vol = parseFloat(
  //         app_dec_calculation["EUR"]["total_volume"].toFixed(3)
  //       );

  //       refunds_amount = parseFloat(eur_refund_amount);

  //       chargebacks_amount = parseFloat(eur_chargeback_amount);

  //       //Fess calculation
  //       result = {};
  //       result = calculateFees(
  //         rates,
  //         total_vol,
  //         total_app_count,
  //         total_dec_count,
  //         refund_count,
  //         refunds_amount,
  //         chargeback_count,
  //         chargebacks_amount
  //       );

  //       settlement_vol = result.settlement_vol;

  //       const settlementDate = new Date();
  //       formattedSettlementDate = `${("0" + settlementDate.getDate()).slice(
  //         -2
  //       )}/${("0" + (settlementDate.getMonth() + 1)).slice(
  //         -2
  //       )}/${settlementDate.getFullYear()}`;

  //       settlement_record = {
  //         client_id: currencies_data["client_id"],
  //         company_name,
  //         fromDate: formattedfromDate.substring(0, 10),
  //         toDate: formattedtoDate.substring(0, 10),
  //         total_vol,
  //         eur_app_count: app_dec_calculation["EUR"]["approved_count"],
  //         eur_dec_count: app_dec_calculation["EUR"]["declined_count"],
  //         MDR_amount: result.MDR_amount,
  //         app_amount: result.app_amount,
  //         dec_amount: result.dec_amount,
  //         RR_amount: result.RR_amount,
  //         settlement_fee_amount: result.settlement_fee_amount,
  //         eur_no_of_refund,
  //         eur_refund_amount,
  //         eur_no_of_chargeback,
  //         eur_chargeback_amount,
  //         total_refund_amount: result.total_refund_amount,
  //         total_chargeback_amount: result.total_chargeback_amount,
  //         date_settled: formattedSettlementDate,
  //         settlement_vol,
  //         note,
  //       };
  //     }

  //     if (rates.currency === "USD" && currencies[0] === "USD") {
  //       total_vol = app_dec_calculation["USD"]["total_volume"];

  //       refunds_amount = parseFloat(usd_refund_amount);

  //       chargebacks_amount = parseFloat(usd_chargeback_amount);

  //       //Fess calculation

  //       result = {};
  //       result = calculateFees(
  //         rates,
  //         total_vol,
  //         total_app_count,
  //         total_dec_count,
  //         refund_count,
  //         refunds_amount,
  //         chargeback_count,
  //         chargebacks_amount
  //       );

  //       settlement_vol = result.settlement_vol;

  //       const settlementDate = new Date();

  //       formattedSettlementDate = `${("0" + settlementDate.getDate()).slice(
  //         -2
  //       )}/${("0" + (settlementDate.getMonth() + 1)).slice(
  //         -2
  //       )}/${settlementDate.getFullYear()}`;

  //       settlement_record = {
  //         client_id: currencies_data["client_id"],
  //         company_name,
  //         fromDate: formattedfromDate.substring(0, 10),
  //         toDate: formattedtoDate.substring(0, 10),
  //         total_vol,
  //         usd_app_count: app_dec_calculation["USD"]["approved_count"],
  //         usd_dec_count: app_dec_calculation["EUR"]["declined_count"],
  //         MDR_amount: result.MDR_amount,
  //         app_amount: result.app_amount,
  //         dec_amount: result.dec_amount,
  //         RR_amount: result.RR_amount,
  //         settlement_fee_amount: result.settlement_fee_amount,
  //         usd_no_of_refund,
  //         usd_refund_amount,
  //         usd_no_of_chargeback,
  //         eur_chargeback_amount,
  //         usd_chargeback_amount,
  //         total_refund_amount: result.total_refund_amount,
  //         total_chargeback_amount: result.total_chargeback_amount,
  //         date_settled: formattedSettlementDate,
  //         settlement_vol,
  //         note,
  //       };
  //     }
  //   }

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
    const formattedfromDate = `${day}/${month}/${year} 15:15:00`;

    [year, month, day] = toDate.substring(0, 10).split("-");
    const formattedtoDate = `${day}/${month}/${year} 16:15:00`;

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
    res.status(201).json({
      success: true,
      settlement_record,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

function calculateCurrencyValues(transactions, currency) {
  // Filter transactions based on the given currency
  const currency_txn = transactions.filter(
    (transaction) => transaction.currency === currency
  );

  // Initialize an object to hold the approved and declined transactions
  const { approved_txns, declined_txns } = currency_txn.reduce(
    (result, transaction) => {
      if (transaction.Status === "Success") {
        result.approved_txns.push(transaction);
      } else if (transaction.Status === "Failed") {
        result.declined_txns.push(transaction);
      }
      return result;
    },
    { approved_txns: [], declined_txns: [] }
  );

  // Calculate the counts and volumes for approved and declined transactions
  const approved_count = approved_txns.length;
  const approved_volume = parseFloat(
    approved_txns.reduce((total, txn) => total + txn.amount, 0).toFixed(3)
  );

  const declined_count = declined_txns.length;
  const declined_volume = parseFloat(
    declined_txns.reduce((total, txn) => total + txn.amount, 0).toFixed(3)
  );

  // Calculate total volume
  const total_volume = parseFloat(
    (approved_volume + declined_volume).toFixed(3)
  );

  // Return an object with the calculated values
  return {
    approved_count,
    approved_volume,
    declined_count,
    declined_volume,
    total_volume,
  };
}

function calculateFees(
  rates,
  total_vol,
  total_app_count,
  total_dec_count,
  refund_count,
  refunds_amount,
  chargeback_count,
  chargebacks_amount
) {
  const MDR = rates.MDR;
  const RR = rates.RR;
  const settlement_fee = rates.settlement_fee;
  const txn_app = rates.txn_app;
  const txn_dec = rates.txn_dec;
  const refund_fee = rates.refund_fee;
  const chargeback_fee = rates.chargeback_fee;

  const MDR_amount = parseFloat((total_vol * (MDR / 100)).toFixed(3));
  const app_amount = parseFloat((total_app_count * txn_app).toFixed(3));
  const dec_amount = parseFloat((total_dec_count * txn_dec).toFixed(3));
  const RR_amount = parseFloat((total_vol * (RR / 100)).toFixed(3));

  const amt_after_fees = parseFloat(
    (total_vol - MDR_amount - app_amount - dec_amount - RR_amount).toFixed(3)
  );

  const settlement_fee_amount = parseFloat(
    (amt_after_fees * (settlement_fee / 100)).toFixed(3)
  );

  const settlement_amount = parseFloat(
    (amt_after_fees - settlement_fee_amount).toFixed(3)
  );

  const total_refund_amount =
    parseFloat(refund_count) * refund_fee + parseFloat(refunds_amount);

  const total_chargeback_amount =
    parseFloat(chargeback_count) * chargeback_fee +
    parseFloat(chargebacks_amount);

  const settlement_vol = parseFloat(
    (settlement_amount - total_refund_amount - total_chargeback_amount).toFixed(
      3
    )
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
  return {
    MDR_amount,
    app_amount,
    dec_amount,
    RR_amount,
    settlement_fee_amount,
    total_refund_amount,
    total_chargeback_amount,
    settlement_vol,
  };
}

async function getSettlement(req, res) {
  try {
    const company_name = req.query.company_name;
    if (!company_name) {
      return res.status(400).json({ error: "Company name is required" });
    }
    const records = await Settlementtable.find({
      company_name: company_name,
    })
      .sort({
        date_settled: -1,
      })
      .select(
        "client_id report_id total_vol settlement_vol status date_settled"
      );

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateSettlement(req, res) {
  try {
    const { id, status } = req.body;

    const existingSettlement = await Settlementtable.findById(id);
    if (!existingSettlement) {
      return res.status(404).json({ error: "Settlement not found" });
    }
    if (status) {
      existingSettlement.status = status;
    }

    const updatedSettlement = await existingSettlement.save();

    res.status(200).json({
      message: "Settlement Updated successfully",
      settlement_record: updatedSettlement,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getSettlementRecordforPDF(req, res) {
  try {
    const id = req.query.id;
    const record = await Settlementtable.findById(id);
    console.log(record);
    res.json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function listSettlement(req, res) {
  try {
    const client_records = await Client.find();
    const settlement_records = await Settlementtable.find();

    // Calculate the length of the records
    const client_length = client_records.length;

    const settlement_length = settlement_records.length;
    // Initialize sum variables for total_vol and settlement_vol
    let totalVolSum = 0;
    let settlementVolSum = 0;

    // Iterate through records to calculate sums
    for (const record of settlement_records) {
      totalVolSum += parseFloat(record.total_vol);
      settlementVolSum += parseFloat(record.settlement_vol);
    }

    res.json({
      client_length,
      settlement_length,
      totalVolSum,
      settlementVolSum,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getCompanyList(req, res) {
  try {
    const company_names = await Client.distinct("company_name");
    res.json(company_names);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getCurrenciesOfCompany(req, res) {
  try {
    const company_name = req.query.company_name;

    if (!company_name) {
      return res.status(400).json({ message: "Company name is required" });
    }

    const client = await Client.findOne({ company_name: company_name });

    if (!client) {
      return res.status(404).json({ message: "Company not found" });
    }
    currencies = client["currency"];
    res.json(currencies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "annagarciagalleria@gmail.com",
    pass: "meeg jhhs pafp apmo",
  },
});

async function sendEmail(req, res) {
  const { fromEmail, toEmail, subject, message } = req.body;
  const attachment = req.file;
  console.log(req.file);
  try {
    console.table([fromEmail, toEmail, subject, message, attachment]);

    const mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject: subject,
      text: message,
      attachments: attachment
        ? [
            {
              filename: attachment.originalname,

              contentType: attachment.mimetype,
            },
          ]
        : [],
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:");
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getCounts(req, res) {
  try {
    const { company_name, fromDate, toDate } = req.body;

    var [year, month, day] = fromDate.substring(0, 10).split("-");
    const formattedfromDate = `${day}/${month}/${year} 00:00:00`;

    [year, month, day] = toDate.substring(0, 10).split("-");
    const formattedtoDate = `${day}/${month}/${year} 23:59:59`;

    const all_txn_of_company = await LiveTransactionTable.find({
      merchant: company_name,
      transactiondate: {
        $gte: formattedfromDate,
        $lte: formattedtoDate,
      },
    });

    currencies_data = await Client.findOne({ company_name });
    currencies = currencies_data["currency"];

    const app_dec_calculation = {};
    currencies.forEach((currency) => {
      app_dec_calculation[currency] = calculateAppDecValues(
        all_txn_of_company,
        currency
      );
    });

    res.json(app_dec_calculation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to calculate currency values" });
  }
}

function calculateAppDecValues(transactions, currency) {
  const currency_txn = transactions.filter(
    (transaction) => transaction.currency === currency
  );

  const { approved_txns, declined_txns } = currency_txn.reduce(
    (result, transaction) => {
      if (transaction.Status === "Success") {
        result.approved_txns.push(transaction);
      } else if (transaction.Status === "Failed") {
        result.declined_txns.push(transaction);
      }
      return result;
    },
    { approved_txns: [], declined_txns: [] }
  );

  const approved_count = approved_txns.length;
  const declined_count = declined_txns.length;
  return {
    approved_count,
    declined_count,
  };
}

module.exports = {
  createSettlement,
  previewSettlement,
  getSettlement,
  updateSettlement,
  getSettlementRecordforPDF,
  listSettlement,
  getCompanyList,
  getCurrenciesOfCompany,
  sendEmail,
  getCounts,
};
