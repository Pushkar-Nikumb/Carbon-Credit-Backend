const router = require('express').Router()
const users = require("../model/users");
const jwt = require('jsonwebtoken');
// const bcrypt = require("bcrypt");
const { createHash } = require('crypto')
require('dotenv').config();


router.post('/UserLogin', async (req, res) => {
  console.log("user login details", req.body.userMail)
  if (!req.body) {
    res
      .status(500)
      .send({ success: false, message: "Data not received from CLient!" });
  }
  try {

    const userExists = await users.findOne({
      email: req.body.userMail,
    });
    if (userExists) {
      console.log("user Exists : ", userExists._id);
      // const hashedPassword = await bcrypt.hash(req.body.password, 15);
      const hashPassword = createHash('sha256').update(req.body.password).digest('hex');
      console.log("HASH  : ", hashPassword)
      console.log("PASS  : ", userExists.password)
      if (userExists.password === hashPassword) {
        console.log("USer Login SuccessFully : ", userExists.name)

        // const response = {
        //     id : userExists._id,
        //     name : userExists.name,
        //     email : userExists.email,
        //     role : userExists.role
        // }
        const token = jwt.sign(
          {
            id: userExists._id
          },
          process.env.APP_SECRET,
          { expiresIn: "3 days" }
        )
        console.log(token);
        res.status(200).send({ success: true, message: token })
      } else {
        res.status(500).send({ success: false, message: "User Login/Password Incorrect!" })
      }
    } else {
      res.status(500).send({ success: false, message: "User does not Exist!, check for his/her userID correctly!" })
      console.log("User does not Exist!, check for his/her Mail correctly!");
    }

  } catch (error) {
    res.status(500).send({ success: false, message: error.message })
  }

})

module.exports = router