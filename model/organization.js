const mongoose = require("mongoose");

const organizationSchema = mongoose.Schema(
  {
    sector: {
      type: String,
      required: true,
    },
    subSector: {
      type: String,
      required: true,
    },
    organizationName: {
      type: String,
      required: true,
    },
    yearOfEstablishment: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      district: { type: String, required: true },
      pinCode: { type: String, required: true },
    },
    contact: {
      mobile: {
        type: String,
        required: true,
      },
    },
    registrationDetails: {
      PAN: {
        type: String,
        required: true,
      },
      TAN: {
        type: String,
        required: true,
      },
      GSTIN: {
        type: String,
        required: true,
      },
    },
    nftMinted: {
      type: Boolean,
      default: false,
      required: false,
    },
    energyAuditor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EnergyAuditor",
    },
    documentsUploaded: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentUploaded",
    },
    targets: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Targets",
    },
    certificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "nftMinted",
    },
    RegisterOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrgRegister",
    },
    emissions: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationalEmissions",
    },
    tokenMinted: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TokenTransfer",
    },
    tokenTransferApproval: [
      {
        currentPhase: {
          type: Number,
        },
        TokenTransferApproved: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "tokenApproval",
        },
      },
    ],
    tokenDeposited: [
      {
        currentPhase: {
          type: Number,
        },
        TokensDepositedID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'tokensDeposited',
        },
      }
    ],
    registerTokenBuy: [
      {
        currentPhase: {
          type: Number,
        },
        registerTokenBuyID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'tokenBuyRequest',
        }
      }
    ],
    verifyBuyerTransaction: [
      {
        currentPhase: {
          type: Number,
        },
        verifiedTransaction: [
          {
            sellerAddress: {
              type: String,
            },
            transactionHash: {
              type: String,
            },
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);
