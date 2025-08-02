import React from 'react'
import { ProviderDashboard } from '@/components/provider/provider-dashboard'
import { AppView } from '@/components/app-view'

export default function ProviderIndex() {
  return (
    <AppView style={{ flex: 1 }}>
      <ProviderDashboard />
    </AppView>
  )
}
