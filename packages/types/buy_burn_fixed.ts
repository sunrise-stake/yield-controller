export type BuyBurnFixed = {
  "version": "0.1.0",
  "name": "buy_burn_fixed",
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
          "name": "yieldAccount",
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
          "name": "yieldAccount",
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
      "name": "updatePrice",
      "accounts": [
        {
          "name": "yieldAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "price",
          "type": "u64"
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
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "AllocateYieldInput"
          }
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
            "name": "price",
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
            "name": "holdingAccount",
            "type": "publicKey"
          },
          {
            "name": "holdingTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "totalSpent",
            "type": "u64"
          },
          {
            "name": "bump",
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
            "name": "price",
            "type": "u64"
          },
          {
            "name": "purchaseThreshold",
            "type": "u64"
          },
          {
            "name": "purchaseProportion",
            "type": "f32"
          }
        ]
      }
    },
    {
      "name": "AllocateYieldInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "solAmount",
            "type": "u64"
          },
          {
            "name": "tokenAmount",
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
      "msg": "insufficient funds for transaction"
    },
    {
      "code": 6001,
      "name": "InvalidTreasury",
      "msg": "invalid treasury account"
    },
    {
      "code": 6002,
      "name": "InvalidMint",
      "msg": "invalid mint"
    },
    {
      "code": 6003,
      "name": "PurchaseThresholdExceeded",
      "msg": "purchase threshold exceeded"
    }
  ]
};

export const IDL: BuyBurnFixed = {
  "version": "0.1.0",
  "name": "buy_burn_fixed",
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
          "name": "yieldAccount",
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
          "name": "yieldAccount",
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
      "name": "updatePrice",
      "accounts": [
        {
          "name": "yieldAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "price",
          "type": "u64"
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
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "AllocateYieldInput"
          }
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
            "name": "price",
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
            "name": "holdingAccount",
            "type": "publicKey"
          },
          {
            "name": "holdingTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "totalSpent",
            "type": "u64"
          },
          {
            "name": "bump",
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
            "name": "price",
            "type": "u64"
          },
          {
            "name": "purchaseThreshold",
            "type": "u64"
          },
          {
            "name": "purchaseProportion",
            "type": "f32"
          }
        ]
      }
    },
    {
      "name": "AllocateYieldInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "solAmount",
            "type": "u64"
          },
          {
            "name": "tokenAmount",
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
      "msg": "insufficient funds for transaction"
    },
    {
      "code": 6001,
      "name": "InvalidTreasury",
      "msg": "invalid treasury account"
    },
    {
      "code": 6002,
      "name": "InvalidMint",
      "msg": "invalid mint"
    },
    {
      "code": 6003,
      "name": "PurchaseThresholdExceeded",
      "msg": "purchase threshold exceeded"
    }
  ]
};
