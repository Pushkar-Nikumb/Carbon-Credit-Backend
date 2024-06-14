const router = require('express').Router()
const abi = require('../ABI/CarbonCreditABIv1.json')
const Web3 = require('web3')
const Organization = require('../model/organization')
const TokenTransfer = require('../model/tokenTransfer')
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
        return events;
    } catch (error) {
        console.error('Transaction error:', error);
    }
};

router.post('/lendCredits', async (req, res) => {
    console.log(req.body)
    if (!req.body) {
        res.status(500).send({ success: false, message: "Data not received from Client!" })
    }
    try {
        const pausedMinting = await infuraInstance.methods.paused().call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY })
        if(!pausedMinting){
            const orgExists = Organization.findOne({ _id: req.body.organizationalID });
            if (orgExists) {
                const getorgDetails = await infuraInstance.methods.getorgDetails(req.body.OrgMetamaskAddress, 0).call();
                console.log(getorgDetails);
                if (getorgDetails[2] === false) { //check whether if are credits already lend to the organizations
                    console.log("In Lend Credits Api section...");
                    const checkEligibility = await infuraInstance.methods.checkOwnerTokenBalanceAndOrganizationEligibility(req.body.OrgMetamaskAddress, 0).call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY });
                    console.log(checkEligibility);
                    if (checkEligibility[0] > 0 && checkEligibility[1] === true) {
                        console.log("Organization Eligible to be rewarded with carbon credits");
                        const LendCredits = await infuraInstance.methods.lendCredits(req.body.OrgMetamaskAddress, 0).encodeABI();
                        const result = await sendTransaction(process.env.OWNER_ACCOUNT_PUBLIC_KEY, LendCredits, process.env.OWNER_ACCOUNT_PRIVATE_KEY)
                        const CreditTransferEvent = result.find(log => log.event === "TokensMinted")
                        console.log(CreditTransferEvent);
    
                        // const filteredResult = CreditTransferEvent.returnValues.map(item => {
                        //     const filteredItem = Object.fromEntries(
                        //         Object.entries(item)
                        //             .filter(([key]) => !/\d/.test(key)) // Exclude keys with index numbers
                        //             .map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value])
                        //     );
                        //     return filteredItem;
                        // });
    
                        // console.log(filteredResult);
    
                        if (CreditTransferEvent) {
                            const newTokentransfered = new TokenTransfer({
                                // OrganizationName: CreditTransferEvent.returnValues.orgName,
                                // OrganizationAddress: CreditTransferEvent.returnValues.orgAddress,
                                transactionHash: CreditTransferEvent.transactionHash,
                                // tokenMinted: CreditTransferEvent.returnValues.tokensMinted,
                                // emissionsSaved: CreditTransferEvent.returnValues.emissionsSaved,
                                // timestamp: CreditTransferEvent.returnValues.timestamp,
                            });
    
                            const savedTokenMinted = await newTokentransfered.save();
                            console.log("Token Minted Successfully in Contract (CarbonCreditToken Contract): ", savedTokenMinted);
    
                            const updateOrganizationData = await Organization.findOneAndUpdate(
                                { _id: req.body.organizationalID },
                                { $set: { tokenMinted: savedTokenMinted._id } },
                                { upsert: true, new: true }
                            );
                            console.log("Organizational Data Updated successfully (Reference for saving Token Minted for eligible organization):", updateOrganizationData);
    
                            return res.status(200).send({ success: true, message: updateOrganizationData });
                        } else {
                            return res.status(500).send({ success: false, message: "TokensMinted event not found in transaction result." });
                        }
                    } else {
                        return res.status(500).send({ success: false, message: `Organization Not Eligible to be rewarded with carbon credits/Insufficient balance otherwise!` });
                    }
                } else {
                    return res.status(500).send({ success: false, message: `Carbon Credits already minted for organization with ID ${req.body.organizationalID}` });
                }
            } else {
                return res.status(500).send({ success: false, message: `organization with ID ${req.body.organizationalID} does not exist!` });
            }
        }else{
            return res.status(500).send({ success: false, message: `Minting is Paused, Owner must Unpause the Minting Process to continue token transfer!` });
        }

    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
})

module.exports = router;
