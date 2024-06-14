const router = require('express').Router();
const tokenBuy = require('../model/tokenBuy');
const Organization = require('../model/organization');

router.post('/buy', async(req,res)=>{
    console.log(req.body)
    if (!req.body) {
        res.status(500).send({ success: false, message: "Data not received from CLient!" })
    }
    try{
        const OrgExists = await Organization.findOne({
            _id: req.body.organizationalID
        });
        if(OrgExists){

            console.log("in token buy section...");
            const newBuyTokenData = new tokenBuy({
                tokensToBuy : req.body.tokensToBuy,
                transactionHash : req.body.transactionHash,
                vaultContract : req.body.vaultContract,
                BuyerAddress : req.body.BuyerAddress,
                currentPhase : req.body.currentPhase
            });

            const saveBuyTokenData = await newBuyTokenData.save();
            console.log("Token Buy Data Saved : ", saveBuyTokenData);

            const updateOrganizationData = await Organization.findOneAndUpdate(
                { _id: req.body.organizationalID },
                { $push: { registerTokenBuy : { currentPhase : req.body.currentPhase , registerTokenBuyID : saveBuyTokenData._id} } },
                { upsert: true, new: true }
            )

            console.log("organizational Data updated SuccessFully(Referenced Token Buy Transaction Data) : ", updateOrganizationData);
            
            return res.status(200).send({ success: true, message: "Registeration Token Buy Request Successfully." });
        }else{
            return res.status(500).send({ success: false, message: "Organization Doesn't Exists!" });
        }

    }catch(error){
        return res.status(500).send({ success: false, message: error });
    }
})

module.exports = router;