export type TreasuryController = {
  "version": "0.1.0",
  "name": "treasury_controller",
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
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treasuryTokenAccount",
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
        }
      ],
      "args": [
        {
          "name": "amount",
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
            "name": "market",
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
            "name": "mint",
            "type": "publicKey"
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
            "name": "market",
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
            "name": "purchaseThreshold",
            "type": "u64"
          },
          {
            "name": "purchaseProportion",
            "type": "f32"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "CalculationFailure",
      "msg": "An error occurred when calculating an MSol value"
    }
  ]
};

export const IDL: TreasuryController = {
  "version": "0.1.0",
  "name": "treasury_controller",
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
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "treasuryTokenAccount",
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
        }
      ],
      "args": [
        {
          "name": "amount",
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
            "name": "market",
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
            "name": "mint",
            "type": "publicKey"
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
            "name": "market",
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
            "name": "purchaseThreshold",
            "type": "u64"
          },
          {
            "name": "purchaseProportion",
            "type": "f32"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "CalculationFailure",
      "msg": "An error occurred when calculating an MSol value"
    }
  ]
};
