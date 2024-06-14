const router = require("express").Router();

const Organization = require("../model/organization");

router.post("/fetchOrgCount", async (req, res) => {
  try {
    const totalCount = await Organization.countDocuments();
    const nftMintedCount = await Organization.countDocuments({ nftMinted: true });

    res.status(200).json({ status: true, count: totalCount, mintCount : nftMintedCount }); // Send the response back to the client
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
});

module.exports = router;
