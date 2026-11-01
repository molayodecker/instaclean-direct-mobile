import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { theme } from '@/constants/theme';

type Variant = 'title' | 'subtitle' | 'body' | 'caption' | 'label' | 'section';

const variantStyles: Record<Variant, TextStyle> = {
  title: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
  subtitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text },
  body: { fontSize: 15, color: theme.colors.text, lineHeight: 22 },
  caption: { fontSize: 13, color: theme.colors.textMuted, lineHeight: 18 },
  label: { fontSize: 12, color: theme.colors.textMuted, marginBottom: 6 },
  section: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: theme.colors.textDim,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
};

type AppTextProps = TextProps & { variant?: Variant; muted?: boolean; accent?: boolean };

export function AppText({ variant = 'body', muted, accent, style, ...props }: AppTextProps) {
  return (
    <Text
      maxFontSizeMultiplier={1.35}
      style={[
        variantStyles[variant],
        muted && { color: theme.colors.textMuted },
        accent && { color: theme.colors.accent },
        style,
      ]}
      {...props}
    />
  );
}

export const typography = StyleSheet.create({
  screenTitle: variantStyles.title,
});
