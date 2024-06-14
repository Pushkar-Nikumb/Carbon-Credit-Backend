const router = require("express").Router();
const users = require("../model/users");
const EnergyAuditor = require("../model/auditor");
// const bcrypt = require("bcrypt");
const { createHash } = require('crypto')

router.post("/register", async (req, res) => {
  console.log(req.body);
  if (!req.body) {
    res
      .status(500)
      .send({ success: false, message: "Data not received from CLient!" });
  }
  try {
    const emailExists = await users.findOne({
      email: req.body.email,
    });
    const metamaskExists = await users.findOne({
      metamask: req.body.metamask,
    });
    if (emailExists) {
      return res.status(500).json({
        success: false,
        message: "Email already exists. Please use a different email.",
      });
    }

    if (metamaskExists) {
      return res.status(500).json({
        success: false,
        message:
          "Metamask account already exists. Please use a different Metamask account.",
      });
    }
    // const hashedPassword = await bcrypt.hash(req.body.password, 15);
    const hashedPassword = createHash('sha256').update(req.body.password).digest('hex');
    console.log("in user registration api!");
    const newUser = new users({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      metamask: req.body.metamask,
      role: req.body.role,
    });
    try {
      const saveUser = await newUser.save();
      console.log(saveUser);
      if (req.body.role === 'Auditor') {
        const AuditorExists = await EnergyAuditor.findOne({
          _id: req.body.AuditorID
        })
        if(AuditorExists){
          console.log("In Auditor Registeration Section...")
          const referenceAuditor = await users.findOneAndUpdate(
            {_id : saveUser._id},
            { $set : {auditor : AuditorExists._id }},
            { upsert: true, new: true }
          )
            console.log("Auditor Registered : ", referenceAuditor);
            return res.status(200).send({ success: true, message: referenceAuditor });      
        }else{
          return res.status(500).send({ success: true, message: "Auditor Does Not Exist!" });
        }
      }
      return res.status(200).send({ success: true, message: saveUser });
    } catch (error) {
      return res.status(500).send({ success: false, message: error });
    }
  } catch (error) {
    return res.status(500).send({ success: false, message: error });
  }
});

module.exports = router;
