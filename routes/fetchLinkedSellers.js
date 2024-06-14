const router = require('express').Router();
const Web3 = require('web3');
const abiv3 = require('../ABI/TokenExchangeABIv1.json');
const tokenAllotment = require('../model/AllocateToken');
const TokenExchangeContract = require('../model/Contracts');

const LocalWeb3 = new Web3(`https://polygon-amoy.infura.io/v3/${process.env.IPFS_API_KEY}`)

router.post('/linkedSellers', async (req, res) => {
    console.log(req.body);
    if (!req.body) {
        return res.status(500).send({ success: false, message: "Data not received from Client!" });
    }

    try {
        const currentContractAddress = await TokenExchangeContract.findById({ _id: "660ad453bfe6dccded4e51da" });
        const infuraInstanceC3 = new LocalWeb3.eth.Contract(abiv3,currentContractAddress.currentContract); //make sure to dynamically fetch the contract address from the database => updated!

        const currentPhase = await infuraInstanceC3.methods.currentPhase().call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY });
        const buyerExists = await infuraInstanceC3.methods.isBuyerRegistered(currentPhase, req.body.buyerAddress).call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY });
        try {
            if (buyerExists) {
                const PhaseExists = await tokenAllotment.findOne({ "phase": currentPhase });
                if (PhaseExists) {
                    console.log(`Phase ${currentPhase} trnsactions are processed...`);
                    console.log("In Finding Linked Sellers To Buyers Section...");
                    const buyerData = PhaseExists.mappingsJSON.find(item => item.buyerAddress.toLowerCase() === req.body.buyerAddress.toLowerCase());
                    if (buyerData) {
                        console.log("Buyer Data:", buyerData);
                        // console.log("Linked Seller Data:", buyerData.sellerMapping);
                        return res.status(200).send({ success: true, message: buyerData, currentPhase : currentPhase});
                    } else {
                        return res.status(500).send({ success: false, message: `Buyer Not Found In Database` });
                    }

                } else {
                    return res.status(500).send({ success: false, message: `Phase : ${currentPhase} does Not Exist!` });
                }
            }
            else {
                return res.status(500).send({ success: false, message: `The buyer is not currently registered to purchase tokens in Phase ${currentPhase}` });
            }
        } catch (error) {
            return res.status(500).send({ success: false, message: error.message });
        }
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
});


module.exports = router;
