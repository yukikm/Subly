import { useConnection } from '@/components/solana/solana-provider'
import { useWalletUi } from '@/components/solana/use-wallet-ui'
import { createDepositInstruction, createSubscribeToServiceInstruction } from '@/components/subly/use-subly-program'
import { PublicKey } from '@solana/web3.js'
import { useState } from 'react'
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js'

export function useDepositSol() {
  const connection = useConnection()
  const { account } = useWalletUi()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const depositSol = async (amount: number) => {
    if (!account?.publicKey) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log(`Depositing ${amount} SOL...`)

      // Create the transaction
      const transaction = await createDepositInstruction(connection, account.publicKey, amount)

      console.log('Transaction created, requesting signature...')

      // Use Mobile Wallet Adapter to sign and send
      const result = await transact(async (wallet) => {
        // Request authorization if needed
        await wallet.authorize({
          cluster: 'devnet',
          identity: { name: 'Subly User App' },
        })

        console.log('Authorization successful, signing transaction...')

        // Sign the transaction
        const signedTransactions = await wallet.signTransactions({
          transactions: [transaction],
        })

        console.log('Transaction signed, sending...')

        // Send the transaction
        const signature = await connection.sendRawTransaction(signedTransactions[0].serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        })

        // Confirm the transaction
        console.log('Transaction sent, waiting for confirmation...')
        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash: transaction.message.recentBlockhash!,
            lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
          },
          'confirmed',
        )

        return { signature, confirmation }
      })

      console.log('Deposit successful:', result.signature)
      return result.signature
    } catch (err) {
      console.error('Deposit error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    depositSol,
    isLoading,
    error,
  }
}

export function useSubscribeToService() {
  const connection = useConnection()
  const { account } = useWalletUi()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subscribeToService = async (providerPublicKey: PublicKey, serviceId: number, subscriptionId: number) => {
    if (!account?.publicKey) {
      throw new Error('Wallet not connected')
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log(`Subscribing to service ${serviceId}...`)

      // Create the transaction
      const transaction = await createSubscribeToServiceInstruction(
        connection,
        account.publicKey,
        providerPublicKey,
        serviceId,
        subscriptionId,
      )

      console.log('Transaction created, requesting signature...')

      // Use Mobile Wallet Adapter to sign and send
      const result = await transact(async (wallet) => {
        // Request authorization if needed
        await wallet.authorize({
          cluster: 'devnet',
          identity: { name: 'Subly User App' },
        })

        console.log('Authorization successful, signing transaction...')

        // Sign the transaction
        const signedTransactions = await wallet.signTransactions({
          transactions: [transaction],
        })

        console.log('Transaction signed, sending...')

        // Send the transaction
        const signature = await connection.sendRawTransaction(signedTransactions[0].serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        })

        // Confirm the transaction
        console.log('Transaction sent, waiting for confirmation...')
        const confirmation = await connection.confirmTransaction(
          {
            signature,
            blockhash: transaction.message.recentBlockhash!,
            lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
          },
          'confirmed',
        )

        return { signature, confirmation }
      })

      console.log('Subscription successful:', result.signature)
      return result.signature
    } catch (err) {
      console.error('Subscription error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    subscribeToService,
    isLoading,
    error,
  }
}
