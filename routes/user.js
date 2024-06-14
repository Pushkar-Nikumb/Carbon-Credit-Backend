const router = require('express').Router();
const e = require('express');
const admin =  require('../config/firebase.config');
const users = require('../model/users');

const newUserData = async (decodeValue,req,res) =>{
    //fill up the response data
    const newUser = new users({
        name: decodeValue.name,        
        email: decodeValue.email,
        imageURL: decodeValue.picture,
        userID: decodeValue.user_id,
        email_verified: decodeValue.email_verified,
        auth_time: decodeValue.auth_time,
        metamask : req.headers.metamask
    })
    try{
        //save data to the database!
        const saveUser = await newUser.save();
        res.status(200).send({user : saveUser})
    }catch(error){
        res.status(500).json({success : false, message : error})
    }
}

const updateUserData = async(decodeValue,req,res)=>{
    const filter = {userID : decodeValue.uid}
    const options = {
        upsert : true,
        new : true
    };

    try{
        const result = await users.findOneAndUpdate(filter,{auth_time : decodeValue.auth_time},options)
        console.log("updated Successfully!")
        res.status(200).send({user : result})
    }catch(error){
        res.status(500).json({success : false, message : error})
    }

}

router.get('/login',async(req,res) =>{
    console.log(req.headers.authorization)
    if(!req.headers.authorization){
        return res.status(500).send({message : "Invalid Token/Token Not Send"})
    }
    const token  = req.headers.authorization.split(" ")[1]
    try{
        const decodeValue = await admin.auth().verifyIdToken(token)
        console.log(decodeValue)
        if(!decodeValue){
            res.status(500).json({success : false, message : "Unauthorized user!"})
        }
        //save user in Database-> user schema
        //check if user already exists or Not!
        const user_ID = decodeValue.user_id;
        // const userExists = await users.findOne({userID : user_ID})
        if(true){ 
            console.log("In inserting new user section...",)

            newUserData(decodeValue,req,res);
            // res.send('Create new User ')
        }else{
            //if user already exist, update user
            console.log("In update Section!")
            updateUserData(decodeValue,req,res);
        }
    }catch(error){
        return res.status(500).send({success : false, message : error})
    }
})
module.exports = router;