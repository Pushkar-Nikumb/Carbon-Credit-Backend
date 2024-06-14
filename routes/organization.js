const router = require("express").Router();
const Organization = require("../model/organization");
const users = require("../model/users");

const newOrganizationData = async (body, user_ID, req, res) => {
  const newOrganization = new Organization({
    sector: body.sector,
    subSector: body.subSector,
    organizationName: body.organizationName,
    yearOfEstablishment: body.yearOfEstablishment,
    email: body.email,
    address: {
      addressLine: body.address.addressLine,
      city: body.address.city,
      state: body.address.state,
      district: body.address.district,
      pinCode: body.address.pinCode,
    },
    contact: {
      mobile: body.contact.mobile,
    },
    registrationDetails: {
      PAN: body.registrationDetails.PAN,
      TAN: body.registrationDetails.TAN,
      GSTIN: body.registrationDetails.GSTIN,
    }
  });

  try {
    const saveOrganization = await newOrganization.save();
    console.log(saveOrganization);

    // Use `findOneAndUpdate` to get the updated document
    const updateUser = await users.findOneAndUpdate(
      { _id: user_ID },
      { $set: { organization: saveOrganization._id } },
      { upsert: true, new: true }
    );

    console.log("User updated successfully:", updateUser);
    res.status(200).send({ success: true, message: saveOrganization });
} catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};

router.post("/organization", async (req, res) => {
  console.log(req.body);
  if (!req.body) {
    res
      .status(500)
      .send({ success: false, message: "Data not received from CLient!" });
  }
  try {
    const userExists = await users.findOne({
      _id: req.body.userID,
    });
    if (userExists) {
      console.log("user Exists : ", userExists._id);
      newOrganizationData(req.body, userExists._id, req, res);
    } else {
      console.log("User does not Exist!, check for his/her userID correctly!");
    }
  } catch (error) {
    return res.status(500).send({ success: false, message: error });
  }
});
module.exports = router;
