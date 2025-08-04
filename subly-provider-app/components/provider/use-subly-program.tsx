import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWalletUi } from '@/components/solana/use-wallet-ui'
import { useConnection } from '@/components/solana/solana-provider'
import { PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor'
import { SublyProgram } from '@/constants/idl/subly_program'
import sublyProgramIdl from '@/constants/idl/subly_program.json'

const PROGRAM_ID = new PublicKey('5DpoKLMkQSBTi3n6hnjB7RPhzjhovfDZbEHJvFJBXKL9')

// Helper function to derive PDAs according to the IDL
function getSubscriptionServicePDA(provider: PublicKey, programId: PublicKey) {
  try {
    // From IDL: seeds = ["subscription_service", provider]
    const subscriptionServiceSeed = 'subscription_service'
    const seeds = [Buffer.from(subscriptionServiceSeed, 'utf8'), provider.toBuffer()]
    console.log('PDA seeds created:', seeds)
    return PublicKey.findProgramAddressSync(seeds, programId)
  } catch (error) {
    console.error('Error creating PDA:', error)
    throw error
  }
}

interface RegisterServiceInput {
  name: string
  feeUsd: number
  billingFrequencyDays: number
}

interface SubscriptionServiceInfo {
  provider: string
  serviceId: number
  name: string
  feeUsd: number
  billingFrequencyDays: number
  createdAt: number
}

// Mobile Wallet Adapter for Anchor
class MobileWalletAdapter {
  constructor(public publicKey: PublicKey) {}

  async signTransaction(tx: any) {
    // This will be handled by the Mobile Wallet Adapter
    return tx
  }

  async signAllTransactions(txs: any[]) {
    // This will be handled by the Mobile Wallet Adapter
    return txs
  }
}

export function useRegisterSubscriptionService() {
  const { account, signAndSendTransaction } = useWalletUi()
  const connection = useConnection()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: RegisterServiceInput): Promise<string> => {
      if (!account) {
        throw new Error('Wallet not connected')
      }

      try {
        console.log('Registering service with input:', input)
        console.log('Provider wallet:', account.publicKey.toString())

        // Create wallet adapter for Anchor
        const walletAdapter = new MobileWalletAdapter(account.publicKey)

        // Create Anchor provider
        const provider = new AnchorProvider(connection, walletAdapter as any, {
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
        })

        // Create program instance
        const program = new Program<SublyProgram>(sublyProgramIdl as any, provider)

        console.log('Program ID:', PROGRAM_ID.toString())

        // Derive subscription service PDA according to IDL
        const [subscriptionService] = getSubscriptionServicePDA(account.publicKey, PROGRAM_ID)
        console.log('Subscription Service PDA:', subscriptionService.toString())

        // Get latest blockhash
        const latestBlockhash = await connection.getLatestBlockhash('confirmed')
        console.log('Latest blockhash:', latestBlockhash.blockhash)

        // Build instruction using Anchor
        console.log('Building instruction with Anchor...')
        const instruction = await program.methods
          .registerSubscriptionService(
            input.name,
            new BN(Math.floor(input.feeUsd * 100)), // Convert to cents
            new BN(input.billingFrequencyDays),
            account.publicKey, // provider pubkey argument
          )
          .accountsPartial({
            provider: account.publicKey,
            subscriptionService: subscriptionService,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .instruction()

        console.log('Instruction created successfully')

        // Create versioned transaction message
        const txMessage = new TransactionMessage({
          payerKey: account.publicKey,
          recentBlockhash: latestBlockhash.blockhash,
          instructions: [instruction],
        }).compileToV0Message()

        // Create versioned transaction
        const transaction = new VersionedTransaction(txMessage)

        console.log('Transaction created, signing and sending...')

        // Use the existing Mobile Wallet Adapter integration
        // This automatically handles authorization if already connected
        const signature = await signAndSendTransaction(transaction, latestBlockhash.lastValidBlockHeight)

        console.log('Service registered successfully:', signature)

        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          'confirmed',
        )

        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`)
        }

        console.log('Transaction confirmed:', signature)
        return signature
      } catch (error: any) {
        console.error('Error registering service:', error)

        // Handle specific Mobile Wallet Adapter errors
        if (
          error.message?.includes('User rejected') ||
          error.message?.includes('cancelled') ||
          error.name === 'UserRejectedRequestError'
        ) {
          throw new Error('Cancelled')
        } else if (error.message?.includes('Simulation failed')) {
          throw new Error('Insufficient funds')
        } else if (error.message?.includes('blockhash not found')) {
          throw new Error('Expired')
        } else {
          throw new Error('Failed')
        }
      }
    },
    onSuccess: () => {
      // Invalidate provider services query
      queryClient.invalidateQueries({ queryKey: ['provider-services', account?.publicKey?.toString()] })
    },
  })
}

export function useGetProviderServices() {
  const { account } = useWalletUi()
  const connection = useConnection()

  return useQuery({
    queryKey: ['provider-services', account?.publicKey?.toString()],
    queryFn: async (): Promise<SubscriptionServiceInfo[]> => {
      if (!account) {
        return []
      }

      try {
        console.log('Fetching services for provider:', account.publicKey.toString())

        // Create wallet adapter for Anchor
        const walletAdapter = new MobileWalletAdapter(account.publicKey)

        // Create Anchor provider
        const provider = new AnchorProvider(connection, walletAdapter as any, {
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
        })

        // Create program instance
        const program = new Program<SublyProgram>(sublyProgramIdl as any, provider)

        // Derive subscription service PDA for this provider
        const [subscriptionService] = getSubscriptionServicePDA(account.publicKey, PROGRAM_ID)

        try {
          // Try to fetch the subscription service account using Anchor
          const serviceAccount = await program.account.subscriptionService.fetch(subscriptionService)

          // Transform the data to match our interface
          return [
            {
              provider: serviceAccount.provider.toString(),
              serviceId: serviceAccount.serviceId.toNumber(),
              name: serviceAccount.name,
              feeUsd: serviceAccount.feeUsd.toNumber() / 100, // Convert from cents
              billingFrequencyDays: serviceAccount.billingFrequencyDays.toNumber(),
              createdAt: serviceAccount.createdAt.toNumber() * 1000, // Convert to milliseconds
            },
          ]
        } catch (fetchError) {
          console.log('No service found for this provider:', fetchError)
          return []
        }
      } catch (error) {
        console.log('Error fetching services:', error)
        return []
      }
    },
    enabled: !!account,
  })
}
