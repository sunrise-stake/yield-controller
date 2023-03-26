export type BuyAndBurn = {
  "version": "0.1.0",
  "name": "buy_and_burn",
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
          "name": "mint",
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
          "name": "state",
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
        }
      ],
      "args": [
        {
          "name": "state",
          "type": {
            "defined": "GenericStateInput"
          }
        }
      ]
    },
    {
      "name": "allocateYield",
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
          "name": "yieldAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "holdingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "holdingTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solUsdPriceFeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nctUsdPriceFeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
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
      "name": "setTotalTokensPurchased",
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
        }
      ],
      "args": [
        {
          "name": "value",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "state",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "updateAuthority",
            "type": "publicKey"
          },
          {
            "name": "treasury",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "solUsdPriceFeed",
            "type": "publicKey"
          },
          {
            "name": "nctUsdPriceFeed",
            "type": "publicKey"
          },
          {
            "name": "holdingAccount",
            "type": "publicKey"
          },
          {
            "name": "holdingTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "feedStalenessThreshold",
            "type": "u64"
          },
          {
            "name": "purchaseThreshold",
            "type": "u64"
          },
          {
            "name": "purchaseProportion",
            "type": "f32"
          },
          {
            "name": "totalTokensPurchased",
            "type": "u64"
          },
          {
            "name": "index",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "yieldAccountBump",
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
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "updateAuthority",
            "type": "publicKey"
          },
          {
            "name": "treasury",
            "type": "publicKey"
          },
          {
            "name": "holdingAccount",
            "type": "publicKey"
          },
          {
            "name": "holdingTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "solUsdPriceFeed",
            "type": "publicKey"
          },
          {
            "name": "nctUsdPriceFeed",
            "type": "publicKey"
          },
          {
            "name": "feedStalenessThreshold",
            "type": "u64"
          },
          {
            "name": "purchaseThreshold",
            "type": "u64"
          },
          {
            "name": "purchaseProportion",
            "type": "f32"
          },
          {
            "name": "index",
            "type": "u8"
          },
          {
            "name": "yieldAccountBump",
            "type": "u8"
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
      "name": "InvalidTreasury",
      "msg": "Invalid treasury account"
    },
    {
      "code": 6002,
      "name": "InvalidMint",
      "msg": "Invalid mint"
    },
    {
      "code": 6003,
      "name": "PurchaseThresholdExceeded",
      "msg": "Purchase threshold exceeded"
    },
    {
      "code": 6004,
      "name": "InvalidSwitchboardAccount",
      "msg": "The switchboard feed account is invalid"
    }
  ]
};

export const IDL: BuyAndBurn = {
  "version": "0.1.0",
  "name": "buy_and_burn",
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
          "name": "mint",
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
          "name": "state",
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
        }
      ],
      "args": [
        {
          "name": "state",
          "type": {
            "defined": "GenericStateInput"
          }
        }
      ]
    },
    {
      "name": "allocateYield",
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
          "name": "yieldAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "holdingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "holdingTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solUsdPriceFeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nctUsdPriceFeed",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
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
      "name": "setTotalTokensPurchased",
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
        }
      ],
      "args": [
        {
          "name": "value",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "state",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "updateAuthority",
            "type": "publicKey"
          },
          {
            "name": "treasury",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "solUsdPriceFeed",
            "type": "publicKey"
          },
          {
            "name": "nctUsdPriceFeed",
            "type": "publicKey"
          },
          {
            "name": "holdingAccount",
            "type": "publicKey"
          },
          {
            "name": "holdingTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "feedStalenessThreshold",
            "type": "u64"
          },
          {
            "name": "purchaseThreshold",
            "type": "u64"
          },
          {
            "name": "purchaseProportion",
            "type": "f32"
          },
          {
            "name": "totalTokensPurchased",
            "type": "u64"
          },
          {
            "name": "index",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "yieldAccountBump",
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
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "updateAuthority",
            "type": "publicKey"
          },
          {
            "name": "treasury",
            "type": "publicKey"
          },
          {
            "name": "holdingAccount",
            "type": "publicKey"
          },
          {
            "name": "holdingTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "solUsdPriceFeed",
            "type": "publicKey"
          },
          {
            "name": "nctUsdPriceFeed",
            "type": "publicKey"
          },
          {
            "name": "feedStalenessThreshold",
            "type": "u64"
          },
          {
            "name": "purchaseThreshold",
            "type": "u64"
          },
          {
            "name": "purchaseProportion",
            "type": "f32"
          },
          {
            "name": "index",
            "type": "u8"
          },
          {
            "name": "yieldAccountBump",
            "type": "u8"
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
      "name": "InvalidTreasury",
      "msg": "Invalid treasury account"
    },
    {
      "code": 6002,
      "name": "InvalidMint",
      "msg": "Invalid mint"
    },
    {
      "code": 6003,
      "name": "PurchaseThresholdExceeded",
      "msg": "Purchase threshold exceeded"
    },
    {
      "code": 6004,
      "name": "InvalidSwitchboardAccount",
      "msg": "The switchboard feed account is invalid"
    }
  ]
};
