export type YieldRouter = {
  "version": "0.1.0",
  "name": "yield_router",
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
          "name": "inputYieldAccount",
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
      "name": "allocateYield",
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
          "name": "inputYieldAccount",
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
            "name": "sunriseState",
            "type": "publicKey"
          },
          {
            "name": "updateAuthority",
            "type": "publicKey"
          },
          {
            "name": "outputYieldAccounts",
            "type": {
              "vec": "publicKey"
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
  ],
  "types": [
    {
      "name": "GenericStateInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "updateAuthority",
            "type": "publicKey"
          },
          {
            "name": "outputYieldAccounts",
            "type": {
              "vec": "publicKey"
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
      "name": "IncorrectInputYieldAccount",
      "msg": "Incorrect input yield account"
    },
    {
      "code": 6002,
      "name": "IncorrectOutputYieldAccount",
      "msg": "Incorrect output yield account"
    },
    {
      "code": 6003,
      "name": "InvalidProportions",
      "msg": "Invalid spend proportions"
    },
    {
      "code": 6004,
      "name": "Unauthorized",
      "msg": "Incorrect update authority"
    }
  ]
};

export const IDL: YieldRouter = {
  "version": "0.1.0",
  "name": "yield_router",
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
          "name": "inputYieldAccount",
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
      "name": "allocateYield",
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
          "name": "inputYieldAccount",
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
            "name": "sunriseState",
            "type": "publicKey"
          },
          {
            "name": "updateAuthority",
            "type": "publicKey"
          },
          {
            "name": "outputYieldAccounts",
            "type": {
              "vec": "publicKey"
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
  ],
  "types": [
    {
      "name": "GenericStateInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "updateAuthority",
            "type": "publicKey"
          },
          {
            "name": "outputYieldAccounts",
            "type": {
              "vec": "publicKey"
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
      "name": "IncorrectInputYieldAccount",
      "msg": "Incorrect input yield account"
    },
    {
      "code": 6002,
      "name": "IncorrectOutputYieldAccount",
      "msg": "Incorrect output yield account"
    },
    {
      "code": 6003,
      "name": "InvalidProportions",
      "msg": "Invalid spend proportions"
    },
    {
      "code": 6004,
      "name": "Unauthorized",
      "msg": "Incorrect update authority"
    }
  ]
};
