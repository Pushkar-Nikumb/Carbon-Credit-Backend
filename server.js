const express = require('express');
const cors = require('cors')
const { default: mongoose } = require('mongoose');
require('dotenv').config();
const bodyParser = require('body-parser');
const app = express();
app.use(cors({origin: true}))//request from client side 
app.use(bodyParser.json())//bosy parser
const PORT = 4000
//user Authentications

//------------------------------------------------------------------------------------------------//
// -------------------------------- POSOCO API --------------------------------//
//------------------------------------------------------------------------------------------------//

const userRoute = require('./routes/user');
const formRoute = require('./routes/organization')
const addAuditoRoute = require('./routes/auditor') 
const fetchAuditorRoute = require('./routes/fetchAuditor')
const refAuditorRoute = require('./routes/refAuditor')
const refDocumentRoute = require('./routes/docUpload')
const refTargetRoute = require('./routes/target')
const refMintCertificateRoute = require('./routes/certificate')
const refUploadToIPFSRoute = require('./routes/ipfs')
const fetchOrganizationDataRoute = require('./routes/fetchorganizations')
const fetchIndividualOrganizationDataRoute = require('./routes/fetchOrgIndividual')
const fetchContractCallsRoute = require('./routes/contractCall')
const fetchAllAuditorsRoute = require('./routes/fetchAllAuditors')
const fetchorganizationCount = require('./routes/organizationalCount')
const fetchOrganizationalIDFromMetamask = require('./routes/fetchIdFromMetamask')
const userRegistrationRoute = require('./routes/userRegister')
const fetchMetamaskRoute = require('./routes/fetchMetamask')
const fetchLoginRole = require('./routes/LoginUser')
const fetchORGIDfromUser = require('./routes/userToOrg')
const fetchOrganizationalBalance = require('./routes/tokenBalance');
const fetchIPFSHashRoute = require('./routes/fetchIpfsHash')



//------------------------------------------------------------------------------------------------//
// -------------------------------- BEE Portal API --------------------------------//
//------------------------------------------------------------------------------------------------//
const fetchSetBenchmark = require('./routes/SectorBenchmark')
const fetchMintToken = require('./routes/mintToken')
const fetchRegisterOrganization = require('./routes/registerOrganization')
const fetchAllSectorsRoute = require('./routes/fetchSectors')
const fetchTotalSupplyRoute = require('./routes/totalSupply')
const fetchuserAuthRoute = require('./routes/userAuth')
const fetchLinkedOrganizations = require('./routes/fetchOrgLinkedAuditor')
const fetchAddedOrgEMissionRoute = require('./routes/AddOrganizationalEmissions')
const fetchLendCreditsRoute = require('./routes/lendCredits');
const fetchCheckEligibility = require('./routes/checkEligibility')
const fetchTokenTransferHistoryRoute = require('./routes/TokenTransferHistory')

//------------------------------------------------------------------------------------------------//
// -------------------------------- ORGANIZATION Portal API --------------------------------//
//------------------------------------------------------------------------------------------------//
const fetchVerificationATNFTGatinMechanism = require('./routes/NFTGatingMechanism')
const fetchTokenApprovalDataRoute = require('./routes/tokenTransferApproval')
const fetchTokenDepositedDataRoute = require('./routes/depositTokenInVault')
const fetchTokenBuyTransactionRoute = require('./routes/buyTokenTransaction')
const fetchTokenExchangeOperationRoute = require('./routes/processTokenExchange')
const fetchLinkedSellersToBuyersRoute = require('./routes/fetchLinkedSellers')
const fetchSendEthersToContract = require('./routes/sendEthersToBuyTokens')
const fetchNewDeployedTokenExchangeContract = require('./routes/fetchContractAddress')
const fetchCurrentBuyerAddressRouteFromTokenExcahngeContract = require('./routes/fetchBuyer')
const fetchverifiedBuyerTransactionData = require('./routes/verifyBuyerTransactions')
//user Login
app.use('/api/users',userRoute)
//Organizational Data Insertion
app.use('/api/organization',formRoute)
//Auditor 
app.use('/api/add_auditor',addAuditoRoute)
app.use('/api/fetch_auditor',fetchAuditorRoute)
app.use('/api/referenceAuditor',refAuditorRoute)
//Document
app.use('/api/document',refDocumentRoute)
//Target
app.use('/api/setTarget',refTargetRoute)
//Mint Certificate
app.use('/api/ethereum',refMintCertificateRoute)
//upload to IPFS
app.use('/api/uploadToIPFS',refUploadToIPFSRoute)
//fetch all the data from OrganizATION schema
app.use('/api/organization',fetchOrganizationDataRoute)
//fetch individual Organzational Data
app.use('/api/organization',fetchIndividualOrganizationDataRoute)
//fetch all contract calls
app.use('/api/ethereum',fetchContractCallsRoute)
//fetch all auditors api
app.use('/api/Auditor',fetchAllAuditorsRoute)
//fetch count of organizational Data
app.use('/api/organzation',fetchorganizationCount)
//User registration
app.use('/api/user',userRegistrationRoute)
//fetch metamask account from user Schema
app.use('/api/user',fetchMetamaskRoute)
//fetch Organizational ID from Metamask Address(required api in TOKEN EXCHANGE PLATFORM)
app.use('/api/organization', fetchOrganizationalIDFromMetamask)
//fetch user login role(user/posoco(admin))
app.use('/api/user',fetchLoginRole)
//fetch User Connected Organzation ID 
app.use('/api/user',fetchORGIDfromUser)
// fetch Organizational Carbon Credit Balance
app.use('/api/user',fetchOrganizationalBalance)
//fetch IPFS hash from particular Token ID
app.use('/api/ipfs', fetchIPFSHashRoute)
//--------------------------------------------------------------------------------------------------------------------------------
//Fetch/SET Sector Benchmark in Carbon Credit Contract
app.use('/api/sector',fetchSetBenchmark)
//API to Mint tokens for Owner Account
app.use('/api/token',fetchMintToken)
//API to Register Organization in Smart Contract
app.use('/api/organization',fetchRegisterOrganization)
//API to fetch all Sectors from Database
app.use('/api/sectors',fetchAllSectorsRoute)
//API to fetch total Supply of tokens from Token Minting Contract
app.use('/api/tokenContract',fetchTotalSupplyRoute)
// API to Authenticate the User using JWY Token
app.use('/api/user', fetchuserAuthRoute)
// API to fetch all the Organizations that are linked to Specific Auditor
app.use('/api/auditor', fetchLinkedOrganizations)
// API to Add Emission data of Respective Organization
app.use('/api/auditor', fetchAddedOrgEMissionRoute)
//API to Lend Credits to the organizations who achieved Sector Benchmark
app.use('/api/organizations', fetchLendCreditsRoute)
//API to fetch the eligibility of an organization, whether it is eligible to grant Carbon Credit Token!
app.use('/api/organization', fetchCheckEligibility)
//API to fetch the TOken Transfer History(Carbon Credit Token Transfer to Eligible Organizations)
app.use('/api/token', fetchTokenTransferHistoryRoute)
//--------------------------------------------------------------------------------------------------------------------------------
//API to verify if the Organization is Obligated Entity(authorized Participant of carbon credit project) using NFT GATING MECHANISM
app.use('/api/user', fetchVerificationATNFTGatinMechanism)
//API to Store Data for approving tokens for depositing tokens in Vault(ERC-4626)
app.use('/api/token',fetchTokenApprovalDataRoute)
//API to store depositing tokens in Vault(ERC-4626)
app.use('/api/token',fetchTokenDepositedDataRoute)
// API to Register in Vault Contract to Buy Carbon Credit Tokens
app.use('/api/token',fetchTokenBuyTransactionRoute)
// API to Fetch and Process Token Exchange Transactions
app.use('/api/tokenExchange', fetchTokenExchangeOperationRoute)
//API to fetch Sellers linked to the respective Sellers
app.use('/api/buyers', fetchLinkedSellersToBuyersRoute) 
//API to send Ethers to smart contract wallet(paid by Buyer, in-order to buy carbon credit tokens from Sellers)
app.use('/api/TokenExchange', fetchSendEthersToContract)
//API to add new contract to collection
app.use('/api/TokenExchange', fetchNewDeployedTokenExchangeContract)
// API to fetch Buyer Address from Currently Deployed Token Exchange Contract
app.use('/api/buyer', fetchCurrentBuyerAddressRouteFromTokenExcahngeContract)
//API to store buyer Data for verified Buyer Transaction(whether the buyer has deposited ethers to contract, if yes, then tokens are transferred to buyer and ethers are transferred to buyer)
app.use('/api/TokenExchange', fetchverifiedBuyerTransactionData)

mongoose.set('strictQuery', true);
mongoose.connect(process.env.DB_STRING,()=>{
  console.log("mongoose connected")
})
 
app.listen(PORT,()=>{
    console.log(`server running on PORT ${PORT}`)
})