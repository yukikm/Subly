import { Tabs } from 'expo-router'
import React from 'react'
import { UiIconSymbol } from '@/components/ui/ui-icon-symbol'

export default function ProviderLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <UiIconSymbol size={28} name="square.grid.2x2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="register-service"
        options={{
          title: 'Add Service',
          tabBarIcon: ({ color }) => <UiIconSymbol size={28} name="plus.circle.fill" color={color} />,
        }}
      />
    </Tabs>
  )
}
