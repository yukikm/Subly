/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4'
const tintColorDark = '#fff'

export const Colors = {
  light: {
    background: '#fff',
    border: '#e0e0e0',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    text: '#11181C',
    tint: tintColorLight,
  },
  dark: {
    background: '#151718',
    border: '#2A2C2E',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    text: '#ECEDEE',
    tint: tintColorDark,
  },
  // Additional colors for Subly app
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  cardBackground: '#f8fafc',
  inputBackground: '#f1f5f9',
  textSecondary: '#64748b',
  buttonSecondary: '#e2e8f0',
  buttonDisabled: '#cbd5e1',
}
