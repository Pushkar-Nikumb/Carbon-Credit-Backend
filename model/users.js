const mongoose = require("mongoose");
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password : {
      type : String,
      required : true
    },
    imageURL: {
      type: String,
      required: false,
    },
    userID: {
      type: String,
      required: false,
    },
    email_verified: {
      type: Boolean,
      required: false,
    },
    auth_time: {
      type: String,
      required: false,
    },
    metamask:{
      type: String,
      required:true
    },
    role : {
      type : String,
      required : true,
      default : 'user'
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    auditor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EnergyAuditor",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('users',userSchema)