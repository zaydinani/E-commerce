const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// creating user schema
const sellersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  products: [
    {
      name: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
    },
  ],
});

module.exports = mongoose.model("sellers", sellersSchema);
