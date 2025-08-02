import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWalletUi } from '@/components/solana/use-wallet-ui'

interface RegisterServiceInput {
  name: string
  feeUsd: number
  billingFrequencyDays: number
  imageUrl: string
}

interface SubscriptionServiceInfo {
  provider: string
  serviceId: number
  name: string
  feeUsd: number
  billingFrequencyDays: number
  imageUrl: string
  createdAt: number
}

export function useRegisterSubscriptionService() {
  const { account } = useWalletUi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: RegisterServiceInput): Promise<string> => {
      if (!account) {
        throw new Error('Wallet not connected')
      }

      // Mock implementation - simulate transaction
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate network delay

      console.log('Registering service:', input)

      // Mock transaction signature
      return 'mock_transaction_signature_' + Date.now()
    },
    onSuccess: () => {
      // Invalidate provider services query
      queryClient.invalidateQueries({ queryKey: ['provider-services', account?.publicKey?.toString()] })
    },
  })
}

export function useGetProviderServices() {
  const { account } = useWalletUi()

  return useQuery({
    queryKey: ['provider-services', account?.publicKey?.toString()],
    queryFn: async (): Promise<SubscriptionServiceInfo[]> => {
      if (!account) {
        return []
      }

      // Mock data - in a real implementation, this would call the Solana program
      const mockServices: SubscriptionServiceInfo[] = [
        {
          provider: account.publicKey.toString(),
          serviceId: 0,
          name: 'Netflix Premium',
          feeUsd: 15.99,
          billingFrequencyDays: 30,
          imageUrl: 'https://via.placeholder.com/100x100?text=Netflix',
          createdAt: Date.now() - 86400000, // Yesterday
        },
        {
          provider: account.publicKey.toString(),
          serviceId: 1,
          name: 'Spotify Premium',
          feeUsd: 9.99,
          billingFrequencyDays: 30,
          imageUrl: 'https://via.placeholder.com/100x100?text=Spotify',
          createdAt: Date.now() - 172800000, // 2 days ago
        },
      ]

      return mockServices
    },
    enabled: !!account,
  })
}
