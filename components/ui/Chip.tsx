import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '@/constants/theme';

type ChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export function Chip({ label, active, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.active,
        pressed && { opacity: 0.9 },
      ]}>
      <Text style={[styles.text, active && styles.activeText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.chipInactive,
    marginRight: theme.spacing.sm,
  },
  active: {
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(245, 197, 24, 0.08)',
  },
  text: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  activeText: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
});
