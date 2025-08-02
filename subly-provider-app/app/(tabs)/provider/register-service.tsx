import React from 'react'
import { ProviderRegisterService } from '@/components/provider/provider-register-service'
import { AppView } from '@/components/app-view'

export default function RegisterService() {
  return (
    <AppView style={{ flex: 1 }}>
      <ProviderRegisterService />
    </AppView>
  )
}
