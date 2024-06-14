const mongoose = require('mongoose');

const TokenMintingForEligibleOrganization = new mongoose.Schema({
    OrganizationName: {
        type: String,
    },
    OrganizationAddress: {
        type: String,
    },
    transactionHash: {
        type: String,
    },
    tokenMinted: {
        type: String,
    },
    emissionsSaved: {
        type: String,
    },
    timestamp: {
        type: String,
    },
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Compile model from schema
module.exports = mongoose.model('TokenTransfer', TokenMintingForEligibleOrganization);
