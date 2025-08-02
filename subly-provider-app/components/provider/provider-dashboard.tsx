import React from 'react'
import { ScrollView, View, ActivityIndicator } from 'react-native'
import { useWalletUi } from '@/components/solana/use-wallet-ui'
import { useGetProviderServices } from './use-subly-program'
import { AppText } from '@/components/app-text'
import { AppView } from '@/components/app-view'
import { WalletUiButtonConnect } from '@/components/solana/wallet-ui-button-connect'
import { Image } from 'expo-image'
import { useThemeColor } from '@/hooks/use-theme-color'
import { ellipsify } from '@/utils/ellipsify'

export function ProviderDashboard() {
  const { account } = useWalletUi()
  const { data: services, isLoading, error } = useGetProviderServices()
  const backgroundColor = useThemeColor({ light: '#f8f9fa', dark: '#1a1a1a' }, 'background')
  const cardBackground = useThemeColor({ light: '#ffffff', dark: '#2a2a2a' }, 'background')
  const primaryColor = useThemeColor({ light: '#007AFF', dark: '#0A84FF' }, 'tint')

  if (!account) {
    return (
      <AppView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <AppText type="title" style={{ marginBottom: 20, textAlign: 'center' }}>
          Provider Dashboard
        </AppText>
        <AppText style={{ marginBottom: 30, textAlign: 'center', opacity: 0.7 }}>
          Connect your wallet to manage your subscription services
        </AppText>
        <WalletUiButtonConnect />
      </AppView>
    )
  }

  if (isLoading) {
    return (
      <AppView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={primaryColor} />
        <AppText style={{ marginTop: 16 }}>Loading your services...</AppText>
      </AppView>
    )
  }

  if (error) {
    return (
      <AppView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <AppText type="title" style={{ color: 'red', marginBottom: 10 }}>
          Error
        </AppText>
        <AppText style={{ textAlign: 'center' }}>Failed to load your services. Please try again.</AppText>
      </AppView>
    )
  }

  const totalRevenue = services?.reduce((sum, service) => sum + service.feeUsd, 0) || 0
  const totalContracts = 2 // Hardcoded as requested

  return (
    <ScrollView style={{ flex: 1, backgroundColor }}>
      <AppView style={{ padding: 20 }}>
        {/* Header */}
        <View style={{ marginBottom: 30 }}>
          <AppText type="title" style={{ marginBottom: 8 }}>
            Provider Dashboard
          </AppText>
          <AppText style={{ opacity: 0.7, marginBottom: 16 }}>
            Connected: {ellipsify(account.publicKey.toString())}
          </AppText>

          {/* Stats Cards */}
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: cardBackground,
                padding: 16,
                borderRadius: 12,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            >
              <AppText type="subtitle" style={{ color: primaryColor, marginBottom: 4 }}>
                ${totalRevenue.toFixed(2)}
              </AppText>
              <AppText style={{ opacity: 0.7, fontSize: 12 }}>Monthly Revenue</AppText>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: cardBackground,
                padding: 16,
                borderRadius: 12,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            >
              <AppText type="subtitle" style={{ color: primaryColor, marginBottom: 4 }}>
                {totalContracts}
              </AppText>
              <AppText style={{ opacity: 0.7, fontSize: 12 }}>Active Contracts</AppText>
            </View>
          </View>
        </View>

        {/* Services List */}
        <View style={{ marginBottom: 20 }}>
          <AppText type="title" style={{ marginBottom: 16 }}>
            Your Services
          </AppText>

          {services && services.length > 0 ? (
            services.map((service, index) => (
              <View
                key={service.serviceId}
                style={{
                  backgroundColor: cardBackground,
                  padding: 16,
                  marginBottom: 12,
                  borderRadius: 12,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Image
                    source={{ uri: service.imageUrl }}
                    style={{ width: 50, height: 50, borderRadius: 8, marginRight: 12 }}
                    contentFit="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <AppText type="subtitle" style={{ marginBottom: 4 }}>
                      {service.name}
                    </AppText>
                    <AppText style={{ opacity: 0.7, fontSize: 12 }}>Service ID: {service.serviceId}</AppText>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <AppText style={{ fontWeight: '600', color: primaryColor }}>${service.feeUsd.toFixed(2)}</AppText>
                    <AppText style={{ opacity: 0.7, fontSize: 12 }}>Every {service.billingFrequencyDays} days</AppText>
                  </View>

                  <View
                    style={{
                      backgroundColor: primaryColor,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                    }}
                  >
                    <AppText style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Active</AppText>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View
              style={{
                backgroundColor: cardBackground,
                padding: 32,
                borderRadius: 12,
                alignItems: 'center',
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            >
              <AppText style={{ opacity: 0.7, textAlign: 'center', marginBottom: 16 }}>
                No services registered yet
              </AppText>
              <AppText style={{ opacity: 0.5, textAlign: 'center', fontSize: 12 }}>
                Use the &quot;Add Service&quot; tab to register your first subscription service
              </AppText>
            </View>
          )}
        </View>
      </AppView>
    </ScrollView>
  )
}
