const mongoose = require("mongoose");

const documentUploadedSchema = new mongoose.Schema({
  PAN: String,
  TAN: String,
  EmissionReport : String
  // Add more document fields as needed
});

module.exports = mongoose.model("DocumentUploaded", documentUploadedSchema);
