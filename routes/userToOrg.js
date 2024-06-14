const router = require('express').Router();
const users = require("../model/users");


router.post('/getOrganizationalIDFromUserID', async(req,res)=>{
    console.log("BODY : ", req.body)
    if (!req.body) {
        res
            .status(500)
            .send({ success: false, message: "Data not received from CLient!" });
    }
    try{
        const userExists = await users.findOne({
            _id: req.body.userID
          });
          if(userExists){
            return res.status(200).send({success : true, orgID : userExists.organization});
          }else{
            return res.status(500).send({success : false, message : "USer DOesn't Exists!"});
          }
    }catch(error){
        res.status(500).send({ success: false, message: error.message })
    }
})

module.exports=  router;