const router = require('express').Router();
const TokenExchangeContract = require('../model/Contracts');

router.post('/addContractAddress', async (req, res) => {
    console.log(req.body);
    if (!req.body) {
        return res.status(500).send({ success: false, message: "Data not received from Client!" });
    }
    try {
        // Check if a contract with the same address already exists
        const contractExists = await TokenExchangeContract.findOne({ currentContract: req.body.currentlyDeployedContract });
        
        if (!contractExists) {
            console.log("Deploying a new contract...");

            // Find the current contract document (assuming you know its _id)
            const currentContractDocument = await TokenExchangeContract.findOne({ _id: "660ad453bfe6dccded4e51da" });

            // Update the current contract details
            currentContractDocument.currentContract = req.body.currentlyDeployedContract;
            currentContractDocument.currentContractPhase = req.body.currentlyDeployedContractPhase;

            // Push the current contract details to the contract history array
            currentContractDocument.contractHistory.push({
                address: req.body.currentlyDeployedContract,
                phase: req.body.currentlyDeployedContractPhase
            });

            // Save the updated document
            await currentContractDocument.save();

            console.log("New Contract Data : ", currentContractDocument);
            return res.status(200).send({ success: true, message: currentContractDocument });
        } else {
            return res.status(500).send({ success: false, message: "Contract already deployed!" });
        }
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
});

module.exports = router;
