const router = require('express').Router();
const Web3 = require('web3');
const abi = require('../ABI/CarbonCreditABIv1.json');

const LocalWeb3 = new Web3(`https://polygon-amoy.infura.io/v3/${process.env.IPFS_API_KEY}`);
const infuraInstance = new LocalWeb3.eth.Contract(abi, process.env.CARBON_CREDIT_CONTRACT_ADDRESS);

const createJSONObject = entry => {
    const timestamp = new Date(parseInt(entry[5]) * 1000); // Convert Unix timestamp to milliseconds

    // Extract day, month, year, hours, minutes, and seconds components
    const day = timestamp.getDate();
    const month = timestamp.getMonth() + 1; // Months are zero-based, so we add 1
    const year = timestamp.getFullYear() % 100; // Extract the last two digits of the year
    let hours = timestamp.getHours();
    const minutes = timestamp.getMinutes();
    const seconds = timestamp.getSeconds();

    // Determine AM or PM
    const amOrPm = hours < 12 ? 'AM' : 'PM';
    
    // Convert 24-hour format to 12-hour format
    if (hours > 12) {
        hours -= 12;
    } else if (hours === 0) {
        hours = 12;
    }

    // Ensure leading zeros for single-digit day, month, hours, minutes, and seconds
    const formattedDay = day < 10 ? '0' + day : day;
    const formattedMonth = month < 10 ? '0' + month : month;
    const formattedHours = hours < 10 ? '0' + hours : hours;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

    // Combine day, month, year, hours, minutes, seconds, and AM/PM into the desired format
    const formattedTimestamp = `${formattedDay}-${formattedMonth}-${year} ${formattedHours}:${formattedMinutes}:${formattedSeconds} ${amOrPm}`;

    return {
        phase: entry[0],
        orgAddress: entry[1],
        orgName: entry[2],
        tokensMinted: entry[3] / 1000000000000000000,
        emissionsSaved: entry[4] / 1000,
        timestamp: formattedTimestamp
    };
};



router.get('/History', async (req, res) => {
    try {
        // Fetch data
        const result = await infuraInstance.methods.getAllTokensMintedHistory().call();

        // Convert the result to JSON format
        const jsonData = result.map(createJSONObject);

        // Return the JSON data in the response
        return res.status(200).send({ success: true, message: jsonData });
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
});

module.exports = router;
