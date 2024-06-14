const mongoose = require('mongoose')

const tokenTradingPlatform = mongoose.Schema(
    {
        VaultContract: {
            type: String,
            required: true,
        },
        approveHash: {
            type: String,
            required: true,
        },
        tokensApproved: {
            type: Number,
            required: true,
        },
        OrganizationMetamask: {
            type: String,
            required: true,
        },
        currentPhase: {
            type: Number,
            required: false,
        }
    },
    { timestamps: true })

module.exports = mongoose.model("tokenApproval",tokenTradingPlatform)