import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppText } from './Typography';
import { theme } from '@/constants/theme';

type QueryStateProps = {
  loading?: boolean;
  error?: Error | null;
  empty?: boolean;
  emptyMessage?: string;
};

export function QueryState({ loading, error, empty, emptyMessage }: QueryStateProps) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.accent} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <AppText variant="caption" style={styles.error}>
          {error.message || 'Could not load data from Mithril.'}
        </AppText>
      </View>
    );
  }
  if (empty) {
    return (
      <View style={styles.center}>
        <AppText variant="caption">{emptyMessage ?? 'Nothing here yet.'}</AppText>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  center: { paddingVertical: theme.spacing.xl, alignItems: 'center' },
  error: { color: theme.colors.danger, textAlign: 'center' },
});
