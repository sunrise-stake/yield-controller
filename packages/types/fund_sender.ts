export type FundSender = {
  "version": "0.1.0",
  "name": "fund_sender",
  "instructions": [
    {
      "name": "registerState",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "outputYieldAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "sunriseState",
          "type": "publicKey"
        },
        {
          "name": "stateIn",
          "type": {
            "defined": "GenericStateInput"
          }
        }
      ]
    },
    {
      "name": "updateState",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "stateIn",
          "type": {
            "defined": "GenericStateInput"
          }
        }
      ]
    },
    {
      "name": "sendFund",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "outputYieldAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destinationAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "storeCertificates",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "outputYieldAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "certificateMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "outputYieldTokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A token account owned by the outputYieldAccount"
          ]
        },
        {
          "name": "certificateVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "certificateVaultAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "state",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sunriseState",
            "type": "publicKey"
          },
          {
            "name": "updateAuthority",
            "type": "publicKey"
          },
          {
            "name": "destinationSeed",
            "type": "bytes"
          },
          {
            "name": "destinationAccount",
            "type": "publicKey"
          },
          {
            "name": "certificateVault",
            "type": "publicKey"
          },
          {
            "name": "spendThreshold",
            "type": "u64"
          },
          {
            "name": "totalSpent",
            "type": "u64"
          },
          {
            "name": "outputYieldAccountBump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "GenericStateInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "destinationSeed",
            "type": "bytes"
          },
          {
            "name": "updateAuthority",
            "type": "publicKey"
          },
          {
            "name": "destinationAccount",
            "type": "publicKey"
          },
          {
            "name": "certificateVault",
            "type": "publicKey"
          },
          {
            "name": "spendThreshold",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InsufficientFundsForTransaction",
      "msg": "Insufficient funds for transaction"
    },
    {
      "code": 6001,
      "name": "IncorrectOutputYieldAccount",
      "msg": "Incorrect output yield account"
    },
    {
      "code": 6002,
      "name": "IncorrectTokenAccountOwner",
      "msg": "Token account not owned by output yield account"
    },
    {
      "code": 6003,
      "name": "IncorrectDestinationAccount",
      "msg": "Incorrect destination account"
    },
    {
      "code": 6004,
      "name": "IncorrectHoldAccount",
      "msg": "Incorrect hold account"
    },
    {
      "code": 6005,
      "name": "Unauthorized",
      "msg": "Incorrect update authority"
    }
  ]
};

export const IDL: FundSender = {
  "version": "0.1.0",
  "name": "fund_sender",
  "instructions": [
    {
      "name": "registerState",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "outputYieldAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "sunriseState",
          "type": "publicKey"
        },
        {
          "name": "stateIn",
          "type": {
            "defined": "GenericStateInput"
          }
        }
      ]
    },
    {
      "name": "updateState",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "stateIn",
          "type": {
            "defined": "GenericStateInput"
          }
        }
      ]
    },
    {
      "name": "sendFund",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "outputYieldAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destinationAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "storeCertificates",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "outputYieldAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "certificateMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "outputYieldTokenAccount",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "A token account owned by the outputYieldAccount"
          ]
        },
        {
          "name": "certificateVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "certificateVaultAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "state",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sunriseState",
            "type": "publicKey"
          },
          {
            "name": "updateAuthority",
            "type": "publicKey"
          },
          {
            "name": "destinationSeed",
            "type": "bytes"
          },
          {
            "name": "destinationAccount",
            "type": "publicKey"
          },
          {
            "name": "certificateVault",
            "type": "publicKey"
          },
          {
            "name": "spendThreshold",
            "type": "u64"
          },
          {
            "name": "totalSpent",
            "type": "u64"
          },
          {
            "name": "outputYieldAccountBump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "GenericStateInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "destinationSeed",
            "type": "bytes"
          },
          {
            "name": "updateAuthority",
            "type": "publicKey"
          },
          {
            "name": "destinationAccount",
            "type": "publicKey"
          },
          {
            "name": "certificateVault",
            "type": "publicKey"
          },
          {
            "name": "spendThreshold",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InsufficientFundsForTransaction",
      "msg": "Insufficient funds for transaction"
    },
    {
      "code": 6001,
      "name": "IncorrectOutputYieldAccount",
      "msg": "Incorrect output yield account"
    },
    {
      "code": 6002,
      "name": "IncorrectTokenAccountOwner",
      "msg": "Token account not owned by output yield account"
    },
    {
      "code": 6003,
      "name": "IncorrectDestinationAccount",
      "msg": "Incorrect destination account"
    },
    {
      "code": 6004,
      "name": "IncorrectHoldAccount",
      "msg": "Incorrect hold account"
    },
    {
      "code": 6005,
      "name": "Unauthorized",
      "msg": "Incorrect update authority"
    }
  ]
};
