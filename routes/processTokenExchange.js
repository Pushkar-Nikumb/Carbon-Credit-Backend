const router = require('express').Router();
const Web3 = require('web3');
const abiv3 = require('../ABI/TokenExchangeABIv1.json');
const tokenAllotment = require('../model/AllocateToken');
const TokenExchangeContract = require('../model/Contracts');

const LocalWeb3 = new Web3(`https://polygon-amoy.infura.io/v3/${process.env.IPFS_API_KEY}`)

function fulfillBuyerRequirements(buyerRequirements, sellers, sellerAddresses) {
    let buyerSellerMapping = {};
    let remainingRequirements = buyerRequirements; // No need to convert to BigInt here
    let i = 0;

    while (remainingRequirements > 0n && i < sellers.length) {
        let sellerGoods = sellers[i]; // No need to convert to BigInt here

        if (sellerGoods > 0n) {
            if (sellerGoods >= remainingRequirements) {
                buyerSellerMapping[sellerAddresses[i]] = remainingRequirements.toString(); // Convert to string
                sellers[i] -= remainingRequirements;
                remainingRequirements = 0n;
            } else {
                buyerSellerMapping[sellerAddresses[i]] = sellerGoods.toString(); // Convert to string
                remainingRequirements -= sellerGoods;
                sellers[i] = 0n;
            }
        }

        i++;
    }

    return { buyerSellerMapping, remainingRequirements, updatedSellers: sellers };
}


const storeAndUpdateData = async (phase, RemainingssellersMapping, BuyerSellersMapping, res) => {
    try {
        const phaseExists = await tokenAllotment.findOne({ phase: phase });
        if (phaseExists) {
            console.log("in updating TokenAllotment Section...");
            let existingData = await tokenAllotment.findOneAndUpdate(
                { phase: phase },
                { $set: { mappingsJSON: BuyerSellersMapping, mappingsRemainingToken: RemainingssellersMapping } },
                { upsert: true, new: true }
            );
            console.log("Updated DATA(SAME PHASE) : ", existingData)
            return res.status(200).send({ success: true, message: existingData });

        } else {
            console.log("in inserting/creating new TokenAllotment Data section...");
            let newTokenAllotmentData = await tokenAllotment.create({
                phase: phase,
                mappingsJSON: BuyerSellersMapping,
                mappingsRemainingToken: RemainingssellersMapping
            });
            console.log("NEW PHASE DATA : ", newTokenAllotmentData)
            return res.status(200).send({ success: true, message: newTokenAllotmentData });

        }
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
}
router.post('/processTransaction', async (req, res) => {
    try {
        const currentContractAddress = await TokenExchangeContract.findById({ _id: "660ad453bfe6dccded4e51da" });

        const infuraInstanceC3 = new LocalWeb3.eth.Contract(abiv3,currentContractAddress.currentContract); //make sure to dynamically fetch the contract address from the database

        const response = await infuraInstanceC3.methods.processTokenExchange().call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY });
        const currentPhase = await infuraInstanceC3.methods.currentPhase().call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY });
        console.log("SELLERS ADDRESS : ", response);

        let sellerAddresses = response['0'];
        let buyerAddresses = response['1'];
        let sellers = response['2'].map(value => BigInt(value)); // Convert to BigInt
        let buyers = response['3'].map(value => BigInt(value)); // Convert to BigInt

        let mappings = []; // Array to store buyer-seller mappings


        for (let buyerIndex = 0; buyerIndex < buyers.length; buyerIndex++) {
            let buyerRequirements = buyers[buyerIndex];
            let result = fulfillBuyerRequirements(buyerRequirements, sellers, sellerAddresses);
            let { buyerSellerMapping, remainingRequirements, updatedSellers } = result;

            // Convert BigInt values to strings in the buyer-seller mapping
            let stringifiedMapping = {};
            for (let sellerAddress in buyerSellerMapping) {
                stringifiedMapping[sellerAddress] = buyerSellerMapping[sellerAddress].toString();
            }

            // Push the buyer-seller mapping for each buyer to the mappings array
            mappings.push({
                buyerAddress: buyerAddresses[buyerIndex],
                requirementsFulfilled: buyerRequirements.toString(), // Convert BigInt to string
                sellerMapping: stringifiedMapping,
                remainingRequirement: remainingRequirements.toString(), //Convert BigInt to string
            });

            console.log(`Buyer ${buyerAddresses[buyerIndex]} \nfulfilled requirements: ${buyerRequirements}`);
            if (remainingRequirements > 0n) {
                console.log(`  - Remaining requirements: ${remainingRequirements}`);
            }
            console.log("  - Seller mapping:");
            Object.keys(buyerSellerMapping).forEach(sellerAddress => {
                console.log(`    - Seller ${sellerAddress}: ${buyerSellerMapping[sellerAddress]}`);
            });

            console.log("  - Updated seller list:");
            console.log(updatedSellers.map(value => value.toString())); // Convert to string
            sellers = updatedSellers.slice(); // Update sellers for the next iteration
        }

        // Check for sellers with remaining tokens
        let remainingSellers = sellers.reduce((acc, tokens, index) => {
            if (tokens > 0n) {
                acc.push({
                    sellerAddress: sellerAddresses[index],
                    remainingTokens: tokens.toString()
                });
            }
            return acc;
        }, []);

        // // Include sellers with remaining tokens in the mappings
        // mappings.push(...remainingSellers.map(seller => ({
        //     sellerAddress: seller.sellerAddress,
        //     remainingTokens: seller.remainingTokens
        // })));

        // Convert the mappings array to JSON format
        // let mappingsJSON = JSON.stringify(mappings);
        console.log("Buyer-seller mappings (JSON):");
        console.log(mappings);

        // let mappingsRemainingToken = JSON.stringify(remainingSellers);
        console.log("Mapping for remaining sellers token(JSON):");
        console.log(remainingSellers);

        storeAndUpdateData(currentPhase, remainingSellers, mappings, res)



        // console.log("BUYER : ", buyersAddress);
    } catch (error) {
        // throw error;
        return res.status(500).send({ success: false, message: error.message });
    }
});

module.exports = router;