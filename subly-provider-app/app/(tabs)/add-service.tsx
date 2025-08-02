import React from 'react'
import { AppPage } from '@/components/app-page'
import { ProviderRegisterService } from '@/components/provider/provider-register-service'

export default function AddServiceScreen() {
  return (
    <AppPage>
      <ProviderRegisterService />
    </AppPage>
  )
}
