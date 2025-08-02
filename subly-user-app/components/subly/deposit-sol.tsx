import React, { useState, useCallback } from 'react'
import { View, StyleSheet, Alert, ActivityIndicator, TextInput } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '@/constants/colors'
import { AppText } from '@/components/app-text'
import { AppView } from '@/components/app-view'
import { SublyButton } from '@/components/subly/subly-button'
import { useMobileWallet } from '@/components/solana/use-mobile-wallet'
import { useConnection } from '@/components/solana/solana-provider'
import { useAuthorization } from '@/components/solana/use-authorization'
import { useThemeColor } from '@/hooks/use-theme-color'
import { createDepositSolInstruction, getUserBalance } from '@/utils/subly-program-enhanced'
import { Transaction } from '@solana/web3.js'

interface DepositSolProps {
  onDepositSuccess?: () => void
}

export function DepositSol({ onDepositSuccess }: DepositSolProps) {
  const connection = useConnection()
  const { signAndSendTransaction } = useMobileWallet()
  const { selectedAccount } = useAuthorization()
  const borderColor = useThemeColor({}, 'border')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userBalance, setUserBalance] = useState<{ depositedSol: number; subscriptionCount: number } | null>(null)

  // Load user balance on component mount
  const loadUserBalance = useCallback(async () => {
    if (!selectedAccount?.publicKey) return

    try {
      const balance = await getUserBalance(connection, selectedAccount.publicKey)
      setUserBalance(balance)
    } catch (error) {
      console.error('Error loading user balance:', error)
    }
  }, [selectedAccount?.publicKey, connection])

  React.useEffect(() => {
    if (selectedAccount?.publicKey) {
      loadUserBalance()
    }
  }, [selectedAccount?.publicKey, loadUserBalance])

  const handleDeposit = async () => {
    if (!selectedAccount?.publicKey) {
      Alert.alert('Error', 'Please connect your wallet first')
      return
    }

    const depositAmount = parseFloat(amount)
    if (isNaN(depositAmount) || depositAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount')
      return
    }

    if (depositAmount > 10) {
      Alert.alert('Warning', 'For safety, deposits are limited to 10 SOL on devnet')
      return
    }

    setIsLoading(true)

    try {
      // Create deposit instruction
      const depositInstruction = createDepositSolInstruction(selectedAccount.publicKey, depositAmount)

      // Create transaction
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      const transaction = new Transaction({
        feePayer: selectedAccount.publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(depositInstruction)

      // Sign and send transaction
      const signature = await signAndSendTransaction(transaction, lastValidBlockHeight)

      if (signature) {
        Alert.alert('Success!', `Successfully deposited ${depositAmount} SOL to your Subly account!`, [
          {
            text: 'OK',
            onPress: () => {
              setAmount('')
              loadUserBalance() // Refresh balance
              onDepositSuccess?.()
            },
          },
        ])
      }
    } catch (error) {
      console.error('Deposit error:', error)
      Alert.alert('Error', `Failed to deposit SOL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!selectedAccount?.publicKey) {
    return (
      <AppView style={styles.container}>
        <AppText style={styles.connectWalletText}>Please connect your wallet to deposit SOL</AppText>
      </AppView>
    )
  }

  return (
    <AppView style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.headerGradient}>
        <AppText style={styles.title}>Deposit SOL</AppText>
        <AppText style={styles.subtitle}>Fund your Subly account to pay for subscriptions</AppText>
      </LinearGradient>

      {userBalance && (
        <View style={styles.balanceCard}>
          <AppText style={styles.balanceLabel}>Your Subly Balance</AppText>
          <AppText style={styles.balanceAmount}>{userBalance.depositedSol.toFixed(4)} SOL</AppText>
          <AppText style={styles.subscriptionCount}>Active Subscriptions: {userBalance.subscriptionCount}</AppText>
        </View>
      )}

      <View style={styles.depositCard}>
        <AppText style={styles.inputLabel}>Amount (SOL)</AppText>
        <TextInput
          style={[styles.input, { borderColor }]}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.0"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="numeric"
          editable={!isLoading}
        />

        <View style={styles.quickAmounts}>
          <AppText style={styles.quickAmountsLabel}>Quick amounts:</AppText>
          <View style={styles.quickAmountButtons}>
            {['0.1', '0.5', '1.0', '2.0'].map((quickAmount) => (
              <SublyButton
                key={quickAmount}
                style={[styles.quickAmountButton, ...(amount === quickAmount ? [styles.quickAmountButtonActive] : [])]}
                onPress={() => setAmount(quickAmount)}
                disabled={isLoading}
                variant={amount === quickAmount ? 'primary' : 'secondary'}
              >
                {quickAmount}
              </SublyButton>
            ))}
          </View>
        </View>

        <SublyButton
          style={[styles.depositButton, ...(isLoading ? [styles.depositButtonDisabled] : [])]}
          onPress={handleDeposit}
          disabled={isLoading || !amount}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="white" />
              <AppText style={styles.loadingText}>Depositing...</AppText>
            </View>
          ) : (
            `Deposit ${amount || '0'} SOL`
          )}
        </SublyButton>

        <AppText style={styles.disclaimer}>
          * Deposited SOL will be used to automatically pay for your subscription fees
        </AppText>
      </View>
    </AppView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  connectWalletText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  headerGradient: {
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  balanceCard: {
    backgroundColor: Colors.cardBackground,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subscriptionCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  depositCard: {
    backgroundColor: Colors.cardBackground,
    margin: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 20,
    borderWidth: 1,
  },
  quickAmounts: {
    marginBottom: 24,
  },
  quickAmountsLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  quickAmountButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  quickAmountButtonActive: {
    backgroundColor: Colors.primary,
  },
  depositButton: {
    paddingVertical: 16,
    marginBottom: 16,
  },
  depositButtonDisabled: {
    backgroundColor: Colors.buttonDisabled,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
})
