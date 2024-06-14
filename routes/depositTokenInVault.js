const router = require('express').Router();
const depositTokens = require('../model/depositTokens');
const Organization = require('../model/organization');

router.post('/depositToken', async (req, res) => {
    console.log(req.body)
    if (!req.body) {
        res.status(500).send({ success: false, message: "Data not received from CLient!" })
    }
    try {
        const OrgExists = await Organization.findOne({
            _id: req.body.organizationalID
        });
        if (OrgExists) {

            console.log("in token deposit section...");
            try {
                const newDepositTokenData = new depositTokens({
                    tokensDeposited: req.body.tokensDeposited,
                    transactionHash: req.body.transactionHash,
                    tokenDepositOwner: req.body.tokenDepositOwner,
                    vaultContract: req.body.vaultContract,
                    currentPhase: req.body.currentPhase
                });

                const savedepositedTokenData = await newDepositTokenData.save();
                console.log("Token Deposited: ", savedepositedTokenData);

                const updateOrganizationData = await Organization.findOneAndUpdate(
                    { _id: req.body.organizationalID },
                    { $push: { tokenDeposited: { currentPhase: req.body.currentPhase, TokensDepositedID: savedepositedTokenData._id } } },
                    { upsert: true, new: true }
                )

                console.log("organizational Data updated SuccessFully(Referenced Token Deposit Transaction Data) : ", updateOrganizationData);

                return res.status(200).send({ success: true, message: "Token Deposited successfully in Vault." });
            } catch (error) {
                return res.status(500).send({ success: false, message: error });
            }

        } else {
            return res.status(500).send({ success: false, message: "Organization Doesn't Exists!" });
        }
    } catch (error) {
        return res.status(500).send({ success: false, message: error });
    }
})

module.exports = router;