const mongoose = require('mongoose');

const TokenExchangeContract = mongoose.Schema(
    {
        currentContract: {
            type: String,
            required: true,
        },
        currentContractPhase: {
            type: Number,
            required: true,
        },
        contractHistory: {
            type: [{
                address: {
                    type: String,
                    required: false,
                },
                phase: {
                    type: Number,
                    required: false
                },
            }],
        }
    },
    { timestamps: true },
);

module.exports = mongoose.model('ContractAddress', TokenExchangeContract)