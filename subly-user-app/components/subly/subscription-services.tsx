import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '@/constants/colors'
import { AppText } from '@/components/app-text'
import { AppView } from '@/components/app-view'
import { SublyButton } from '@/components/subly/subly-button'
import { useMobileWallet } from '@/components/solana/use-mobile-wallet'
import { useConnection } from '@/components/solana/solana-provider'
import { useAuthorization } from '@/components/solana/use-authorization'
import { useThemeColor } from '@/hooks/use-theme-color'
import { MOCK_SUBSCRIPTION_SERVICES } from '@/constants/subly-program'
import { createSubscribeToServiceInstruction } from '@/utils/subly-program-enhanced'
import { Transaction, Keypair } from '@solana/web3.js'

interface SubscriptionService {
  id: string
  provider: string
  name: string
  feeUsd: number
  billingFrequencyDays: number
  imageUrl: string
  description: string
  features: string[]
}

interface SubscriptionServicesProps {
  onSubscriptionSuccess?: () => void
}

export function SubscriptionServices({ onSubscriptionSuccess }: SubscriptionServicesProps) {
  const connection = useConnection()
  const { signAndSendTransaction } = useMobileWallet()
  const { selectedAccount } = useAuthorization()
  const borderColor = useThemeColor({}, 'border')
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSubscribe = async (service: SubscriptionService) => {
    if (!selectedAccount?.publicKey) {
      Alert.alert('Error', 'Please connect your wallet first')
      return
    }

    Alert.alert('Confirm Subscription', `Subscribe to ${service.name} for $${service.feeUsd}/month?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Subscribe', onPress: () => processSubscription(service) },
    ])
  }

  const processSubscription = async (service: SubscriptionService) => {
    if (!selectedAccount?.publicKey) return

    setIsLoading(service.id)

    try {
      // Generate a new keypair for the certificate NFT mint
      const certificateNftMint = Keypair.generate()

      // Mock provider wallet (in real implementation, this would come from the service data)
      const mockProviderWallet = Keypair.generate().publicKey

      // Mock subscription count (in real implementation, this would be fetched from user account)
      const subscriptionCount = 0

      // Create subscribe instruction
      const subscribeInstruction = createSubscribeToServiceInstruction(
        selectedAccount.publicKey,
        mockProviderWallet,
        parseInt(service.id),
        certificateNftMint.publicKey,
        subscriptionCount,
      )

      // Create transaction
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      const transaction = new Transaction({
        feePayer: selectedAccount.publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(subscribeInstruction)

      // Add the certificate NFT mint as a signer
      transaction.partialSign(certificateNftMint)

      // Sign and send transaction
      const signature = await signAndSendTransaction(transaction, lastValidBlockHeight)

      if (signature) {
        Alert.alert('Success!', `Successfully subscribed to ${service.name}! You will receive a certificate NFT.`, [
          {
            text: 'OK',
            onPress: () => {
              onSubscriptionSuccess?.()
            },
          },
        ])
      }
    } catch (error) {
      console.error('Subscription error:', error)
      Alert.alert('Error', `Failed to subscribe: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(null)
    }
  }

  const renderServiceCard = (service: SubscriptionService) => (
    <View key={service.id} style={[styles.serviceCard, { borderColor }]}>
      <View style={styles.serviceHeader}>
        <Image source={{ uri: service.imageUrl }} style={styles.serviceImage} />
        <View style={styles.serviceInfo}>
          <AppText style={styles.serviceName}>{service.name}</AppText>
          <AppText style={styles.serviceProvider}>{service.provider}</AppText>
          <AppText style={styles.servicePrice}>${service.feeUsd}/month</AppText>
        </View>
      </View>

      <AppText style={styles.serviceDescription}>{service.description}</AppText>

      <View style={styles.featuresContainer}>
        {service.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <View style={styles.featureBullet} />
            <AppText style={styles.featureText}>{feature}</AppText>
          </View>
        ))}
      </View>

      <SublyButton
        style={styles.subscribeButton}
        onPress={() => handleSubscribe(service)}
        disabled={isLoading !== null}
      >
        {isLoading === service.id ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="white" />
            <AppText style={styles.loadingText}>Subscribing...</AppText>
          </View>
        ) : (
          `Subscribe for $${service.feeUsd}/month`
        )}
      </SublyButton>
    </View>
  )

  if (!selectedAccount?.publicKey) {
    return (
      <AppView style={styles.container}>
        <AppText style={styles.connectWalletText}>Please connect your wallet to view subscription services</AppText>
      </AppView>
    )
  }

  return (
    <AppView style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.headerGradient}>
        <AppText style={styles.title}>Subscription Services</AppText>
        <AppText style={styles.subtitle}>Choose from our premium subscription services</AppText>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_SUBSCRIPTION_SERVICES.map(renderServiceCard)}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  serviceCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  serviceProvider: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  serviceDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  subscribeButton: {
    paddingVertical: 14,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
})
