import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWalletUi } from '@/components/solana/use-wallet-ui'
import { useConnection } from '@/components/solana/solana-provider'
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token'
import { SublyProgram } from '@/constants/idl/subly_program'
import sublyProgramIdl from '@/constants/idl/subly_program.json'

const PROGRAM_ID = new PublicKey('w23po5aYmi7q71u7dwS2NfEL4otC7Ff7LnRFeCKywCG')

// Helper function to derive PDAs
function getProviderAccountPDA(provider: PublicKey, programId: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from('provider'), provider.toBuffer()], programId)
}

function getSubscriptionServicePDA(provider: PublicKey, serviceCount: number, programId: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('subscription_service'), provider.toBuffer(), new BN(serviceCount).toArrayLike(Buffer, 'le', 8)],
    programId,
  )
}

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

        // Create wallet adapter
        const wallet = new MobileWalletAdapter(account.publicKey)

        // Create Anchor provider
        const provider = new AnchorProvider(connection, wallet as any, { commitment: 'processed' })

        // Create program instance
        const program = new Program<SublyProgram>(sublyProgramIdl as any, provider)

        // Generate NFT mint keypair
        const nftMint = Keypair.generate()

        console.log('NFT Mint:', nftMint.publicKey.toString())

        // Derive PDAs
        const [providerAccount] = getProviderAccountPDA(account.publicKey, PROGRAM_ID)

        // Try to fetch provider account to get current service count
        let serviceCount = 0
        try {
          const providerAccountInfo = await program.account.provider.fetchNullable(providerAccount)
          if (providerAccountInfo) {
            serviceCount = providerAccountInfo.serviceCount
            console.log('Current service count:', serviceCount)
          } else {
            console.log('Provider account not found, will be created during service registration')
          }
        } catch {
          console.log('Could not fetch provider account, assuming new provider')
        }

        const [subscriptionService] = getSubscriptionServicePDA(account.publicKey, serviceCount, PROGRAM_ID)

        // Calculate associated token account for NFT
        const nftTokenAccount = await getAssociatedTokenAddress(nftMint.publicKey, account.publicKey)

        console.log('Provider Account PDA:', providerAccount.toString())
        console.log('Subscription Service PDA:', subscriptionService.toString())
        console.log('NFT Token Account:', nftTokenAccount.toString())

        // Get recent blockhash
        const latestBlockhash = await connection.getLatestBlockhash()

        // Build the transaction using Anchor with all required accounts
        const tx = await program.methods
          .registerSubscriptionService(
            input.name,
            new BN(input.feeUsd * 100), // Convert to cents
            new BN(input.billingFrequencyDays),
            input.imageUrl,
          )
          .accountsPartial({
            provider: account.publicKey,
            providerAccount: providerAccount,
            subscriptionService: subscriptionService,
            nftMint: nftMint.publicKey,
            nftTokenAccount: nftTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .transaction()

        // Set transaction properties
        tx.feePayer = account.publicKey
        tx.recentBlockhash = latestBlockhash.blockhash

        // Add the NFT mint as a signer
        tx.partialSign(nftMint)

        console.log('Transaction built, sending...')

        try {
          // Sign and send transaction using Mobile Wallet Adapter
          const signature = await signAndSendTransaction(tx, latestBlockhash.lastValidBlockHeight)

          console.log('Service registered successfully:', signature)
          return signature
        } catch (txError: any) {
          console.error('Transaction error:', txError)

          if (
            txError.message?.includes('User rejected') ||
            txError.message?.includes('cancelled') ||
            txError.name === 'CancellationException'
          ) {
            throw new Error('Transaction was cancelled by user')
          } else if (txError.message?.includes('Simulation failed')) {
            throw new Error('Transaction simulation failed. Please check your account balance and try again.')
          } else if (txError.message?.includes('timeout')) {
            throw new Error('Transaction timed out. Please try again.')
          } else {
            throw new Error(`Transaction failed: ${txError.message || 'Unknown error'}`)
          }
        }
      } catch (error: any) {
        console.error('Error registering service:', error)

        // Provide more specific error messages
        if (error.message?.includes('insufficient funds')) {
          throw new Error('Insufficient funds to complete the transaction')
        } else if (error.message?.includes('blockhash not found')) {
          throw new Error('Transaction expired. Please try again.')
        } else if (error.message?.includes('AccountNotFound')) {
          throw new Error('Provider account not found. Please initialize your provider account first.')
        } else {
          throw error
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
        // Create wallet adapter
        const wallet = new MobileWalletAdapter(account.publicKey)

        // Create Anchor provider
        const provider = new AnchorProvider(connection, wallet as any, { commitment: 'processed' })

        // Create program instance
        const program = new Program<SublyProgram>(sublyProgramIdl as any, provider)

        console.log('Fetching services for provider:', account.publicKey.toString())

        // Call the program method to get services
        const services = await program.methods
          .getSubscriptionServices()
          .accountsPartial({
            providerWallet: account.publicKey,
          })
          .view()

        console.log('Retrieved services:', services)

        // Transform the data to match our interface
        return services.map((service: any) => ({
          provider: service.provider.toString(),
          serviceId: service.serviceId.toNumber(),
          name: service.name,
          feeUsd: service.feeUsd.toNumber() / 100, // Convert from cents
          billingFrequencyDays: service.billingFrequencyDays.toNumber(),
          imageUrl: service.imageUrl,
          createdAt: service.createdAt.toNumber() * 1000, // Convert to milliseconds
        }))
      } catch (error) {
        console.log('No services found for provider or error occurred:', error)

        // Return empty array if no services found
        return []
      }
    },
    enabled: !!account,
  })
}
