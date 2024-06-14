const mongoose = require("mongoose");

const targetsSchema = new mongoose.Schema({
  emissionReductionTargets: {
    type: [{
      key: String,
      value: String,
    }],
  },
  turnover: {
    daily: Number,
    quarterly: Number,
    monthly: Number,
    annual: Number,
  },
});

module.exports = mongoose.model("Targets", targetsSchema);
