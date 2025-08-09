import React, { useState } from 'react'
import { ScrollView, View, TextInput, Alert } from 'react-native'
import { Button } from '@react-navigation/elements'
import { useWalletUi } from '@/components/solana/use-wallet-ui'
import { useRegisterSubscriptionService } from './use-subly-program'
import { AppText } from '@/components/app-text'
import { AppView } from '@/components/app-view'
import { WalletUiButtonConnect } from '@/components/solana/wallet-ui-button-connect'
import { useThemeColor } from '@/hooks/use-theme-color'
import { ellipsify } from '@/utils/ellipsify'

export function ProviderRegisterService() {
  const { account } = useWalletUi()
  const registerService = useRegisterSubscriptionService()

  const [formData, setFormData] = useState({
    name: '',
    feeUsd: '',
    billingFrequencyDays: '30',
  })

  const backgroundColor = useThemeColor({ light: '#f8f9fa', dark: '#1a1a1a' }, 'background')
  const cardBackground = useThemeColor({ light: '#ffffff', dark: '#2a2a2a' }, 'background')
  const inputBackground = useThemeColor({ light: '#f5f5f5', dark: '#333333' }, 'background')
  const textColor = useThemeColor({ light: '#000000', dark: '#ffffff' }, 'text')
  const primaryColor = useThemeColor({ light: '#31A4AB', dark: '#4CBCC3' }, 'tint')

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Service name is required')
      return
    }

    const feeUsd = parseFloat(formData.feeUsd)
    if (isNaN(feeUsd) || feeUsd <= 0) {
      Alert.alert('Error', 'Please enter a valid fee amount')
      return
    }

    const billingDays = parseInt(formData.billingFrequencyDays)
    if (isNaN(billingDays) || billingDays <= 0) {
      Alert.alert('Error', 'Please enter a valid billing frequency')
      return
    }

    try {
      const signature = await registerService.mutateAsync({
        name: formData.name.trim(),
        feeUsd,
        billingFrequencyDays: billingDays,
      })

      console.log('Service registered successfully:', signature)
      Alert.alert('Success', 'Service registered successfully!')

      // Clear form silently
      setFormData({
        name: '',
        feeUsd: '',
        billingFrequencyDays: '30',
      })
    } catch (error: any) {
      console.error('Error registering service:', error)
      Alert.alert('Error', error.message || 'Failed to register service')
    }
  }

  if (!account) {
    return (
      <AppView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <AppText type="title" style={{ marginBottom: 20, textAlign: 'center' }}>
          Register New Service
        </AppText>
        <AppText style={{ marginBottom: 30, textAlign: 'center', opacity: 0.7 }}>
          Connect your wallet to register a new subscription service
        </AppText>
        <WalletUiButtonConnect />
      </AppView>
    )
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor }}>
      <AppView style={{ padding: 20 }}>
        {/* Header */}
        <View style={{ marginBottom: 30 }}>
          <AppText type="title" style={{ marginBottom: 8 }}>
            Register New Service
          </AppText>
          <AppText style={{ opacity: 0.7, marginBottom: 16 }}>
            Connected: {ellipsify(account.publicKey.toString())}
          </AppText>
        </View>

        {/* Form */}
        <View
          style={{
            backgroundColor: cardBackground,
            padding: 20,
            borderRadius: 12,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          {/* Service Name */}
          <View style={{ marginBottom: 20 }}>
            <AppText style={{ marginBottom: 8, fontWeight: '600' }}>Service Name *</AppText>
            <TextInput
              style={{
                backgroundColor: inputBackground,
                color: textColor,
                padding: 12,
                borderRadius: 8,
                fontSize: 16,
              }}
              placeholder="e.g., Netflix Premium"
              placeholderTextColor={textColor + '80'}
              value={formData.name}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
            />
          </View>

          {/* Fee Amount */}
          <View style={{ marginBottom: 20 }}>
            <AppText style={{ marginBottom: 8, fontWeight: '600' }}>Monthly Fee (USD) *</AppText>
            <TextInput
              style={{
                backgroundColor: inputBackground,
                color: textColor,
                padding: 12,
                borderRadius: 8,
                fontSize: 16,
              }}
              placeholder="15.99"
              placeholderTextColor={textColor + '80'}
              value={formData.feeUsd}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, feeUsd: text }))}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Billing Frequency */}
          <View style={{ marginBottom: 20 }}>
            <AppText style={{ marginBottom: 8, fontWeight: '600' }}>Billing Frequency (Days) *</AppText>
            <TextInput
              style={{
                backgroundColor: inputBackground,
                color: textColor,
                padding: 12,
                borderRadius: 8,
                fontSize: 16,
              }}
              placeholder="30"
              placeholderTextColor={textColor + '80'}
              value={formData.billingFrequencyDays}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, billingFrequencyDays: text }))}
              keyboardType="number-pad"
            />
            <AppText style={{ opacity: 0.6, fontSize: 12, marginTop: 4 }}>
              How often users will be charged (typically 30 days for monthly)
            </AppText>
          </View>

          {/* Image URL */}
          {/* <View style={{ marginBottom: 30 }}>
            <AppText style={{ marginBottom: 8, fontWeight: '600' }}>Service Image URL *</AppText>
            <TextInput
              style={{
                backgroundColor: inputBackground,
                color: textColor,
                padding: 12,
                borderRadius: 8,
                fontSize: 16,
              }}
              placeholder="https://example.com/logo.png"
              placeholderTextColor={textColor + '80'}
              value={formData.imageUrl}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, imageUrl: text }))}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <AppText style={{ opacity: 0.6, fontSize: 12, marginTop: 4 }}>URL to your service logo or image</AppText>
          </View> */}

          {/* Submit Button */}
          <Button
            variant="filled"
            disabled={registerService.isPending}
            onPress={handleSubmit}
            style={{
              backgroundColor: primaryColor,
              borderRadius: 8,
              paddingVertical: 16,
            }}
          >
            {registerService.isPending ? 'Registering...' : 'Register Service'}
          </Button>

          {/* Info */}
          <View
            style={{
              marginTop: 20,
              padding: 16,
              backgroundColor: primaryColor + '20',
              borderRadius: 8,
            }}
          >
            <AppText style={{ fontSize: 12, opacity: 0.8, textAlign: 'center' }}>
              💡 Your service will be registered on Solana Devnet.{'\n'}
              Users can subscribe and pay automatically through staking rewards.
            </AppText>
          </View>
        </View>
      </AppView>
    </ScrollView>
  )
}
