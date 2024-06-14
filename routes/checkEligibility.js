const router = require('express').Router()
const abi = require('../ABI/CarbonCreditABIv1.json')
const Web3 = require('web3')

const LocalWeb3 = new Web3(`https://polygon-amoy.infura.io/v3/${process.env.IPFS_API_KEY}`);
const infuraInstance = new LocalWeb3.eth.Contract(abi, process.env.CARBON_CREDIT_CONTRACT_ADDRESS);

router.post('/checkEligibility', async(req,res)=>{
    console.log(req.body)
    if (!req.body) {
        res.status(500).send({ success: false, message: "Data not received from Client!" })
    }
    try{

        const checkEligibility = await infuraInstance.methods.checkOwnerTokenBalanceAndOrganizationEligibility(req.body.OrgMetamaskAddress, 0).call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY });
        const response = {
            "TokensToGrant" : checkEligibility[0] / 1000,
            "EligibleToGrantToken" : checkEligibility[1]
        }

        return res.status(200).send({success : true, message : response});

    }catch(error){
        return res.status(500).send({ success: false, message: error.message });
    }
})

module.exports = router;