const router = require('express').Router();
const DocumentUploaded = require('../model/documents')
const Organization = require('../model/organization')

const uploadDocument = async(body,organizationalID,req,res) => {
    const newDocument = new DocumentUploaded({
        PAN : body.PAN,
        TAN : body.TAN,
        EmissionReport : body.EmissionReport,
    })
    try{
        const saveDocument = await newDocument.save();
        console.log("documents uploaded : ",saveDocument)

        const updateOrganizationData = await Organization.findOneAndUpdate(
            {_id : organizationalID },
            {$set : {documentsUploaded : saveDocument._id}},
            {upsert : true, new : true}            
        )
        console.log(
            "Organizational Data successfully(Added Document-upload Reference):",
            updateOrganizationData
          );
        res.status(200).send({ success: true, message: updateOrganizationData });
    }catch(error){
    res.status(500).json({ success: false, message: error });
    }
}

router.post('/upload',async(req,res)=>{
    console.log(req.body)
    if(!req.body){
        res.status(500).send({success : false,message : "Data not received from CLient!"})
    }
    try{
        const orgDataExists = await Organization.findOne({
            _id: req.body.organizationalID,
          });
        if(orgDataExists){
            console.log("Organizational data Exists : ", orgDataExists._id);
            uploadDocument(req.body,orgDataExists._id,req,res);
        }
    }catch(error){
        return res.status(500).send({ success: false, message: error });
    }
})

module.exports = router