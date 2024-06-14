const router = require('express').Router();
const abi = require('../ABI/NFTABIv2.json')
const Web3 = require('web3')
const nftMinted = require('../model/mintedNFT')
const Organization = require('../model/organization')
require('dotenv').config()

const LocalWeb3 = new Web3(`https://polygon-amoy.infura.io/v3/${process.env.IPFS_API_KEY}`)
const infuraInstance = new LocalWeb3.eth.Contract(abi,process.env.CONTRACT_ADDRESS)

const sendTransaction = async (sender, data, privateKey) => {
    console.log("In send Transaction Function!")
    const nonce = await LocalWeb3.eth.getTransactionCount(sender);
    const gasPrice = await LocalWeb3.eth.getGasPrice();
    const gasLimit = 3000000; // Adjust as needed
  
    const tx = {
      nonce,
      from: sender,
      to: process.env.CONTRACT_ADDRESS,
      gasPrice,
      gasLimit,
      data,
    };
    console.log(nonce)
    const signedTx = await LocalWeb3.eth.accounts.signTransaction(tx, privateKey);
    try {
      const receipt = await LocalWeb3.eth.sendSignedTransaction(signedTx.rawTransaction);
      const events = await infuraInstance.getPastEvents('allEvents', {
          fromBlock: receipt.blockNumber,
          toBlock: receipt.blockNumber,
        });
      
        //console.log('Emitted events:', events);
        return(events);
      } catch (error) {
      console.error('Transaction error:', error);
    }
  };

  const newMintedData = async (body, organizationalID, req, res) =>{
    const newNftMinted = new nftMinted({
        contract : body.contract,
        signature : body.signature,
        transactionHash : body.transactionHash,
        ClientAddress : body.ClientAddress,
        blockID : body.blockID,
        tokenID : body.tokenID,
    })

    try{
      const saveNftMintedData = await newNftMinted.save();
      console.log("Transaction Data(mintNFT function) Saved Successfully : ", saveNftMintedData )

      const updateOrganizationData = await Organization.findOneAndUpdate(
        {_id : organizationalID },
        {$set : {certificate : saveNftMintedData._id, nftMinted : true}},
        {upsert : true, new : true}            
    )
    console.log(
      "Organizational Data successfully(Added NFT Minted Transaction Reference):",
      updateOrganizationData
    ); 
    res.status(200).send({ success: true, message: updateOrganizationData });
    }catch(error){
    res.status(500).json({ success: false, message: error });
    }
  }

  router.post('/mint-certificate',async(req,res)=>{
    console.log(req.body)
    if(!req.body){
        res.status(500).send({success : false,message : "Data not received from CLient!"})
    }
    try{
        const client = req.body.clientAddress;
        const hash = req.body.IpfsHash;
        // console.log("client : ",client)
        // console.log("hash : ",hash)
        const mintFunction = await infuraInstance.methods.mintNFT(client,hash).encodeABI();
        // console.log("mintFunction : ", mintFunction)
        const result = await sendTransaction(process.env.OWNER_ACCOUNT_PUBLIC_KEY, mintFunction, process.env.OWNER_ACCOUNT_PRIVATE_KEY)
        console.log(result);
        const nftMintedEvent = result.find(log => log.event === 'NFTMinted')
        const mintedEventData = nftMintedEvent ? {
            contract : nftMintedEvent.address,
            signature : nftMintedEvent.signature,
            transactionHash : nftMintedEvent.transactionHash,
            ClientAddress : nftMintedEvent.returnValues['0'],
            blockID : nftMintedEvent.blockNumber,
            tokenID : nftMintedEvent.returnValues['2'],
        } : null

        const orgDataExists = await Organization.findOne({
          _id: req.body.organizationalID,
        });

        if(mintedEventData !== null){
          // console.log("In newmintedData try block")
          newMintedData(mintedEventData,orgDataExists._id,req,res)
        }else{
        return res.status(500).send({ success: false, message: "error : MFT MINTED EVENT EMPTY!" });
        }
    }catch(error){
        return res.status(500).send({ success: false, message: error });
    }
  })
  module.exports = router