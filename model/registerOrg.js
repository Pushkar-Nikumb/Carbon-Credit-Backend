const mongoose = require('mongoose')

const RegisterOrg = new mongoose.Schema({
    metamask: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    head: {
        type: String,
        required: true
    },
    sector: {
        type: String,
        required: true
    },
    benchmark: {
        type: String,
        required: true
    },
    transactionHash: {
        type: String,
        required: true
    }
},
    { timestamps: true }
);

module.exports = mongoose.model("OrgRegister", RegisterOrg);

