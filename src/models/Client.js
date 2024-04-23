const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const clientSchema = new mongoose.Schema({
  company_name: { type: String, required: true, unique: true },
  merchant_id: { type: String },
  company_type: { type: String, required: true },
  website_url: { type: String },
  company_email: { type: String, required: true, unique: true },
  city: String,
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  acquirer_name: String,
  last_settled_date: { type: String },
  currency: {
    type: [String],
    required: true, // Optional: whether the field is required
    validate: {
      validator: function (v) {
        return Array.isArray(v); // Ensure the field is an array
      },
    },
  },
});

clientSchema.plugin(AutoIncrement, { inc_field: "client_id", start_seq: 24 });

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
