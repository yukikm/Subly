/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/subly_program.json`.
 */
export type SublyProgram = {
  "address": "w23po5aYmi7q71u7dwS2NfEL4otC7Ff7LnRFeCKywCG",
  "metadata": {
    "name": "sublyProgram",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "depositSol",
      "discriminator": [
        108,
        81,
        78,
        117,
        125,
        155,
        56,
        200
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "solVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
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
      "name": "getSubscriptionService",
      "discriminator": [
        232,
        161,
        50,
        184,
        141,
        0,
        26,
        59
      ],
      "accounts": [
        {
          "name": "subscriptionService",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  115,
                  99,
                  114,
                  105,
                  112,
                  116,
                  105,
                  111,
                  110,
                  95,
                  115,
                  101,
                  114,
                  118,
                  105,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "providerWallet"
              },
              {
                "kind": "arg",
                "path": "serviceId"
              }
            ]
          }
        },
        {
          "name": "providerWallet"
        }
      ],
      "args": [
        {
          "name": "serviceId",
          "type": "u64"
        }
      ],
      "returns": {
        "defined": {
          "name": "subscriptionServiceInfo"
        }
      }
    },
    {
      "name": "getSubscriptionServices",
      "discriminator": [
        26,
        52,
        229,
        135,
        174,
        119,
        98,
        189
      ],
      "accounts": [
        {
          "name": "providerAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "providerWallet"
              }
            ]
          }
        },
        {
          "name": "providerWallet"
        }
      ],
      "args": [],
      "returns": {
        "vec": {
          "defined": {
            "name": "subscriptionServiceInfo"
          }
        }
      }
    },
    {
      "name": "getUserBalance",
      "discriminator": [
        244,
        189,
        220,
        239,
        164,
        70,
        32,
        235
      ],
      "accounts": [
        {
          "name": "userAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "userWallet"
              }
            ]
          }
        },
        {
          "name": "userWallet"
        }
      ],
      "args": [],
      "returns": {
        "defined": {
          "name": "userBalanceInfo"
        }
      }
    },
    {
      "name": "getUserSubscription",
      "discriminator": [
        135,
        62,
        145,
        5,
        157,
        161,
        48,
        137
      ],
      "accounts": [
        {
          "name": "userSubscription",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  115,
                  117,
                  98,
                  115,
                  99,
                  114,
                  105,
                  112,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "userWallet"
              },
              {
                "kind": "arg",
                "path": "subscriptionId"
              }
            ]
          }
        },
        {
          "name": "subscriptionService",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  115,
                  99,
                  114,
                  105,
                  112,
                  116,
                  105,
                  111,
                  110,
                  95,
                  115,
                  101,
                  114,
                  118,
                  105,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user_subscription.provider",
                "account": "userSubscription"
              },
              {
                "kind": "account",
                "path": "user_subscription.service_id",
                "account": "userSubscription"
              }
            ]
          }
        },
        {
          "name": "userWallet"
        }
      ],
      "args": [
        {
          "name": "subscriptionId",
          "type": "u64"
        }
      ],
      "returns": {
        "defined": {
          "name": "userSubscriptionInfo"
        }
      }
    },
    {
      "name": "getUserSubscriptions",
      "discriminator": [
        70,
        242,
        39,
        146,
        213,
        249,
        69,
        204
      ],
      "accounts": [
        {
          "name": "userAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "userWallet"
              }
            ]
          }
        },
        {
          "name": "userWallet"
        }
      ],
      "args": [],
      "returns": {
        "vec": {
          "defined": {
            "name": "userSubscriptionInfo"
          }
        }
      }
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [],
      "args": []
    },
    {
      "name": "registerSubscriptionService",
      "discriminator": [
        152,
        115,
        189,
        90,
        214,
        79,
        127,
        252
      ],
      "accounts": [
        {
          "name": "provider",
          "writable": true,
          "signer": true
        },
        {
          "name": "providerAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  118,
                  105,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "provider"
              }
            ]
          }
        },
        {
          "name": "subscriptionService",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  115,
                  99,
                  114,
                  105,
                  112,
                  116,
                  105,
                  111,
                  110,
                  95,
                  115,
                  101,
                  114,
                  118,
                  105,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "provider"
              },
              {
                "kind": "account",
                "path": "provider_account.service_count",
                "account": "provider"
              }
            ]
          }
        },
        {
          "name": "nftMint",
          "writable": true,
          "signer": true
        },
        {
          "name": "nftTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "provider"
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
                "path": "nftMint"
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
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "feeUsd",
          "type": "u64"
        },
        {
          "name": "billingFrequencyDays",
          "type": "u64"
        },
        {
          "name": "imageUrl",
          "type": "string"
        }
      ]
    },
    {
      "name": "subscribeToService",
      "discriminator": [
        27,
        122,
        87,
        130,
        20,
        159,
        241,
        125
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "subscriptionService",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  115,
                  99,
                  114,
                  105,
                  112,
                  116,
                  105,
                  111,
                  110,
                  95,
                  115,
                  101,
                  114,
                  118,
                  105,
                  99,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "providerWallet"
              },
              {
                "kind": "arg",
                "path": "serviceId"
              }
            ]
          }
        },
        {
          "name": "userSubscription",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  115,
                  117,
                  98,
                  115,
                  99,
                  114,
                  105,
                  112,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "user_account.subscription_count",
                "account": "user"
              }
            ]
          }
        },
        {
          "name": "certificateNftMint",
          "writable": true,
          "signer": true
        },
        {
          "name": "certificateNftTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
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
                "path": "certificateNftMint"
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
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "providerWallet",
          "type": "pubkey"
        },
        {
          "name": "serviceId",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "provider",
      "discriminator": [
        164,
        180,
        71,
        17,
        75,
        216,
        80,
        195
      ]
    },
    {
      "name": "subscriptionService",
      "discriminator": [
        121,
        53,
        131,
        50,
        242,
        69,
        101,
        128
      ]
    },
    {
      "name": "user",
      "discriminator": [
        159,
        117,
        95,
        227,
        239,
        151,
        58,
        236
      ]
    },
    {
      "name": "userSubscription",
      "discriminator": [
        108,
        179,
        18,
        43,
        167,
        65,
        185,
        163
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "customError",
      "msg": "Custom error message"
    },
    {
      "code": 6001,
      "name": "nameTooLong",
      "msg": "Service name is too long"
    },
    {
      "code": 6002,
      "name": "urlTooLong",
      "msg": "Image URL is too long"
    },
    {
      "code": 6003,
      "name": "invalidFeeAmount",
      "msg": "Invalid fee amount"
    },
    {
      "code": 6004,
      "name": "invalidBillingFrequency",
      "msg": "Invalid billing frequency"
    }
  ],
  "types": [
    {
      "name": "provider",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "serviceCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "subscriptionService",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "provider",
            "type": "pubkey"
          },
          {
            "name": "serviceId",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "feeUsd",
            "type": "u64"
          },
          {
            "name": "billingFrequencyDays",
            "type": "u64"
          },
          {
            "name": "imageUrl",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "subscriptionServiceInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "provider",
            "type": "pubkey"
          },
          {
            "name": "serviceId",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "feeUsd",
            "type": "u64"
          },
          {
            "name": "billingFrequencyDays",
            "type": "u64"
          },
          {
            "name": "imageUrl",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "depositedSol",
            "type": "u64"
          },
          {
            "name": "subscriptionCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "userBalanceInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "depositedSol",
            "type": "u64"
          },
          {
            "name": "subscriptionCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "userSubscription",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "provider",
            "type": "pubkey"
          },
          {
            "name": "serviceId",
            "type": "u64"
          },
          {
            "name": "subscriptionId",
            "type": "u64"
          },
          {
            "name": "subscribedAt",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "userSubscriptionInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "subscriptionId",
            "type": "u64"
          },
          {
            "name": "providerWallet",
            "type": "pubkey"
          },
          {
            "name": "serviceName",
            "type": "string"
          },
          {
            "name": "feeUsd",
            "type": "u64"
          },
          {
            "name": "billingFrequencyDays",
            "type": "u64"
          },
          {
            "name": "imageUrl",
            "type": "string"
          },
          {
            "name": "subscribedAt",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "seed",
      "type": "string",
      "value": "\"anchor\""
    }
  ]
};
