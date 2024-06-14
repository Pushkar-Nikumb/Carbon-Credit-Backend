const router = require('express').Router();
const Emissions = require('../model/emissions');
const Organization = require('../model/organization');
const EnergyAuditor = require('../model/auditor');

const abi = require('../ABI/CarbonCreditABIv1.json')
const Web3 = require('web3')

const LocalWeb3 = new Web3(`https://polygon-amoy.infura.io/v3/${process.env.IPFS_API_KEY}`);
const infuraInstance = new LocalWeb3.eth.Contract(abi, process.env.CARBON_CREDIT_CONTRACT_ADDRESS);



function calculateTotals(req) {
    if (!req.body.emissions || !Array.isArray(req.body.emissions)) {
        throw new Error('Invalid or missing emissions data');
    }

    const totals = req.body.emissions.reduce((acc, curr) => {
        acc.totalEmission += parseInt(curr.emission, 10);
        acc.totalProduction += parseInt(curr.production, 10);
        return acc;
    }, { totalEmission: 0, totalProduction: 0 });

    return totals;
}

router.post('/addEmission', async (req, res) => {
    console.log(req.body);
    if (!req.body) {
        return res.status(400).send({ success: false, message: 'Data not received from Client!' });
    }
    try {

        if (req.body.transactionHashSubmitting === false) {

            const orgExists = await Organization.findOne({ _id: req.body.organizationalID });
            if (!orgExists) {
                return res.status(404).send({ success: false, message: `Organization with ID ${req.body.organizationalID} doesn't Exist!` });
            }

            const getEmitter = await EnergyAuditor.findOne({ _id: orgExists.energyAuditor });
            if (!getEmitter) {
                return res.status(404).send({ success: false, message: `Emitter doesn't Exist/ Not Linked to organization!` });
            }

            const { totalEmission, totalProduction } = calculateTotals(req);

            console.log("Total Emission Count: ", totalEmission);
            console.log("Total Production: ", totalProduction);

            const addEmission = new Emissions({
                emissions: req.body.emissions,
                totalEmission: totalEmission,
                totalProduction: totalProduction,
                auditor: getEmitter._id,
            });

            const saveEmissions = await addEmission.save();
            console.log("Organizational Emission added Successfully : ", saveEmissions);

            const updateOrganizationData = await Organization.findOneAndUpdate(
                { _id: req.body.organizationalID },
                { $set: { emissions: saveEmissions._id } },
                { upsert: true, new: true }
            );

            console.log("Organizational Emission data referenced Successfully : ", updateOrganizationData);


            return res.status(200).send({ success: true, message: 'Emissions data added successfully' });
        } else {
            const OrgEmissionExists = await Emissions.findOne({ _id: req.body.organizationEmissionID })

            if (OrgEmissionExists) {
                console.log("In Updating Organizational Emissions Sections...");
                const updateEmissions = await Emissions.findOneAndUpdate(
                    { _id: req.body.organizationEmissionID },
                    { $set: { transactionHash: req.body.transactionHash } },
                    { upsert: true, new: true }
                )
                if (updateEmissions) {
                    console.log("Organizational Emission data updated Successfully(added trasactional data) : ", updateEmissions);
                    try {
                        const checkEligibility = await infuraInstance.methods.checkOwnerTokenBalanceAndOrganizationEligibility(req.body.metamask, 0).call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY })
                        console.log("Eligibility of Organization : ", checkEligibility);
                        if (checkEligibility[0] > 0 && checkEligibility[1] === true) {
                            const updateTokenEligibility = await Emissions.findOneAndUpdate(
                                { _id: req.body.organizationEmissionID },
                                { $set: { eligibleForToken: true } },
                                { upsert: true, new: true }
                            )
                            console.log("Organizational Emission data updated Successfully(added Token Eligibility) : ", updateTokenEligibility);
                            return res.status(200).send({ success: true, message: 'Emissions data updated successfully(added trasactional data(aDD Emissions) and Organization is Eligible for Granting Token)' });
                        } else {
                            console.log("Organization is not eligible for gramting Token!")
                            return res.status(200).send({ success: true, message: 'Emissions data updated successfully(added trasactional data(aDD Emissions) but Organization is not Eligible for Granting Token)' });
                        }
                    } catch (error) {
                            console.log(error.message, " BEE CANNOT GRANT THEM CARBON CREDIT TOKENS to Organization");
                            if(error.message === "Returned error: execution reverted: Current Phase emissions exceed benchmark"){
                            return res.status(200).send({success : true, message : "ORGANIZATIONAL EMISSIONS EXCEEDED BENCHMARK, BEE CANNOT GRANT THEM CARBON CREDIT TOKENS!"})
                            }
                            return res.status(200).send({success : true, message : error.message})
                    }
                }
            } else {
                return res.status(500).send({ success: false, message: `Organizational Emission Data with ID : ${req.body.organizationEmissionID} Doesn't Exists` });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, message: error.message });
    }
});

module.exports = router;
