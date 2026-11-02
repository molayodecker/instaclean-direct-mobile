export const theme = {
  colors: {
    background: '#050A2E',
    backgroundElevated: '#0B1338',
    card: '#0F1A45',
    cardBorder: '#1E3A6E',
    border: '#243B6B',
    borderMuted: '#1A2D55',
    text: '#FFFFFF',
    textMuted: '#8B9CC8',
    textDim: '#6B7DA8',
    accent: '#F5C518',
    accentText: '#0A0E2B',
    primary: '#4D8BF5',
    success: '#3DD68C',
    successMuted: '#2A9D5C',
    warning: '#F5C518',
    danger: '#F87171',
    chipInactive: '#121C48',
    inputBg: '#080E28',
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
} as const;

export type Theme = typeof theme;
