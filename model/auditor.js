const mongoose = require("mongoose");

const energyAuditorSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    metamask : {
      type : String,
      required : true,
    },
    sector : {
      type : String,
      required : true,
    },
    transactionHash : {
      type : String,
      required : true,
    }
  },
  { timestamps: true }
);
module.exports = mongoose.model("EnergyAuditor", energyAuditorSchema);
