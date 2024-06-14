const router = require('express').Router();
const users = require("../model/users");

router.post('/fetchIDFromMetamask', async (req, res) => {
    if (!req.body || !req.body.metamask) {
        return res.status(400).send({ success: false, message: "Metamask address is missing in the request body!" });
    }

    try {
        const metamaskAddress = req.body.metamask; // Keep the provided Metamask address as is
        const userExists = await users.findOne({ metamask: { $regex: new RegExp('^' + metamaskAddress + '$', 'i') } });

        if (userExists) {
            console.log("Fetching Organizational ID from User Metamask Address...");
            console.log("User Organization: ", userExists.organization);
            return res.status(200).send({ success: true, organizationalID: userExists.organization });
        } else {
            return res.status(404).send({ success: false, message: "User not found!" });
        }
    } catch (error) {
        console.error("Error fetching user:", error.message);
        return res.status(500).send({ success: false, message: error.message });
    }
});

module.exports = router;
