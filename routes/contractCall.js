const router = require('express').Router();
const EnergyAuditor = require("../model/auditor");
const Organization = require("../model/organization");
const abi = require('../ABI/NFTABIv2.json')
const abiv2 = require('../ABI/CarbonCreditABIv1.json')

const Web3 = require('web3')
require('dotenv').config()

const LocalWeb3 = new Web3(`https://polygon-amoy.infura.io/v3/${process.env.IPFS_API_KEY}`)
const infuraInstance = new LocalWeb3.eth.Contract(abi, process.env.CONTRACT_ADDRESS)
const infuraInstanceC2 = new LocalWeb3.eth.Contract(abiv2, process.env.CARBON_CREDIT_CONTRACT_ADDRESS);


router.post('/fetchContractData', async (req, res) => {
    try {
        // console.log("Token Minted : ", tokenCount);

        if (req.body.role === 'POSOCO') {
            console.log("in fetch all details of NFT MINTING contract...")
            const tokenCount = await infuraInstance.methods.tokenCount().call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY })
            const tokenMintedHistory = await infuraInstance.methods.TokenMintedHistory().call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY })
            console.log(tokenMintedHistory)
            const filteredResult = tokenMintedHistory.map(item => {
                const filteredItem = Object.fromEntries(
                    Object.entries(item)
                        .filter(([key]) => !/\d/.test(key)) // Exclude keys with index numbers
                        .map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value])
                );
                return filteredItem;
            });
            return res.status(200).send({ success: true, message: { tokenCount: tokenCount, tokenHistory: filteredResult } })
        } else if (req.body.role === 'BEE') {
            console.log("in fetch all details of CARBON CREDIT TOKEN contract...")
            const tokenCount = await infuraInstance.methods.tokenCount().call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY })
            const totalSupply = await infuraInstanceC2.methods.totalSupply().call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY })
            const balanceOf = await infuraInstanceC2.methods.balanceOf(process.env.OWNER_ACCOUNT_PUBLIC_KEY).call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY })
            const mintingStatus = await infuraInstanceC2.methods.paused().call({ from: process.env.OWNER_ACCOUNT_PUBLIC_KEY })
            const auditorCount = await EnergyAuditor.countDocuments().exec();
            const orgCount = await Organization.countDocuments().exec();
            return res.status(200).send({ success: true, message: { tokenCount: tokenCount, totalSupply: totalSupply / 1000000000000000000, ownerBalance: balanceOf / 1000000000000000000 , status: mintingStatus, auditorCount: auditorCount, orgCount: orgCount } })
        } else {
            return res.status(500).send({ success: false, message: 'Please send correct role' });
        }
    } catch (error) {
        return res.status(500).send({ success: false, message: error });
    }
})

module.exports = router