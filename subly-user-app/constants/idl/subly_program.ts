/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/subly_program.json`.
 */
export type SublyProgram = {
  address: '5DpoKLMkQSBTi3n6hnjB7RPhzjhovfDZbEHJvFJBXKL9'
  metadata: {
    name: 'sublyProgram'
    version: '0.1.0'
    spec: '0.1.0'
    description: 'Created with Anchor'
  }
  instructions: [
    {
      name: 'deposit'
      discriminator: [242, 35, 198, 137, 82, 225, 242, 182]
      accounts: [
        {
          name: 'user'
          writable: true
          signer: true
        },
        {
          name: 'solVault'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [118, 97, 117, 108, 116]
              },
              {
                kind: 'account'
                path: 'user'
              },
            ]
          }
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'amount'
          type: 'u64'
        },
      ]
    },
    {
      name: 'registerSubscriptionService'
      discriminator: [152, 115, 189, 90, 214, 79, 127, 252]
      accounts: [
        {
          name: 'provider'
          writable: true
          signer: true
        },
        {
          name: 'subscriptionService'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [115, 117, 98, 115, 99, 114, 105, 112, 116, 105, 111, 110, 95, 115, 101, 114, 118, 105, 99, 101]
              },
              {
                kind: 'account'
                path: 'provider'
              },
            ]
          }
        },
        {
          name: 'tokenProgram'
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
        },
        {
          name: 'associatedTokenProgram'
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'name'
          type: 'string'
        },
        {
          name: 'feeUsd'
          type: 'u64'
        },
        {
          name: 'billingFrequencyDays'
          type: 'u64'
        },
        {
          name: 'provider'
          type: 'pubkey'
        },
      ]
    },
    {
      name: 'subscribeToService'
      discriminator: [27, 122, 87, 130, 20, 159, 241, 125]
      accounts: [
        {
          name: 'user'
          writable: true
          signer: true
        },
        {
          name: 'userSubscription'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [115, 117, 98, 115, 99, 114, 105, 112, 116, 105, 111, 110]
              },
              {
                kind: 'account'
                path: 'user'
              },
            ]
          }
        },
        {
          name: 'tokenProgram'
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
        },
        {
          name: 'associatedTokenProgram'
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'provider'
          type: 'pubkey'
        },
        {
          name: 'serviceId'
          type: 'u64'
        },
        {
          name: 'subscriptionId'
          type: 'u64'
        },
      ]
    },
  ]
  accounts: [
    {
      name: 'subscriptionService'
      discriminator: [121, 53, 131, 50, 242, 69, 101, 128]
    },
    {
      name: 'userSubscription'
      discriminator: [108, 179, 18, 43, 167, 65, 185, 163]
    },
  ]
  errors: [
    {
      code: 6000
      name: 'customError'
      msg: 'Custom error message'
    },
    {
      code: 6001
      name: 'nameTooLong'
      msg: 'Service name is too long'
    },
    {
      code: 6002
      name: 'urlTooLong'
      msg: 'Image URL is too long'
    },
    {
      code: 6003
      name: 'invalidFeeAmount'
      msg: 'Invalid fee amount'
    },
    {
      code: 6004
      name: 'invalidBillingFrequency'
      msg: 'Invalid billing frequency'
    },
  ]
  types: [
    {
      name: 'subscriptionService'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'provider'
            type: 'pubkey'
          },
          {
            name: 'serviceId'
            type: 'u64'
          },
          {
            name: 'name'
            type: 'string'
          },
          {
            name: 'feeUsd'
            type: 'u64'
          },
          {
            name: 'billingFrequencyDays'
            type: 'u64'
          },
          {
            name: 'createdAt'
            type: 'i64'
          },
          {
            name: 'bumps'
            type: 'u8'
          },
        ]
      }
    },
    {
      name: 'userSubscription'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'user'
            type: 'pubkey'
          },
          {
            name: 'provider'
            type: 'pubkey'
          },
          {
            name: 'serviceId'
            type: 'u64'
          },
          {
            name: 'subscriptionId'
            type: 'u64'
          },
          {
            name: 'subscribedAt'
            type: 'i64'
          },
          {
            name: 'isActive'
            type: 'bool'
          },
          {
            name: 'bumps'
            type: 'u8'
          },
        ]
      }
    },
  ]
  constants: [
    {
      name: 'seed'
      type: 'string'
      value: '"anchor"'
    },
  ]
}
