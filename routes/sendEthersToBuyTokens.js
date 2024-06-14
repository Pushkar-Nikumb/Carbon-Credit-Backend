const router = require('express').Router();
const tokenBuy = require('../model/tokenBuy');

router.post('/sendEthersToContract', async(req,res)=>{
    console.log(req.body)
    if (!req.body) {
        return res.status(500).send({ success: false, message: "Data not received from CLient!" })
    }
    try{
        const tokenbuyExists = await tokenBuy.findOne({BuyerAddress : req.body.BuyerAddress, currentPhase : req.body.currentPhase});
        if(tokenbuyExists){
            console.log("In Add Ether to Token Exchange Contract Wallet Transaction Section...")
            tokenbuyExists.totalEthersPaid += Number(req.body.totalEthersPaid);

            tokenbuyExists.LinkedSellers.push({
                BuyerAddress: req.body.BuyerAddress,
                sellerAddress : req.body.SellerAddress,
                transactionHash: req.body.transactionHash
            });
            await tokenbuyExists.save();
            console.log("DATA ADDED : ", tokenbuyExists);
            return res.status(200).send({ success: true, message: "Ethers sent and data updated successfully." });
        }else{
            return res.status(500).send({ success: false, message: "TokenBuy document not found." });
        }
    }catch(error){
        return res.status(500).send({ success: false, message: error.message });
    }
});

module.exports = router;