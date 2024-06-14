const router = require('express').Router()
const Targets = require('../model/targets')
const Organization = require("../model/organization");

const newTargetData = async(body,organizationalID,req,res) =>{
    const newTarget = new Targets({
        emissionReductionTargets : body.emissionReductionTargets,
        turnover : {
            daily : body.turnover.daily,
            quarterly : body.turnover.quarterly,
            monthly : body.turnover.monthly,
            annual : body.turnover.annual,
        },
    })

    try{
        const saveTarget = await newTarget.save();
        console.log("SAved Successfully : ",saveTarget)
        
        const updateOrganizationData = await Organization.findOneAndUpdate(
            {_id : organizationalID },
            {$set : {targets : saveTarget._id}},
            {upsert : true, new : true}            
        )
        console.log(
            "Organizational Data successfully(Added Target Reference):",
            updateOrganizationData
          ); 
        res.status(200).send({ success: true, message: updateOrganizationData });
    }catch(error){
    res.status(500).json({ success: false, message: error });
    }

}

router.post('/target', async(req,res) =>{
    console.log(req.body);
  if (!req.body) {
    res
      .status(500)
      .send({ success: false, message: "Data not received from Client!" });
  }
  try{
    const orgDataExists = await Organization.findOne({
        _id: req.body.organizationalID,
      });
    if(orgDataExists){
        console.log("Organizational data Exists : ", orgDataExists._id);
        newTargetData(req.body,orgDataExists._id,req,res)
    }else{
    return res.status(500).send({ success: false, message: "error: Org ID Invalid!" });
    }

  }catch(error){
    return res.status(500).send({ success: false, message: error });
  }
})

module.exports = router