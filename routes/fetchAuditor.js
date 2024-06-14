const router = require('express').Router();
const EnergyAuditor = require("../model/auditor");

router.post("/fetch_auditor", async (req, res) =>{
    console.log(req.body)
    if(!req.body){
        res.status(500).send({success : false,message : "Data not received from CLient!"})
    }
    try{
        const auditExists = await EnergyAuditor.findOne({
            registrationNumber: req.body.registrationNumber,
          });
          if (auditExists) {
            console.log("Auditor Exists : ", auditExists._id)
            return res.status(200).send({ success: true, message: auditExists });
          } else {
            console.log("User does not Exist!, check for his/her userID correctly!");
            return res.status(500).send({ success: false, message: `User with Registration ID ${req.body.registrationNumber} doesn't Exists, Give correct Registration Number ` });
          }
    }catch(error){
        return res.status(500).send({ success: false, message: error });
    }
})
module.exports = router