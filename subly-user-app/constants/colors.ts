/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#31A4AB'
const tintColorDark = '#4CBCC3'

export const Colors = {
  light: {
    background: '#fff',
    border: '#B8E6E8',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    text: '#11181C',
    tint: tintColorLight,
  },
  dark: {
    background: '#0D1B1D',
    border: '#1F3A3D',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    text: '#ECEDEE',
    tint: tintColorDark,
  },
  // Additional colors for Subly app - #31A4AB theme
  primary: '#31A4AB',
  primaryDark: '#266E73',
  secondary: '#4CBCC3',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  cardBackground: '#F8FCFC',
  inputBackground: '#F0F9FA',
  textSecondary: '#4A7C7F',
  buttonSecondary: '#D1EDEF',
  buttonDisabled: '#B8E6E8',
}
