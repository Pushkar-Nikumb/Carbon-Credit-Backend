const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define schema for seller mapping
const SellerMappingSchema = new Schema({
    sellerAddress: String,
    remainingTokens: String,
});

// Define schema for buyer-seller mapping
const BuyerSellerMappingSchema = new Schema({
    buyerAddress: String,
    requirementsFulfilled: String,
    sellerMapping: {
        type: Map,
        of: String 
    },
    remainingRequirement: String 
});

// Define schema for the entire data structure
const DataSchema = new Schema({
    phase: {
        type: Number,
        required: true
    },
    mappingsJSON: [BuyerSellerMappingSchema],
    mappingsRemainingToken: [SellerMappingSchema]
});

module.exports = mongoose.model('tokenAllotment', DataSchema);
