const router = require('express').Router();
const abiv2 = require('../ABI/CarbonCreditABIv1.json')
const Web3 = require('web3')
const tokenApproval = require('../model/tokenExchange');
// const nftMinted = require('../model/mintedNFT')
// const users = require("../model/users");
const Organization = require('../model/organization');

// const LocalWeb3 = new Web3(`https://polygon-mumbai.infura.io/v3/${process.env.IPFS_API_KEY}`)
// const infuraInstanceC2 = new LocalWeb3.eth.Contract(abiv2, process.env.CARBON_CREDIT_CONTRACT_ADDRESS);

router.post('/approve', async (req, res) => {
    console.log(req.body.organizationalID)
    if (!req.body) {
        res.status(500).send({ success: false, message: "Data not received from CLient!" })
    }
    try {
        const OrgExists = await Organization.find(
           {"_id" :  req.body.organizationalID}
        );
        console.log("Org"+OrgExists)
        if (OrgExists) {
            console.log("In Token Approval Section...");
            try {
                const newTokenApprovalData = new tokenApproval({
                    VaultContract: req.body.VaultContract,
                    approveHash: req.body.approveHash,
                    tokensApproved: req.body.tokensApproved,
                    OrganizationMetamask: req.body.OrganizationMetamask,
                    currentPhase: req.body.currentPhase
                });

                const saveTokenApprovalTransaction = await newTokenApprovalData.save();
                console.log("Token Approval Data Added to Collection: ", saveTokenApprovalTransaction);

                // Push new object to tokenTransferApproval array
                const updateOrganizationData = await Organization.findOneAndUpdate(
                    { _id: req.body.organizationalID },
                    { $push: { tokenTransferApproval: { currentPhase: req.body.currentPhase, TokenTransferApproved: saveTokenApprovalTransaction._id } } },
                    { upsert: true, new: true }
                );

                console.log("organizational Data updated SuccessFully(Referenced Token Approval Transaction Data) : ", updateOrganizationData);

                return res.status(200).send({ success: true, message: "Token Transfer Permission Approved." });
            } catch (error) {
                return res.status(500).send({ success: false, message: error });
            }
        } else {
            return res.status(500).send({ success: false, message: "Organization Doesn't Exists!" });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ success: false, message: error });
    }
})

module.exports = router;