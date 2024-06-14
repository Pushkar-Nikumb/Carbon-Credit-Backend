const router = require('express').Router();
const Sector = require("../model/sector");

router.post('/fetchAll', async (req, res) => {
    try {
        console.log("in Fetch All Sectors API Section...")
        const response = await Sector.find({}).exec();
        return res.status(200).send({ success: true, sectors: response });
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
})
module.exports = router;