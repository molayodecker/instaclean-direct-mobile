import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

export type BadgeTone = 'success' | 'warning' | 'muted' | 'danger' | 'info';

const tones: Record<BadgeTone, { border: string; text: string }> = {
  success: { border: theme.colors.success, text: theme.colors.success },
  warning: { border: theme.colors.warning, text: theme.colors.warning },
  muted: { border: theme.colors.textDim, text: theme.colors.textMuted },
  danger: { border: theme.colors.danger, text: theme.colors.danger },
  info: { border: theme.colors.primary, text: theme.colors.primary },
};

type StatusBadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function StatusBadge({ label, tone = 'muted' }: StatusBadgeProps) {
  const colors = tones[tone];
  return (
    <View style={[styles.badge, { borderColor: colors.border }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
