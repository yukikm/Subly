import React from 'react'
import { View, StyleSheet, ScrollView, Linking } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '@/constants/colors'
import { AppText } from '@/components/app-text'
import { AppView } from '@/components/app-view'
import { SublyButton } from '@/components/subly/subly-button'
import { useAuthorization } from '@/components/solana/use-authorization'
import { SUBLY_PROGRAM_ID, MOCK_SUBSCRIPTION_SERVICES } from '@/constants/subly-program'

export function SublyDemo() {
  const { selectedAccount } = useAuthorization()

  const openDevnetFaucet = () => {
    Linking.openURL('https://faucet.solana.com/')
  }

  const openExplorer = () => {
    Linking.openURL(`https://explorer.solana.com/address/${SUBLY_PROGRAM_ID.toString()}?cluster=devnet`)
  }

  const renderInfoCard = (title: string, content: string, color: string = Colors.primary) => (
    <View style={[styles.infoCard, { borderLeftColor: color }]}>
      <AppText style={styles.cardTitle}>{title}</AppText>
      <AppText style={styles.cardContent}>{content}</AppText>
    </View>
  )

  return (
    <AppView style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.headerGradient}>
        <AppText style={styles.title}>Subly Demo</AppText>
        <AppText style={styles.subtitle}>Test the subscription protocol on Solana Devnet</AppText>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderInfoCard('Program Address', `${SUBLY_PROGRAM_ID.toString().slice(0, 20)}...`, Colors.success)}

        {renderInfoCard('Network', 'Solana Devnet', Colors.warning)}

        {selectedAccount &&
          renderInfoCard('Connected Wallet', `${selectedAccount.address.slice(0, 20)}...`, Colors.secondary)}

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Quick Actions</AppText>

          <SublyButton style={styles.actionButton} onPress={openDevnetFaucet}>
            Get Devnet SOL
          </SublyButton>

          <SublyButton style={styles.actionButton} onPress={openExplorer} variant="outline">
            View Program on Explorer
          </SublyButton>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>How to Test</AppText>

          <View style={styles.stepCard}>
            <AppText style={styles.stepNumber}>1</AppText>
            <View style={styles.stepContent}>
              <AppText style={styles.stepTitle}>Connect Wallet</AppText>
              <AppText style={styles.stepDescription}>Connect your Solana mobile wallet and switch to Devnet</AppText>
            </View>
          </View>

          <View style={styles.stepCard}>
            <AppText style={styles.stepNumber}>2</AppText>
            <View style={styles.stepContent}>
              <AppText style={styles.stepTitle}>Get Test SOL</AppText>
              <AppText style={styles.stepDescription}>Use the devnet faucet to get test SOL for transactions</AppText>
            </View>
          </View>

          <View style={styles.stepCard}>
            <AppText style={styles.stepNumber}>3</AppText>
            <View style={styles.stepContent}>
              <AppText style={styles.stepTitle}>Deposit SOL</AppText>
              <AppText style={styles.stepDescription}>Go to Subly tab and deposit SOL to your account</AppText>
            </View>
          </View>

          <View style={styles.stepCard}>
            <AppText style={styles.stepNumber}>4</AppText>
            <View style={styles.stepContent}>
              <AppText style={styles.stepTitle}>Subscribe to Services</AppText>
              <AppText style={styles.stepDescription}>Browse and subscribe to available services</AppText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Available Services</AppText>
          {MOCK_SUBSCRIPTION_SERVICES.map((service, index) => (
            <View key={service.id} style={styles.serviceItem}>
              <AppText style={styles.serviceName}>{service.name}</AppText>
              <AppText style={styles.servicePrice}>${service.feeUsd}/month</AppText>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <AppText style={styles.disclaimer}>
            This is a demo application running on Solana Devnet. No real money is involved. The subscription services
            are mock services for testing purposes only.
          </AppText>
        </View>
      </ScrollView>
    </AppView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  cardContent: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButton: {
    marginBottom: 12,
    paddingVertical: 14,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
})
