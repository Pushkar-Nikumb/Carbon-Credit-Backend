const router = require('express').Router();
const abi = require('../ABI/CarbonCreditABIv1.json')
const Web3 = require('web3')
const Sector = require('../model/sector');
const OrgRegister = require('../model/registerOrg');
const LocalWeb3 = new Web3(`https://polygon-amoy.infura.io/v3/${process.env.IPFS_API_KEY}`)
const infuraInstance = new LocalWeb3.eth.Contract(abi, process.env.CARBON_CREDIT_CONTRACT_ADDRESS)
const Organization = require('../model/organization')

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

router.post('/RegisterInContract', async (req, res) => {
    try {
        console.log(req.body);
        if (!req.body) {
            return res
                .status(500)
                .send({ success: false, message: "Data not received from CLient!" });
        }
        const orgAddress = req.body.orgAddress;
        const organizationName = req.body.orgName;
        const organizationHead = req.body.orgHead;
        const Sectormentioned = req.body.sector;
        const auditorAddress = req.body.auditorAddress;
        console.log("IN Organization Registration(Contract) Section...")
        //check for does sector exists -> did owner(BEE) added sector in Contract
        const checkForSectorExistance = await Sector.findOne(
            { sector: Sectormentioned },
        );

        if (checkForSectorExistance) {
            console.log(`Sector ${Sectormentioned} Exists!!!`)
            try {
                const checkMetamaskAlreadyExists = await infuraInstance.methods.organizationExists(orgAddress).call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY })
                if (checkMetamaskAlreadyExists) {
                    console.log(`Organization with Metamask Address ${orgAddress} already Registered in the Contract!`)
                    return res.status(500).send({ success: false, message: `Organization with Metamask Address ${orgAddress} already exists!` })
                } else {
                    console.log("In Registering Organization Section!!!")
                    const orgDataExists = await Organization.findOne({
                        _id: req.body.organizationalID,
                    });
                    if (orgDataExists) {
                        const didAuditorExists = await infuraInstance.methods.emissionAuditors(auditorAddress).call({from : process.env.OWNER_ACCOUNT_PUBLIC_KEY })
                        if(!didAuditorExists){
                            console.log(`Auditor with Metamask Address ${auditorAddress} Didn't Exists in the Contract!`)
                            return res.status(500).send({ success: false, message: `Auditor with Metamask Address ${auditorAddress} Didn't exists!` })        
                        }else{
                            const addOrganization = await infuraInstance.methods.registerOrganization(orgAddress, organizationName, organizationHead, Sectormentioned).encodeABI();
                            const result = await sendTransaction(process.env.OWNER_ACCOUNT_PUBLIC_KEY, addOrganization, process.env.OWNER_ACCOUNT_PRIVATE_KEY);
    
                            console.log("ORG. Register Data",result);
                            const RegisteredOrgEvent = result.find(log => log.event === 'OrganizationRegistered')

                            const linkAuditorToOrg = await infuraInstance.methods.LinkEmissionAuditorToOrganization(orgAddress,auditorAddress).encodeABI();
                            const linkAuditor = await sendTransaction(process.env.OWNER_ACCOUNT_PUBLIC_KEY, linkAuditorToOrg, process.env.OWNER_ACCOUNT_PRIVATE_KEY);
                            console.log("Linked Auditor to Organization : ",linkAuditor);

                            const registerNewOrganization = new OrgRegister({
                                metamask: RegisteredOrgEvent.returnValues['0'],
                                name: RegisteredOrgEvent.returnValues['1'],
                                head: RegisteredOrgEvent.returnValues['2'],
                                sector: RegisteredOrgEvent.returnValues['3'],
                                benchmark: RegisteredOrgEvent.returnValues['4'],
                                transactionHash: result[0].transactionHash,
                            });
    
                            const saveRegisteredOrganization = await registerNewOrganization.save();
                            console.log("Organization Registered Successfully in Contract : ", saveRegisteredOrganization);
    
                            const updateOrganizationData = await Organization.findOneAndUpdate(
                                { _id: req.body.organizationalID },
                                { $set: { RegisterOrganization: saveRegisteredOrganization._id } },
                                { upsert: true, new: true }
                            )
                            console.log(
                                "Organizational Data Updated successfully(Added Registered Orgamization(In Smart Contract) Reference):",
                                updateOrganizationData
                            );
                            return res.status(200).send({ success: true, message: updateOrganizationData });
                        }
                    } else {
                        console.log(`Organization with Id ${req.body.organizationalID} Doesn't Exists!`);
                        return res.status(500).send({ success: false, message: `Organization with Id ${req.body.organizationalID} Doesn't Exists!` })
                    }
                }
            } catch (error) {
                return res.status(500).send({ success: false, message: error.message })
            }
        } else {
            return res.status(500).send({ success: false, message: "Sector Doesn't Exists, Add Sector From Owner Side!" })
        }


    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
})
module.exports = router;