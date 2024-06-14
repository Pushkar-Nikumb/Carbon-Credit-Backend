const router = require('express').Router();
const EnergyAuditor = require("../model/auditor");

router.post('/fetchAuditors',async (req,res)=>{
    try{
        console.log("in fetch all auditors api section")
        const response = await EnergyAuditor.find({}).exec();
    return res.status(200).send({ success: false, auditors: response });
    }catch(error){
    return res.status(500).send({ success: false, message: error.message });
    }
})
module.exports = router