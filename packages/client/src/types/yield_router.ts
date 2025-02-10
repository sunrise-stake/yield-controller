/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/yield_router.json`.
 */
export type YieldRouter = {
  "address": "syriqUnUPcFQjRSaxdFo2wPnXXPjbRsLmhiWUVoGdTo",
  "metadata": {
    "name": "yieldRouter",
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
          "name": "state"
        },
        {
          "name": "inputYieldAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  112,
                  117,
                  116,
                  95,
                  121,
                  105,
                  101,
                  108,
                  100,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "state"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
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
          "name": "state",
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
                "path": "sunriseState"
              }
            ]
          }
        },
        {
          "name": "inputYieldAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  112,
                  117,
                  116,
                  95,
                  121,
                  105,
                  101,
                  108,
                  100,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "state"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "sunriseState",
          "type": "pubkey"
        },
        {
          "name": "stateIn",
          "type": {
            "defined": {
              "name": "genericStateInput"
            }
          }
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
          "name": "state",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "stateIn",
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
      "msg": "Insufficient funds for transaction"
    },
    {
      "code": 6001,
      "name": "incorrectInputYieldAccount",
      "msg": "Incorrect input yield account"
    },
    {
      "code": 6002,
      "name": "incorrectOutputYieldAccount",
      "msg": "Incorrect output yield account"
    },
    {
      "code": 6003,
      "name": "invalidProportions",
      "msg": "Invalid spend proportions"
    },
    {
      "code": 6004,
      "name": "unauthorized",
      "msg": "Incorrect update authority"
    }
  ],
  "types": [
    {
      "name": "genericStateInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "updateAuthority",
            "type": "pubkey"
          },
          {
            "name": "outputYieldAccounts",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "spendProportions",
            "type": "bytes"
          },
          {
            "name": "spendThreshold",
            "type": "u64"
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
            "name": "sunriseState",
            "type": "pubkey"
          },
          {
            "name": "updateAuthority",
            "type": "pubkey"
          },
          {
            "name": "outputYieldAccounts",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "spendProportions",
            "type": "bytes"
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
            "name": "inputYieldAccountBump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
