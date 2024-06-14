const mongoose = require("mongoose");

const mintedSchema = mongoose.Schema(
  {
    contract: {
      type: String,
      required: true,
    },
    signature : {
      type : String,
      required : true,
    },
    transactionHash: {
      type: String,
      required: true,
    },
    ClientAddress: {
      type: String,
      required: true,
    },
    blockID: {
      type: String,
      required: true,
    },
    tokenID: {
      type: String,
      required: true,
    },
    ipfsHash : {
      type : String,
      required : false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("nftMinted",mintedSchema)
