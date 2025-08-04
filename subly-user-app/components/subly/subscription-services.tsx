import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '@/constants/colors'
import { AppText } from '@/components/app-text'
import { AppView } from '@/components/app-view'
import { SublyButton } from '@/components/subly/subly-button'
import { useWalletUi } from '@/components/solana/use-wallet-ui'
import { useThemeColor } from '@/hooks/use-theme-color'
import { useSubscribeToService } from '@/hooks/use-subly-program'
import { PublicKey } from '@solana/web3.js'

// Mock Netflix subscription service data
const MOCK_SUBSCRIPTION_SERVICES = [
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
  const { account } = useWalletUi()
  const { subscribeToService } = useSubscribeToService()
  const borderColor = useThemeColor({}, 'border')
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSubscribe = async (service: SubscriptionService) => {
    if (!account?.publicKey) {
      Alert.alert('Error', 'Please connect your wallet first')
      return
    }

    Alert.alert('Confirm Subscription', `Subscribe to ${service.name} for $${service.feeUsd}/month?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Subscribe', onPress: () => processSubscription(service) },
    ])
  }

  const processSubscription = async (service: SubscriptionService) => {
    if (!account?.publicKey) return

    setIsLoading(service.id)

    try {
      // Mock provider wallet from service data
      const mockProviderWallet = new PublicKey(service.provider)

      // Mock subscription ID (in real implementation, this would be generated or incremented)
      const subscriptionId = Math.floor(Math.random() * 1000)

      // Use the new subscribe hook
      const signature = await subscribeToService(mockProviderWallet, parseInt(service.id), subscriptionId)

      if (signature) {
        Alert.alert('Success!', `Successfully subscribed to ${service.name}!`, [
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
        {service.features.map((feature: string, index: number) => (
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

  if (!account?.publicKey) {
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
