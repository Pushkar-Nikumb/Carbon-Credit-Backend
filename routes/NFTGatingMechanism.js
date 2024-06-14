const router = require('express').Router();
const abi = require('../ABI/NFTABIv2.json')
const abiv2 = require('../ABI/CarbonCreditABIv1.json')
const abiv3 = require('../ABI/TokenExchangeABIv1.json')
const Web3 = require('web3')
const nftMinted = require('../model/mintedNFT')
const users = require("../model/users");
const Organization = require('../model/organization');
const TokenExchangeContract = require('../model/Contracts');


const LocalWeb3 = new Web3(`https://polygon-amoy.infura.io/v3/${process.env.IPFS_API_KEY}`)
const infuraInstance = new LocalWeb3.eth.Contract(abi, process.env.CONTRACT_ADDRESS)
const infuraInstanceC2 = new LocalWeb3.eth.Contract(abiv2, process.env.CARBON_CREDIT_CONTRACT_ADDRESS);

router.post('/verifyNFT', async(req,res)=>{
    console.log(req.body)
    if(!req.body){
        res.status(500).send({success : false,message : "Data not received from CLient!"})
    }
    try{
        const userExists = await users.findOne({
            _id: req.body.userID
          });

          console.log("User Exists : ",userExists)
        if(userExists){
            const tokenID = req.body.tokenID;
            const blockNumber = req.body.blockNumber;
            const checkTokenCount = await infuraInstance.methods.tokenCount().call({from : process.env.OWNER_ACCOUNT_PUBLIC_KEY})
            console.log("Token ID : ",checkTokenCount)
            if(req.body.tokenID > Number(checkTokenCount) && Number(checkTokenCount) !== 0){
                return res.status(500).send({ success: false, message: "Token Count Exceeded!" });
            } 
            const checkOwnership = await infuraInstance.methods.checkOwnershipAtPointInTime(tokenID,blockNumber).call({from : process.env.OWNER_ACCOUNT_PUBLIC_KEY});
            console.log("checkOwnership : ",checkOwnership)
            console.log("USer METAMASK : ",userExists.metamask)
            if(checkOwnership.toLowerCase() === userExists.metamask.toLowerCase()){
                console.log("In verify Organization using NFT gating mechanism section of api...")
                const currentContractAddress = await TokenExchangeContract.findById({ _id: "660ad453bfe6dccded4e51da" });
                const infuraInstanceC3 = new LocalWeb3.eth.Contract(abiv3,currentContractAddress.currentContract); //make sure to dynamically fetch the contract address from the database => updated!

                const OrgExists = await Organization.findOne({_id : userExists.organization});
                const nftMintedExist = await nftMinted.findOne({_id  : OrgExists.certificate});
                const fetchNFT = await infuraInstance.methods.tokenURI(tokenID).call({from : process.env.OWNER_ACCOUNT_PUBLIC_KEY});
                const fetchBalance = await infuraInstanceC2.methods.balanceOf(userExists.metamask).call({from : process.env.OWNER_ACCOUNT_PUBLIC_KEY});

                const fetchCurrentPhase = await infuraInstanceC3.methods.currentPhase().call({from : process.env.OWNER_ACCOUNT_PUBLIC_KEY});
                const fetchRegistrationEndTimeByPhase = await  infuraInstanceC3.methods.registrationEndTimeByPhase(fetchCurrentPhase).call({from : process.env.OWNER_ACCOUNT_PUBLIC_KEY});
                const windowOpen = Date.now() <= Number(fetchRegistrationEndTimeByPhase) ? false : true

            return res.status(200).send({success : true, message :{validationMessage :  `ORGANIZATION IS VERIFIED ENTITY`, NFTHASH : fetchNFT, NftMintedHash : nftMintedExist.transactionHash, tokenBalance : fetchBalance / (10 ** 18), registrationEndTimstamp : Number(fetchRegistrationEndTimeByPhase), currentPhase : fetchCurrentPhase, windowOpen :windowOpen, TokenExchangeContract : currentContractAddress.currentContract} });
            }else{
            return res.status(500).send({success : false, message : `ORGANIZATION IS NOT VERIFIED ENTITY` });
            }
          } 

    }catch(error){
        return res.status(500).send({ success: false, message: error });
    }
})

module.exports = router;