/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/buy_burn_fixed.json`.
 */
export type BuyBurnFixed = {
  "address": "stcGmoLCBsr2KSu2vvcSuqMiEZx36F32ySUtCXjab5B",
  "metadata": {
    "name": "buyBurnFixed",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "allocateYield",
      "discriminator": [
        225,
        224,
        81,
        124,
        246,
        226,
        35,
        240
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "writable": true
        },
        {
          "name": "mint",
          "writable": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "treasury",
          "writable": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "holdingAccount",
          "writable": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "holdingTokenAccount",
          "writable": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "allocateYieldInput"
            }
          }
        }
      ]
    },
    {
      "name": "registerState",
      "discriminator": [
        137,
        35,
        194,
        234,
        128,
        215,
        19,
        45
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "yieldAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "state_in.mint"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "state",
          "type": {
            "defined": {
              "name": "genericStateInput"
            }
          }
        }
      ]
    },
    {
      "name": "updatePrice",
      "discriminator": [
        61,
        34,
        117,
        155,
        75,
        34,
        123,
        208
      ],
      "accounts": [
        {
          "name": "state",
          "writable": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
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
      "name": "updateState",
      "discriminator": [
        135,
        112,
        215,
        75,
        247,
        185,
        53,
        176
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "yieldAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "state_in.mint"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "state",
          "type": {
            "defined": {
              "name": "genericStateInput"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "state",
      "discriminator": [
        216,
        146,
        107,
        94,
        104,
        75,
        182,
        177
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "insufficientFundsForTransaction",
      "msg": "insufficient funds for transaction"
    },
    {
      "code": 6001,
      "name": "invalidTreasury",
      "msg": "invalid treasury account"
    },
    {
      "code": 6002,
      "name": "invalidMint",
      "msg": "invalid mint"
    },
    {
      "code": 6003,
      "name": "purchaseThresholdExceeded",
      "msg": "purchase threshold exceeded"
    }
  ],
  "types": [
    {
      "name": "allocateYieldInput",
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
    },
    {
      "name": "genericStateInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "updateAuthority",
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "holdingAccount",
            "type": "pubkey"
          },
          {
            "name": "holdingTokenAccount",
            "type": "pubkey"
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
      "name": "state",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "updateAuthority",
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
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
            "type": "pubkey"
          },
          {
            "name": "holdingTokenAccount",
            "type": "pubkey"
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
  ]
};
