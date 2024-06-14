const router = require("express").Router();
const users = require("../model/users");

router.post("/metamask", async (req, res) => {
  console.log("Request BODy in fetch metamask APi : ",req.body);
  if (!req.body) {
    res
      .status(500)
      .send({ success: false, message: "Data not received from CLient!" });
  }
  try {
    users.findOne({ organization: req.body.organizationalID })
    .exec(async(err, user) => {
        if (err) {
            return res.status(500).send({ success: false, message: err });
        } else {
            if (user) {
                const userId = user._id; // Fetch the user ID
                console.log('User found with ID:', userId);
                const userExists = await users.findOne({
                  _id : userId  
                  });
                  if(userExists){
                    return res.status(200).send({success : true, message : userExists})
                  }
            } else {
                return res.status(500).send({ success: false, message: err });
            }
        }
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: error });
  }
});
module.exports = router