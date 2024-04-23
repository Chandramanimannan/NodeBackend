const mongoose = require("mongoose");

const settlementtableSchema = new mongoose.Schema({
  client_id: { type: Number, required: true },
  company_name: { type: String, required: true },
  report_id: { type: String, unique: true },
  fromDate: { type: String },
  toDate: { type: String },
  total_vol: { type: Number },
  eur_app_count: { type: Number, default: 0 },
  eur_dec_count: { type: Number, default: 0 },
  usd_app_count: { type: Number, default: 0 },
  usd_dec_count: { type: Number, default: 0 },
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

const Settlementtable = mongoose.model(
  "Settlementtable",
  settlementtableSchema
);

module.exports = Settlementtable;
