import { useWalletUi } from '@/components/solana/use-wallet-ui'
import { BaseButton } from '@/components/solana/base-button'
import React from 'react'
import { Alert } from 'react-native'

export function WalletUiButtonConnect({ label = 'Connect' }: { label?: string }) {
  const { connect } = useWalletUi()

  const handleConnect = async () => {
    try {
      console.log('Attempting to connect wallet...')
      await connect()
      console.log('Wallet connected successfully!')
    } catch (error: any) {
      console.error('Wallet connection failed:', error)
      Alert.alert(
        'Connection Failed',
        `Failed to connect wallet: ${error.message || 'Unknown error'}\n\nPlease ensure you have a Solana Mobile-compatible wallet installed.`,
      )
    }
  }

  return <BaseButton label={label} onPress={handleConnect} />
}
