const mongoose = require("mongoose");

const settlementtableSchema = new mongoose.Schema({
  client_id: { type: Number, required: true },
  company_name: { type: String, required: true },
  report_id: { type: String, unique: true },
  fromDate: { type: String },
  toDate: { type: String },
  total_vol: { type: Number },
  eur_app_count: { type: Number },
  eur_dec_count: { type: Number },
  usd_app_count: { type: Number },
  usd_dec_count: { type: Number },

  MDR_amount: { type: Number },
  app_amount: { type: Number },
  dec_amount: { type: Number },
  RR_amount: { type: Number },

  settlement_fee_amount: { type: Number },

  eur_no_of_refund: { type: Number },
  usd_no_of_refund: { type: Number },
  eur_refund_amount: { type: Number },
  usd_refund_amount: { type: Number },
  eur_no_of_chargeback: { type: Number },
  usd_no_of_chargeback: { type: Number },
  eur_chargeback_amount: { type: Number },
  usd_chargeback_amount: { type: Number },

  total_refund_amount: { type: Number },
  total_chargeback_amount: { type: Number },

  settlement_vol: { type: Number },
  date_settled: { type: String },
  status: { type: String, default: "Pending" },
  note: { type: String },
});

settlementtableSchema.pre("save", async function (next) {
  try {
    // Find the maximum `report_number` for the given `client_id`
    const lastRecord = await Settlementtable.aggregate([
      { $match: { client_id: this.client_id } },
      {
        $addFields: {
          reportNumber: {
            $substr: [
              "$report_id",
              { $subtract: [{ $strLenCP: "$report_id" }, 2] },
              2,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$client_id",
          maxReportNumber: { $max: { $toInt: "$reportNumber" } },
        },
      },
    ]);

    // Calculate the next report number based on the maximum found
    let nextReportNumber = 1; // Starting from 01 if no records found
    if (lastRecord.length > 0) {
      nextReportNumber = lastRecord[0].maxReportNumber + 1;
    }

    // Zero pad the report number
    const reportNumberPadded = nextReportNumber.toString().padStart(2, "0");

    // Concatenate client_id and reportNumberPadded to form the prefixed_id
    this.report_id = `${this.client_id}${reportNumberPadded}`;

    next(); // Proceed with saving the document
  } catch (err) {
    next(err); // Pass any errors to the next middleware
  }
});

const Settlementtable = mongoose.model(
  "Settlementtable",
  settlementtableSchema
);

module.exports = Settlementtable;
