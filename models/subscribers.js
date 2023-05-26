const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// creating user schema
const subscribersSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("subscriber", subscribersSchema);
