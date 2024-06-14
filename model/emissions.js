const mongoose = require('mongoose');

const OrganizationalEmissionsSchema = new mongoose.Schema({
    emissions: [{
        product: {
            type: String,
            required: true
        },
        emission: {
            type: Number,
            required: true
        },
        production: {
            type: Number,
            required: true
        },
    }],
    auditor: {
        type: mongoose.Schema.Types.ObjectId, // Assuming auditor is another document in MongoDB
        ref: 'energyAuditor', // This should match the model name of the auditor
        required: true,
    },
    transactionHash: {
        type: String,
        // Not required by default, no need to explicitly state unless you want to make a point of it
    },
    totalEmission: {
        type: Number,
        required: true,
    },
    totalProduction: {
        type: Number,
        required: true,
    },
    eligibleForToken : {
        type : Boolean,
        default : false,
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Compile model from schema
module.exports = mongoose.model('OrganizationalEmissions', OrganizationalEmissionsSchema);
