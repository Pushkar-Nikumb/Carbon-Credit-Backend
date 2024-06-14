const router = require('express').Router();
const {verify} = require("jsonwebtoken");
const users = require("../model/users");
require('dotenv').config();


router.post('/userAuth', async (req, res) => {
    console.log("Token Exists : ", req.body.tokenExist)
    if (!req.body) {
        res
            .status(500)
            .send({ success: false, message: "Data not received from CLient!" });
    }
    if (req.body.tokenExist === true) { 
        try {
            const bearer = req.header("authorization");
            // console.log("bearer : ", bearer)
            if (true) {
                const token = bearer.split(' ')[1];
                console.log(bearer)
                const userTokenExists = verify(token, process.env.APP_SECRET)
                console.log("User Token  : ", userTokenExists)
                if (userTokenExists) { 
                    const userExists = await users.findOne({
                        _id: userTokenExists.id,
                      });
                  console.log("user Exists : ", userExists);
                    const response = {
                      id: userExists._id,
                      name: userExists.name,
                      email: userExists.email,
                      role: userExists.role
                    }

                    res.status(200).send({ success: true, message: response })
                  } else {
                    res.status(500).send({ success: false, message: "User Token has Expired!" })
                  }
     
            } else {
                res.status(500).send({ success: false, message: "Token Not Send to Server!" })
            }
        } catch (error) {
            res.status(500).send({ success: false, message: error.message })
        }
    }
}
)
module.exports = router;