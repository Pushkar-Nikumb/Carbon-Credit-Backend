const mongoose = require('mongoose');

const buyCarbonCreditTokens = mongoose.Schema(
    {
        tokensToBuy: {
            type: Number,
            required: true,
        },
        transactionHash: {
            type: String,
            required: true,
        },
        vaultContract: {
            type: String,
            required: true,
        },
        BuyerAddress: {
            type: String,
            required: true,
        },
        currentPhase: {
            type: Number,
            required: true,
        },
        LinkedSellers: [{
            BuyerAddress: {
                type: String,
                required: false,
            },
            sellerAddress: {
                type: String,
                required: false
            },
            transactionHash: {
                type: String,
                required: false,
            }
        }],
        totalEthersPaid: {
            type: Number,
            default: 0,
            required: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("tokenBuyRequest", buyCarbonCreditTokens);