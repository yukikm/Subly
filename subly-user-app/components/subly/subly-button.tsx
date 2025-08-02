import React from 'react'
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { AppText } from '@/components/app-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import { Colors } from '@/constants/colors'

interface SublyButtonProps {
  children: React.ReactNode
  onPress?: () => void
  style?: ViewStyle | ViewStyle[]
  textStyle?: TextStyle
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
}

export function SublyButton({
  children,
  onPress,
  style,
  textStyle,
  disabled = false,
  variant = 'primary',
}: SublyButtonProps) {
  const textColor = useThemeColor({}, 'text')

  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: Colors.buttonSecondary }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Colors.primary,
        }
      default:
        return { backgroundColor: Colors.primary }
    }
  }

  const getTextColor = () => {
    if (disabled) return Colors.textSecondary

    switch (variant) {
      case 'secondary':
        return textColor
      case 'outline':
        return Colors.primary
      default:
        return 'white'
    }
  }

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), disabled && { backgroundColor: Colors.buttonDisabled }, style]}
      onPress={onPress}
      disabled={disabled}
    >
      {typeof children === 'string' ? (
        <AppText style={[styles.buttonText, { color: getTextColor() }, textStyle]}>{children}</AppText>
      ) : (
        children
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
})
