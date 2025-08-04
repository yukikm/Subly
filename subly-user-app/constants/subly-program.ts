import { PublicKey } from '@solana/web3.js'

// Program ID
export const SUBLY_PROGRAM_ID = new PublicKey('5DpoKLMkQSBTi3n6hnjB7RPhzjhovfDZbEHJvFJBXKL9')

// Seeds from IDL
export const SEEDS = {
  VAULT: Buffer.from('vault', 'utf8'),
  SUBSCRIPTION_SERVICE: Buffer.from('subscription_service', 'utf8'),
  SUBSCRIPTION: Buffer.from('subscription', 'utf8'),
}

// Mock Netflix subscription service data
export const MOCK_SUBSCRIPTION_SERVICES = [
  {
    id: '1',
    provider: '7xKXtg2CW3bJWk5nD4vK8JW4yUGf5rW3Q6vKJmG9P2zK', // Mock provider
    name: 'Netflix',
    feeUsd: 7,
    billingFrequencyDays: 30,
    imageUrl: 'https://www.freepnglogos.com/uploads/netflix-logo-0.png',
    description: 'Stream unlimited movies and TV shows with Netflix Premium',
    features: [
      'Unlimited streaming',
      '4K Ultra HD quality',
      'Multiple device support',
      'No ads',
      'Download for offline viewing',
    ],
  },
]

export interface SubscriptionService {
  id: string
  provider: string
  name: string
  feeUsd: number
  billingFrequencyDays: number
  imageUrl: string
  description: string
  features: string[]
}
