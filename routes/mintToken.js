const router = require('express').Router()
const abi = require('../ABI/CarbonCreditABIv1.json')
const Web3 = require('web3')
require('dotenv').config()

const LocalWeb3 = new Web3(`https://polygon-amoy.infura.io/v3/${process.env.IPFS_API_KEY}`);
const infuraInstance = new LocalWeb3.eth.Contract(abi, process.env.CARBON_CREDIT_CONTRACT_ADDRESS);

const sendTransaction = async (sender, data, privateKey) => {
    console.log("In send Transaction Function!")
    const nonce = await LocalWeb3.eth.getTransactionCount(sender);
    const gasPrice = await LocalWeb3.eth.getGasPrice();
    const gasLimit = 3000000; // Adjust as needed

    const tx = {
        nonce,
        from: sender,
        to: process.env.CARBON_CREDIT_CONTRACT_ADDRESS,
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
        return (events);
    } catch (error) {
        console.error('Transaction error:', error);
    }
};

router.post('/mintToken', async(req,res)=>{
    try{
        console.log(req.body);
        if (!req.body) {
            res.status(500).send({ success: false, message: "Data not received from CLient!" });
        }
        const OwnerAccount = process.env.OWNER_ACCOUNT_PUBLIC_KEY;
        const TokenToMint = req.body.tokenToMint;

        const isMintingPaused = await infuraInstance.methods.paused().call({from : process.env.OWNER_ACCOUNT_PUBLIC_KEY})
        if(isMintingPaused){
            console.log("Minting PAused by Owner!!!")
            res.status(500).send({success : false, message : "Minting of Token is Paused, Owner must Unpause Minting!!!"})
        }else{
            console.log("In Token Minting Function...")
            // const decimal = await infuraInstance.methods.decimals().call({from : process.env.OWNER_ACCOUNT_PUBLIC_KEY})
            const mintTokenFunction = await infuraInstance.methods.mint(OwnerAccount,BigInt(TokenToMint * ( 10 ** 18))).encodeABI();
            const result = await sendTransaction(process.env.OWNER_ACCOUNT_PUBLIC_KEY, mintTokenFunction, process.env.OWNER_ACCOUNT_PRIVATE_KEY);

            console.log(result);
            res.status(200).send({success : true, message : result});
        }
    }catch(error){
        res.status(500).send({ success: false, message: error.message });
    }
})

module.exports = router;