const router = require("express").Router();
const Organization = require("../model/organization");
const EnergyAuditor = require("../model/auditor");
const abi = require('../ABI/CarbonCreditABIv1.json');
const Web3 = require('web3');

const LocalWeb3 = new Web3(`https://polygon-mumbai.infura.io/v3/${process.env.IPFS_API_KEY}`);
const infuraInstance = new LocalWeb3.eth.Contract(abi, process.env.CARBON_CREDIT_CONTRACT_ADDRESS);

const sendTransaction = async (sender, data, privateKey) => {
  console.log("In send Transaction Function!")
  const nonce = await LocalWeb3.eth.getTransactionCount(sender);
  const gasPrice = await LocalWeb3.eth.getGasPrice();
  const gasLimit = 3000000; // Adjust as needed

  const tx = {
    nonce,
    from: sender,
    to: process.env.CARBON_CREDIT_CONTRACT_ADDRESS,
    gasPrice,
    gasLimit,
    data,
  };
  console.log(nonce)
  const signedTx = await LocalWeb3.eth.accounts.signTransaction(tx, privateKey);
  try {
    const receipt = await LocalWeb3.eth.sendSignedTransaction(signedTx.rawTransaction);
    const events = await infuraInstance.getPastEvents('allEvents', {
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });

    //console.log('Emitted events:', events);
    return (events);
  } catch (error) {
    console.error('Transaction error:', error);
  }
};


const newAuditorData = async (body, req, res) => {

  try {
    const didAuditorExists = await infuraInstance.methods.emissionAuditors(body.metamask).call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY })
    if (didAuditorExists) {
      res.status(500).json({ success: false, message: `Auditor with Metamask Address : ${body.metamask} already Exists, Use Different Address!!!` });
    } else {

      const addAuditorToContract = await infuraInstance.methods.addEmissionAuditor(body.name, body.registrationNumber, body.sector, body.metamask).encodeABI();
      const result = await sendTransaction(process.env.OWNER_ACCOUNT_PUBLIC_KEY, addAuditorToContract, process.env.OWNER_ACCOUNT_PRIVATE_KEY);
      if (result) {
        console.log(result);

        const newAuditor = new EnergyAuditor({
          registrationNumber: body.registrationNumber,
          name: body.name,
          phone: body.phone,
          mobile: body.mobile,
          email: body.email,
          metamask: body.metamask,
          sector: body.sector,
          transactionHash: result[0].transactionHash,
        });
        try {
          const saveAuditor = await newAuditor.save();
          console.log(saveAuditor);

          console.log("Auditor Added successfully:", saveAuditor);
          res.status(200).send({ success: true, message: saveAuditor });
        } catch (error) {
          res.status(500).json({ success: false, message: error });
        }
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

router.post("/add_auditor", async (req, res) => {
  console.log(req.body);
  if (!req.body) {
    res
      .status(500)
      .send({ success: false, message: "Data not received from CLient!" });
  }
  try {
    const auditExists = await EnergyAuditor.findOne({
      registrationNumber: req.body.registrationNumber,
    });
    if (!auditExists) {
      //   console.log("Organization ID Exists : ", userExists._id);
      newAuditorData(req.body, req, res);
    } else {
      console.log("User does Exist!, check for his/her userID correctly!");
      return res.status(500).send({ success: false, message: `User with Registration ID ${req.body.registrationNumber} already Exists, Give new Registration Number ` });
    }
  } catch (error) {
    return res.status(500).send({ success: false, message: error });
  }
});
module.exports = router;
