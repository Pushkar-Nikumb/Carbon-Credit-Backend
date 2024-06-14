const mongoose = require("mongoose");

const sector = mongoose.Schema(
  {
    sector: {
      type: String,
      required: true,
    },
    benchmark: {
      type: String,
      required: true,
    },
    contract: {
      type: String,
      required: true,
    },
    signature: {
      type: String,
      required: true,
    },
    transactionHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sector", sector);
