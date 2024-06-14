const router = require("express").Router();

const Organization = require("../model/organization");

router.post("/fetchData", async (req, res) => {
  try {
    const response = await Organization.find({}).exec(); // Use exec() to execute the query
    console.log(response);
    res.status(200).json(response); // Send the response back to the client
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
});

module.exports = router;
