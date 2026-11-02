import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  style?: ViewStyle;
  small?: boolean;
};

export function Button({ label, onPress, variant = 'primary', style, small }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        small && styles.small,
        variant === 'primary' && styles.primary,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        pressed && { opacity: 0.85 },
        style,
      ]}>
      <Text
        style={[
          styles.label,
          variant === 'primary' && styles.primaryLabel,
          variant === 'outline' && styles.outlineLabel,
          variant === 'ghost' && styles.ghostLabel,
          small && styles.smallLabel,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.md,
  },
  primary: {
    backgroundColor: theme.colors.accent,
  },
  outline: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
  },
  ghost: {
    borderWidth: 1,
    borderColor: theme.colors.accent,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryLabel: {
    color: theme.colors.accentText,
  },
  outlineLabel: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  ghostLabel: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  smallLabel: {
    fontSize: 14,
  },
});
