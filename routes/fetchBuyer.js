const router = require('express').Router();
const Web3 = require('web3');
const abiv3 = require('../ABI/TokenExchangeABIv1.json');
const TokenExchangeContract = require('../model/Contracts');

const LocalWeb3 = new Web3(`https://polygon-amoy.infura.io/v3/${process.env.IPFS_API_KEY}`)

router.get('/fetchAddress', async (req, res) => {
    try {
        console.log("In Fetching Buyers Address from Currently Deployed Token Exchange Contract...")
        const currentContractAddress = await TokenExchangeContract.findById({ _id: "660ad453bfe6dccded4e51da" });

        const infuraInstanceC3 = new LocalWeb3.eth.Contract(abiv3, currentContractAddress.currentContract); //make sure to dynamically fetch the contract address from the database

        const response = await infuraInstanceC3.methods.processTokenExchange().call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY });
        const currentPhase = await infuraInstanceC3.methods.currentPhase().call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY });

        let buyerAddresses = response['1'];

        if(buyerAddresses){
            console.log("Buyers : ", buyerAddresses);
        }

        res.status(200).send({ success: true, message: { buyers: buyerAddresses, currentPhase: Number(currentPhase), TokenExchangeAddress: currentContractAddress.currentContract } });
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
})

module.exports = router;