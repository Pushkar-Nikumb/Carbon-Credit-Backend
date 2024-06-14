const mongoose = require('mongoose');

const depositTokensInVault = mongoose.Schema(
    {
        tokensDeposited: {
            type: Number,
            required: true,
        },
        transactionHash: {
            type: String,
            required: true,
        },
        tokenDepositOwner: {
            type: String,
            required: true,
        },
        vaultContract: {
            type: String,
            required: true,
        },
        currentPhase: {
            type: Number,
            required: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("tokensDeposited", depositTokensInVault);