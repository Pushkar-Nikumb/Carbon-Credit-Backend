const router = require("express").Router();
const abi = require("../ABI/CarbonCreditABIv1.json");
const Web3 = require("web3");
const Sector = require("../model/sector");
require("dotenv").config();

const LocalWeb3 = new Web3(`https://polygon-amoy.infura.io/v3/${process.env.IPFS_API_KEY}`);
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


router.post("/SetBenchmark", async (req, res) => {
    try {
        console.log(req.body);
        if (!req.body) {
            res.status(500).send({ success: false, message: "Data not received from CLient!" });
        }
        const sector = req.body.Sector;
        const benchmark = req.body.Benchmark;
        console.log("IN SET SECTOR BENCHMARK API : ");
        const didSectorExists = await infuraInstance.methods.sectorAlreadyExists(sector).call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY })
        if (didSectorExists === true) {
            console.log(`Sector ${sector} already Exists, Updating it's Benchmark to ${benchmark}`)
            const SetBenchmark = await infuraInstance.methods.setSectorBenchmark(sector, benchmark).encodeABI();
            const result = await sendTransaction(process.env.OWNER_ACCOUNT_PUBLIC_KEY, SetBenchmark, process.env.OWNER_ACCOUNT_PRIVATE_KEY);

            console.log(result);


            try {
                //Update Sector in Database
                const updatedbenchmark = await Sector.findOneAndUpdate(
                    { sector : req.body.Sector},
                    { $set : {  benchmark: req.body.Benchmark,          
                                contract: result[0].address,
                                signature: result[0].signature,
                                transactionHash: result[0].transactionHash}},
                    { upsert: true, new: true } 
                )
                console.log("Sector Updated Successfully : ", updatedbenchmark);
                res.status(200).send({ success: true, message: updatedbenchmark });
            } catch (error) {
                res.status(500).send({ success: false, message: error.message });
            }
        } else {
            const SetBenchmark = await infuraInstance.methods.addSector(sector, benchmark).encodeABI();
            const result = await sendTransaction(process.env.OWNER_ACCOUNT_PUBLIC_KEY, SetBenchmark, process.env.OWNER_ACCOUNT_PRIVATE_KEY);

            console.log(result);


            try {
                //Add Sector to Database
                const newSector = new Sector({
                    sector: req.body.Sector,
                    benchmark: req.body.Benchmark,
                    contract: result[0].address,
                    signature: result[0].signature,
                    transactionHash: result[0].transactionHash,
                });
                const saveSector = await newSector.save();
                console.log("Sector Added Successfully : ", saveSector);
                res.status(200).send({ success: true, message: saveSector });
            } catch (error) {
                res.status(500).send({ success: false, message: error.message });
            }
        }

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
});

module.exports = router;
