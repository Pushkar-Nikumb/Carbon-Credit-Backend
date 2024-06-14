const router = require("express").Router();
const Organization = require("../model/organization");
const EnergyAuditor = require("../model/auditor");

router.post("/reference_auditor", async (req, res) => {
  console.log(req.body);
  if (!req.body) {
    res
      .status(500)
      .send({ success: false, message: "Data not received from Client!" });
  }
  try {
    const auditExists = await EnergyAuditor.findOne({
      registrationNumber: req.body.registrationNumber,
    });
    const orgDataExists = await Organization.findOne({
      _id: req.body.organizationalID,
    });

    if (!auditExists && !orgDataExists) {
      // If both the auditor and organizational data don't exist
      return res
        .status(500)
        .send({
          success: false,
          message: `Invalid Energy Auditor Number and Organizational ID`,
        });
    }

    if (!auditExists) {
      // If only the auditor doesn't exist
      return res
        .status(500)
        .send({
          success: false,
          message: `Invalid Energy Auditor Number : ${req.body.registrationNumber}`,
        });
    }

    if (!orgDataExists) {
      // If only the organizational data doesn't exist
      return res
        .status(500)
        .send({
          success: false,
          message: `Invalid Organizational ID :  ${req.body.organizationalID}`,
        });
    }

    console.log("Auditor Exists : ", auditExists._id);
    console.log("Organizational data Exists : ", orgDataExists._id);

    const updateOrganizationData = await Organization.findOneAndUpdate(
      { _id: orgDataExists._id },
      { $set: { energyAuditor: auditExists._id } },
      { upsert: true, new: true }
    );

    console.log(
      "Organizational Data successfully(Added Auditor Reference):",
      updateOrganizationData
    );

    res.status(200).send({ success: true, message: updateOrganizationData });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
});

module.exports = router;
