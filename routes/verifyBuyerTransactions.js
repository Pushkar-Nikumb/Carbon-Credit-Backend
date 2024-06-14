const router = require('express').Router();
const Organization = require('../model/organization');
const users = require("../model/users");

const updateVerifyBuyerTransaction = async (buyerOrganizationId, sellerOrganizationId, buyerAddress, transactionHash, sellerAddress, phase, res) => {
    try {
        // Check if buyer organization exists
        const buyerOrganization = await Organization.findById(buyerOrganizationId);
        if (!buyerOrganization) {
            return res.status(404).json({ success: false, message: "Buyer organization not found" });
        }

        // Check if seller organization exists
        const sellerOrganization = await Organization.findById(sellerOrganizationId);
        if (!sellerOrganization) {
            return res.status(404).json({ success: false, message: "Seller organization not found" });
        }

        // Update transaction data for the buyer
        const updatedBuyerOrganization = await Organization.findOneAndUpdate(
            { _id: buyerOrganizationId, "verifyBuyerTransaction.currentPhase": phase },
            { $push: { "verifyBuyerTransaction.$.verifiedTransaction": { sellerAddress, transactionHash } } },
            { new: true }
        );
        console.log("updated buyer organization:", updatedBuyerOrganization);


        if (!updatedBuyerOrganization) {
            // If buyer organization or phase not found, create a new entry for the phase
            const newBuyerOrganization = await Organization.findByIdAndUpdate(
                buyerOrganizationId,
                { $push: { verifyBuyerTransaction: { currentPhase: phase, verifiedTransaction: [{ sellerAddress, transactionHash }] } } },
                { new: true }
            );
            console.log("New buyer organization:", newBuyerOrganization);
        }

        // Update transaction data for the seller
        const updatedSellerOrganization = await Organization.findOneAndUpdate(
            { _id: sellerOrganizationId, "verifyBuyerTransaction.currentPhase": phase },
            { $push: { "verifyBuyerTransaction.$.verifiedTransaction": { buyerAddress, transactionHash } } },
            { new: true }
        );
        console.log("uPDATED seller organization:", updatedSellerOrganization);

        if (!updatedSellerOrganization) {
            // If seller organization or phase not found, create a new entry for the phase
            const newSellerOrganization = await Organization.findByIdAndUpdate(
                sellerOrganizationId,
                { $push: { verifyBuyerTransaction: { currentPhase: phase, verifiedTransaction: [{ sellerAddress, transactionHash }] } } },
                { new: true }
            );
            console.log("New seller organization:", newSellerOrganization);
        }

        return res.status(200).json({ success: true, message: "Transaction data stored successfully" });
    } catch (error) {
        console.error("Error updating transaction data:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

router.post('/storeverifiedTransactionData', async (req, res) => {
    try {
        const { buyerOrganizationId, buyerAddress, transactionHash, sellerAddress, phase } = req.body;
        console.log("buyerOrganizationId : ", buyerOrganizationId)
        console.log("buyerAddress : ", buyerAddress)
        console.log("transactionHash : ", transactionHash)
        console.log("sellerAddress : ", sellerAddress)
        console.log("phase : ", phase)
        if (!req.body) {
            return res.status(400).send({ success: false, message: "Data Not Received from Client!" });
        }

        const sellerOrganizationExists = await users.findOne({ metamask: { $regex: new RegExp('^' + sellerAddress + '$', 'i') } });

        if (sellerOrganizationExists) {
            console.log("Fetching Organizational ID from User Metamask Address...");
            console.log("Seller Organization: ", sellerOrganizationExists.organization);
            await updateVerifyBuyerTransaction(buyerOrganizationId, sellerOrganizationExists.organization, buyerAddress, transactionHash, sellerAddress, phase, res);
        } else {
            return res.status(404).send({ success: false, message: "User not found!" });
        }

    } catch (error) {
        console.error("Error storing transaction data:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
});

module.exports = router;
