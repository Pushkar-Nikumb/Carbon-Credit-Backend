const router = require("express").Router();

const Organization = require("../model/organization");
const EnergyAuditor = require("../model/auditor");
const DocumentUploaded = require('../model/documents')
const Targets = require('../model/targets')
const nftMinted = require('../model/mintedNFT')
const RegisterOrganization = require('../model/registerOrg')
const OrganizationalEmissions = require('../model/emissions')
const lendCredits = require('../model/tokenTransfer')
const tokenApproval = require('../model/tokenExchange');
const depositTokens = require('../model/depositTokens');
const tokenBuy = require('../model/tokenBuy');

const TokenExchangeContract = require('../model/Contracts');


router.post("/fetchIndividualOrgData", async (req, res) => {
  if (!req.body) {
    res.status(500).send({ success: false, message: "Data not received from CLient!" })
  }
  try {
    const response = await Organization.findById(req.body.organizationalID); // Use exec() to execute the query
    // console.log("Data: ", response);

    const tokenExchangeContract = await TokenExchangeContract.findById({ _id: "660ad453bfe6dccded4e51da" });

    const energyAuditorData = await EnergyAuditor.findById(response.energyAuditor)
    const DocumentUploadedData = await DocumentUploaded.findById(response.documentsUploaded)
    const TargetData = await Targets.findById(response.targets)
    const certificate = await nftMinted.findById(response.certificate)
    const RegisteredOrganization = await RegisterOrganization.findById(response.RegisterOrganization)
    const organizationalEmissions = await OrganizationalEmissions.findById(response.emissions)
    const lendcreditTransaction = await lendCredits.findById(response.tokenMinted)
    const approvedTokenID = response.tokenTransferApproval.find(approval => {
      return approval.currentPhase === tokenExchangeContract.currentContractPhase
    });
    let approvedToken = null;
    if (approvedTokenID) {
      approvedToken = await tokenApproval.findById(approvedTokenID.TokenTransferApproved)
    }

    console.log("Approved DAta : ", approvedToken);

    const depositedTokensID = response.tokenDeposited.find(deposit => {
      return deposit.currentPhase === tokenExchangeContract.currentContractPhase
    });
    let depositedTokens = null;
    if (depositedTokensID) {
      depositedTokens = await depositTokens.findById(depositedTokensID.TokensDepositedID)
    }

    console.log("Deposited DAta : ", depositedTokens);


    let RegisterForBuyID = response.registerTokenBuy.find(buyToken => {
      return buyToken.currentPhase === tokenExchangeContract.currentContractPhase
    });
    let RegisterForBuy = null;
    if (RegisterForBuyID) {
      RegisterForBuy = await tokenBuy.findById(RegisterForBuyID.registerTokenBuyID)
    }

    const VerifiedTransactionExists = await response.verifyBuyerTransaction.find(verify => {
      return verify.currentPhase === tokenExchangeContract.currentContractPhase
    });

    let VerifiedTransaction = null;
    if (VerifiedTransactionExists) {
      VerifiedTransaction = await VerifiedTransactionExists.verifiedTransaction
    }

    // console.log("Verified Transaction : ", VerifiedTransaction);
    // console.log("BUY TOKEN : ", RegisterForBuy);
    // console.log(organizationalEmissions);
    if (approvedToken && !depositedTokens) {
      return res.status(200).send({ success: true, message: response, Auditor: energyAuditorData, documents: DocumentUploadedData, targets: TargetData, certificateData: certificate, nftMinted: response.nftMinted, register: RegisteredOrganization, emissions: organizationalEmissions, emissionTransactionDone: true, lendCredits: lendcreditTransaction, tokenApproval: approvedToken })
    }
    if (approvedToken && depositedTokens && !VerifiedTransaction) {
      return res.status(200).send({ success: true, message: response, Auditor: energyAuditorData, documents: DocumentUploadedData, targets: TargetData, certificateData: certificate, nftMinted: response.nftMinted, register: RegisteredOrganization, emissions: organizationalEmissions, emissionTransactionDone: true, lendCredits: lendcreditTransaction, tokenApproval: approvedToken, tokensDeposited: depositedTokens })
    }
    if(VerifiedTransaction && approvedToken && depositedTokens){
      return res.status(200).send({ success: true, message: response, Auditor: energyAuditorData, documents: DocumentUploadedData, targets: TargetData, certificateData: certificate, nftMinted: response.nftMinted, register: RegisteredOrganization, emissions: organizationalEmissions, emissionTransactionDone: true, lendCredits: lendcreditTransaction, tokenApproval: approvedToken, tokensDeposited: depositedTokens, verifiedTransactions: VerifiedTransaction })
    }
    if(RegisterForBuy && !VerifiedTransaction){
      return res.status(200).send({ success: true, message: response, Auditor: energyAuditorData, documents: DocumentUploadedData, targets: TargetData, certificateData: certificate, nftMinted: response.nftMinted, register: RegisteredOrganization, emissions: organizationalEmissions, emissionTransactionDone: true, lendCredits: lendcreditTransaction, tokenApproval: approvedToken, tokensDeposited: depositedTokens, TokenbuyData: RegisterForBuy, verifiedTransactions: VerifiedTransaction })
    }
    if(VerifiedTransaction && RegisterForBuy){
      return res.status(200).send({ success: true, message: response, Auditor: energyAuditorData, documents: DocumentUploadedData, targets: TargetData, certificateData: certificate, nftMinted: response.nftMinted, register: RegisteredOrganization, emissions: organizationalEmissions, emissionTransactionDone: true, lendCredits: lendcreditTransaction, tokenApproval: approvedToken, tokensDeposited: depositedTokens, TokenbuyData: RegisterForBuy, verifiedTransactions: VerifiedTransaction })

    }
    if(VerifiedTransaction && RegisterForBuy && approvedToken && depositedTokens){
      return res.status(200).send({ success: true, message: response, Auditor: energyAuditorData, documents: DocumentUploadedData, targets: TargetData, certificateData: certificate, nftMinted: response.nftMinted, register: RegisteredOrganization, emissions: organizationalEmissions, emissionTransactionDone: true, lendCredits: lendcreditTransaction, tokenApproval: approvedToken, tokensDeposited: depositedTokens, TokenbuyData: RegisterForBuy, verifiedTransactions: VerifiedTransaction })
    }
    if (response.nftMinted === true && response.certificate) {
      if (response.RegisterOrganization) {
        if (organizationalEmissions) {
          console.log("In fetch Emission data along with other data")
          if (organizationalEmissions.transactionHash) {
            if (lendcreditTransaction) {
              if (approvedToken) {
                if (depositedTokens && approvedToken) {
                  if (VerifiedTransaction) {
                    return res.status(200).send({ success: true, message: response, Auditor: energyAuditorData, documents: DocumentUploadedData, targets: TargetData, certificateData: certificate, nftMinted: response.nftMinted, register: RegisteredOrganization, emissions: organizationalEmissions, emissionTransactionDone: true, lendCredits: lendcreditTransaction, tokenApproval: approvedToken, tokensDeposited: depositedTokens, verifiedTransactions: VerifiedTransaction })
                  }
                  return res.status(200).send({ success: true, message: response, Auditor: energyAuditorData, documents: DocumentUploadedData, targets: TargetData, certificateData: certificate, nftMinted: response.nftMinted, register: RegisteredOrganization, emissions: organizationalEmissions, emissionTransactionDone: true, lendCredits: lendcreditTransaction, tokenApproval: approvedToken, tokensDeposited: depositedTokens })
                }
                return res.status(200).send({ success: true, message: response, Auditor: energyAuditorData, documents: DocumentUploadedData, targets: TargetData, certificateData: certificate, nftMinted: response.nftMinted, register: RegisteredOrganization, emissions: organizationalEmissions, emissionTransactionDone: true, lendCredits: lendcreditTransaction, tokenApproval: approvedToken })
              } else {
                return res.status(200).send({ success: true, message: response, Auditor: energyAuditorData, documents: DocumentUploadedData, targets: TargetData, certificateData: certificate, nftMinted: response.nftMinted, register: RegisteredOrganization, emissions: organizationalEmissions, emissionTransactionDone: true, lendCredits: lendcreditTransaction })
              }
            } else if (RegisterForBuy) {
              if (VerifiedTransaction) {
                return res.status(200).send({ success: true, message: response, Auditor: energyAuditorData, documents: DocumentUploadedData, targets: TargetData, certificateData: certificate, nftMinted: response.nftMinted, register: RegisteredOrganization, emissions: organizationalEmissions, emissionTransactionDone: true, lendCredits: lendcreditTransaction, tokenApproval: approvedToken, tokensDeposited: depositedTokens, TokenbuyData: RegisterForBuy, verifiedTransactions: VerifiedTransaction })
              }
              return res.status(200).send({ success: true, message: response, Auditor: energyAuditorData, documents: DocumentUploadedData, targets: TargetData, certificateData: certificate, nftMinted: response.nftMinted, register: RegisteredOrganization, emissions: organizationalEmissions, emissionTransactionDone: true, lendCredits: lendcreditTransaction, tokenApproval: approvedToken, tokensDeposited: depositedTokens, TokenbuyData: RegisterForBuy })
            } else {
              return res.status(200).send({ success: true, message: response, Auditor: energyAuditorData, documents: DocumentUploadedData, targets: TargetData, certificateData: certificate, nftMinted: response.nftMinted, register: RegisteredOrganization, emissions: organizationalEmissions, emissionTransactionDone: true })
            }
          } else {
            return res.status(200).send({ success: true, message: response, Auditor: energyAuditorData, documents: DocumentUploadedData, targets: TargetData, certificateData: certificate, nftMinted: response.nftMinted, register: RegisteredOrganization, emissions: organizationalEmissions, emissionTransactionDone: false })
          }
        } else {
          console.log("In fetch Registration data along with other data")
          return res.status(200).send({ success: true, message: response, Auditor: energyAuditorData, documents: DocumentUploadedData, targets: TargetData, certificateData: certificate, nftMinted: response.nftMinted, register: RegisteredOrganization, emissionTransactionDone: false })
        }
      } else {
        console.log("In fetch Organizational data(NFT MINTED) along with other data")
        return res.status(200).send({ success: true, message: response, Auditor: energyAuditorData, documents: DocumentUploadedData, targets: TargetData, certificateData: certificate, nftMinted: response.nftMinted, emissionTransactionDone: false })
      }
    } else {
      return res.status(200).send({ success: true, message: response, Auditor: energyAuditorData, documents: DocumentUploadedData, targets: TargetData, nftMinted: response.nftMinted })
    }

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

module.exports = router;
