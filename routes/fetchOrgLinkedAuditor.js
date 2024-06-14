const router = require('express').Router()
// const EnergyAuditor = require("../model/auditor");
const users = require("../model/users");
const Organization = require("../model/organization");
const emissions = require('../model/emissions');

router.post('/fetchLinkedOrganizations', async (req, res) => {
    console.log(req.body);
    if (!req.body) {
        res
            .status(500)
            .send({ success: false, message: "Data not received from CLient!" });
    }
    try {
        const UserAuditorExists = await users.findOne({
            _id: req.body.userAuditorID
        });
        if(UserAuditorExists){
            console.log('In Organization Linked to Auditor Fetch API...')
            const isAuditorLinked = UserAuditorExists.auditor;
            if(isAuditorLinked){
                const fetchOrganizations = await Organization.find({energyAuditor : UserAuditorExists.auditor}).exec()
                // const OrgEmissions = await Organization.find({emissions: { $exists: true }}).exec();
                const OrganizationalCount = await Organization.countDocuments({energyAuditor : UserAuditorExists.auditor}).exec()
                console.log(fetchOrganizations)
                console.log("linked Organizational Count : ", OrganizationalCount)
            return res.status(200).send({ success: true,  LinkedOrganizationalCount : OrganizationalCount , message: fetchOrganizations });
            }else{
        return res.status(500).send({ success: false, message: `Auditor ID is not Linked!` });
            }
        }else{
        return res.status(500).send({ success: false, message: `User with ID : ${req.body.userAuditorID} doesn't Exist!` });
        }

    } catch (error) {
        return res.status(500).send({ success: false, message: error });
    }
})
module.exports = router