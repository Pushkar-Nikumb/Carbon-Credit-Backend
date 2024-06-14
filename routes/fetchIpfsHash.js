const router = require('express').Router()
const Web3 = require('web3')
const abi = require('../ABI/NFTABIv2.json')
const { route } = require('./user')
require('dotenv').config()

const LocalWeb3 = new Web3(`https://polygon-amoy.infura.io/v3/${process.env.IPFS_API_KEY}`)
const infuraInstance = new LocalWeb3.eth.Contract(abi,process.env.CONTRACT_ADDRESS)


router.post('/fetchIPFSHASH', async(req, res)=>{
    console.log(req.body)
    if(!req.body){
        res.status(500).send({success : false,message : "Data not received from CLient!"})
    }
    try{
        console.log(typeof(Number(req.body.tokenID)))
        const result =await  infuraInstance.methods.tokenURI(Number(req.body.tokenID)).call({from : process.env.OWNER_ACCOUNT_PUBLIC_KEY})
        if(result){
            console.log(result);
            return res.status(200).send({ success: true, message: result });
        }
    }catch(error){
        return res.status(500).send({ success: false, message: `error ${error.message}` });
    }
})

module.exports = router