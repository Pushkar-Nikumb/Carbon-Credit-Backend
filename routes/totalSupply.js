const router = require('express').Router()
const abi = require('../ABI/CarbonCreditABIv1.json');
const Web3 = require('web3');

const LocalWeb3 = new Web3(`https://polygon-amoy.infura.io/v3/${process.env.IPFS_API_KEY}`);
const infuraInstance = new LocalWeb3.eth.Contract(abi, process.env.CARBON_CREDIT_CONTRACT_ADDRESS);


router.post('/totalSupply', async (req, res) => {
    try {
        const totalSupply = await infuraInstance.methods.totalSupply().call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY })
        const balanceOf = await infuraInstance.methods.balanceOf(process.env.OWNER_ACCOUNT_PUBLIC_KEY).call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY })
        const mintingStatus = await infuraInstance.methods.paused().call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY })
        res.status(200).send({ success: true, message: totalSupply, balance : balanceOf, MintingStatus : mintingStatus })
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
})
module.exports = router;
