const router = require("express").Router();
const abi = require("../ABI/CarbonCreditABIv1.json");
const Web3 = require("web3");

const LocalWeb3 = new Web3(`https://polygon-amoy.infura.io/v3/${process.env.IPFS_API_KEY}`);
const infuraInstance = new LocalWeb3.eth.Contract(abi, process.env.CARBON_CREDIT_CONTRACT_ADDRESS);

router.post('/balance', async (req, res) => {
    console.log("BODY : ", req.body)
    if (!req.body) {
        res
            .status(500)
            .send({ success: false, message: "Data not received from CLient!" });
    }
    try {
        const balance = await infuraInstance.methods.balanceOf(req.body.metamask).call({ from: req.body.metamask })
        return res.status(200).send({ success: true, tokenBalance: balance / (10**18) })

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message })
    }
})

module.exports = router;