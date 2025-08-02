import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { AppView } from '@/components/app-view'
import { SublyButton } from '@/components/subly/subly-button'
import { DepositSol } from '@/components/subly/deposit-sol'
import { SubscriptionServices } from '@/components/subly/subscription-services'

type TabType = 'deposit' | 'services'

export function SublyFeature() {
  const [activeTab, setActiveTab] = useState<TabType>('deposit')

  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <SublyButton
        style={[styles.tabButton, activeTab === 'deposit' && styles.activeTabButton]}
        onPress={() => setActiveTab('deposit')}
        variant={activeTab === 'deposit' ? 'primary' : 'outline'}
      >
        Deposit SOL
      </SublyButton>

      <SublyButton
        style={[styles.tabButton, activeTab === 'services' && styles.activeTabButton]}
        onPress={() => setActiveTab('services')}
        variant={activeTab === 'services' ? 'primary' : 'outline'}
      >
        Services
      </SublyButton>
    </View>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'deposit':
        return <DepositSol />
      case 'services':
        return <SubscriptionServices />
      default:
        return null
    }
  }

  return (
    <AppView style={styles.container}>
      {renderTabButtons()}
      <View style={styles.content}>{renderContent()}</View>
    </AppView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
  },
  activeTabButton: {
    // Active styling is handled by variant
  },
  content: {
    flex: 1,
  },
})
