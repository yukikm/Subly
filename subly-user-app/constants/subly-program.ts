import { PublicKey } from '@solana/web3.js'

// Program ID deployed on Devnet
export const SUBLY_PROGRAM_ID = new PublicKey('w23po5aYmi7q71u7dwS2NfEL4otC7Ff7LnRFeCKywCG')

// IDL from the generated types
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
      name: 'depositSol'
      discriminator: [108, 81, 78, 117, 125, 155, 56, 200]
      accounts: [
        {
          name: 'user'
          writable: true
          signer: true
        },
        {
          name: 'userAccount'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [117, 115, 101, 114]
              },
              {
                kind: 'account'
                path: 'user'
              },
            ]
          }
        },
        {
          name: 'solVault'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [115, 111, 108, 95, 118, 97, 117, 108, 116]
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
      name: 'subscribeToService'
      discriminator: [27, 122, 87, 130, 20, 159, 241, 125]
      accounts: [
        {
          name: 'user'
          writable: true
          signer: true
        },
        {
          name: 'userAccount'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [117, 115, 101, 114]
              },
              {
                kind: 'account'
                path: 'user'
              },
            ]
          }
        },
        {
          name: 'subscriptionService'
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [115, 117, 98, 115, 99, 114, 105, 112, 116, 105, 111, 110, 95, 115, 101, 114, 118, 105, 99, 101]
              },
              {
                kind: 'arg'
                path: 'providerWallet'
              },
              {
                kind: 'arg'
                path: 'serviceId'
              },
            ]
          }
        },
        {
          name: 'userSubscription'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [117, 115, 101, 114, 95, 115, 117, 98, 115, 99, 114, 105, 112, 116, 105, 111, 110]
              },
              {
                kind: 'account'
                path: 'user'
              },
              {
                kind: 'account'
                path: 'user_account.subscription_count'
                account: 'user'
              },
            ]
          }
        },
        {
          name: 'certificateNftMint'
          writable: true
          signer: true
        },
        {
          name: 'certificateNftTokenAccount'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'account'
                path: 'user'
              },
              {
                kind: 'const'
                value: [
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
                  169,
                ]
              },
              {
                kind: 'account'
                path: 'certificateNftMint'
              },
            ]
            program: {
              kind: 'const'
              value: [
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
                89,
              ]
            }
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
        {
          name: 'rent'
          address: 'SysvarRent111111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'providerWallet'
          type: 'pubkey'
        },
        {
          name: 'serviceId'
          type: 'u64'
        },
      ]
    },
  ]
}

// Mock subscription services data (hardcoded as requested)
export const MOCK_SUBSCRIPTION_SERVICES = [
  {
    id: '1',
    provider: 'Netflix Protocol',
    name: 'Streaming Premium',
    feeUsd: 15.99,
    billingFrequencyDays: 30,
    imageUrl: 'https://via.placeholder.com/100x100/FF0000/FFFFFF?text=N',
    description: 'Premium streaming service with unlimited content access',
    features: ['4K Ultra HD', 'Multiple Devices', 'Offline Downloads'],
  },
  {
    id: '2',
    provider: 'Spotify Protocol',
    name: 'Music Premium',
    feeUsd: 9.99,
    billingFrequencyDays: 30,
    imageUrl: 'https://via.placeholder.com/100x100/1DB954/FFFFFF?text=S',
    description: 'Ad-free music streaming with offline capabilities',
    features: ['Ad-free', 'Offline Mode', 'High Quality Audio'],
  },
  {
    id: '3',
    provider: 'GitHub Protocol',
    name: 'Developer Pro',
    feeUsd: 20.0,
    billingFrequencyDays: 30,
    imageUrl: 'https://via.placeholder.com/100x100/24292E/FFFFFF?text=G',
    description: 'Advanced development tools and collaboration features',
    features: ['Private Repositories', 'Advanced Analytics', 'Priority Support'],
  },
  {
    id: '4',
    provider: 'Cloud Storage Protocol',
    name: 'Storage Plus',
    feeUsd: 5.99,
    billingFrequencyDays: 30,
    imageUrl: 'https://via.placeholder.com/100x100/4285F4/FFFFFF?text=C',
    description: 'Secure cloud storage with advanced encryption',
    features: ['1TB Storage', 'End-to-End Encryption', 'File Versioning'],
  },
]

// PDA seed constants
export const SEEDS = {
  USER: Buffer.from('user'),
  SOL_VAULT: Buffer.from('sol_vault'),
  SUBSCRIPTION_SERVICE: Buffer.from('subscription_service'),
  USER_SUBSCRIPTION: Buffer.from('user_subscription'),
  PROVIDER: Buffer.from('provider'),
}
