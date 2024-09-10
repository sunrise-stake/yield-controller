/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/fund_sender.json`.
 */
export type FundSender = {
  "address": "sfsH2CVS2SaXwnrGwgTVrG7ytZAxSCsTnW82BvjWTGz",
  "metadata": {
    "name": "fundSender",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
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
                "path": "state_in.destination_name"
              },
              {
                "kind": "arg",
                "path": "sunriseState"
              }
            ]
          }
        },
        {
          "name": "inputAccount",
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
      "name": "sendFromState",
      "discriminator": [
        119,
        32,
        214,
        129,
        74,
        57,
        186,
        185
      ],
      "accounts": [
        {
          "name": "state",
          "writable": true
        },
        {
          "name": "inputAccount",
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
      "args": []
    },
    {
      "name": "sendFund",
      "discriminator": [
        92,
        75,
        127,
        184,
        67,
        186,
        195,
        140
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
          "name": "inputAccount",
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
          "name": "destinationAccount",
          "writable": true
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
      "name": "storeCertificates",
      "discriminator": [
        106,
        243,
        105,
        136,
        61,
        36,
        94,
        218
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
          "name": "inputAccount",
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
          "name": "certificateMint"
        },
        {
          "name": "inputTokenAccount",
          "docs": [
            "A token account owned by the input_account"
          ],
          "writable": true
        },
        {
          "name": "certificateVault"
        },
        {
          "name": "certificateVaultAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "certificateVault"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "certificateMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": []
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
      "name": "incorrectOutputYieldAccount",
      "msg": "Incorrect output yield account"
    },
    {
      "code": 6002,
      "name": "incorrectTokenAccountOwner",
      "msg": "Token account not owned by output yield account"
    },
    {
      "code": 6003,
      "name": "incorrectDestinationAccount",
      "msg": "Incorrect destination account"
    },
    {
      "code": 6004,
      "name": "incorrectHoldAccount",
      "msg": "Incorrect hold account"
    },
    {
      "code": 6005,
      "name": "unauthorized",
      "msg": "Incorrect update authority"
    },
    {
      "code": 6006,
      "name": "noCertificatesFound",
      "msg": "No certificates found"
    }
  ],
  "types": [
    {
      "name": "genericStateInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "destinationName",
            "type": "string"
          },
          {
            "name": "updateAuthority",
            "type": "pubkey"
          },
          {
            "name": "destinationAccount",
            "type": "pubkey"
          },
          {
            "name": "certificateVault",
            "type": "pubkey"
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
            "name": "destinationName",
            "type": "string"
          },
          {
            "name": "destinationAccount",
            "type": "pubkey"
          },
          {
            "name": "certificateVault",
            "type": "pubkey"
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
            "name": "inputAccountBump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
