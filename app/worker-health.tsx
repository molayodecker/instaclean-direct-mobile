import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { QueryState } from '@/components/ui/QueryState';
import { useAdminCleanerHealth } from '@/hooks/useMithrilAdmin';
import { theme } from '@/constants/theme';

export default function WorkerHealthScreen() {
  const router = useRouter();
  const { data, isLoading, error } = useAdminCleanerHealth();
  const cases = data?.cases ?? [];
  const kpis = data?.kpis ?? {};

  return (
    <Screen>
      <ScreenHeader title="Worker health" showBack />
      <QueryState loading={isLoading} error={error} />
      {Object.keys(kpis).length > 0 && (
        <View style={styles.kpiRow}>
          {Object.entries(kpis).slice(0, 3).map(([key, value]) => (
            <View key={key} style={styles.kpi}>
              <AppText style={styles.kpiValue}>{String(value)}</AppText>
              <AppText variant="caption">{kpiLabel(key)}</AppText>
            </View>
          ))}
        </View>
      )}
      {cases.map((c) => (
        <Pressable key={c.id} style={styles.card} onPress={() => router.push(`/worker-health/${c.id}`)}>
          <View style={styles.cardTop}>
            <AppText variant="subtitle">{c.cleanerName}</AppText>
            <StatusBadge label={c.severity} tone={c.severity === 'red' ? 'danger' : 'warning'} />
          </View>
          <AppText variant="body">{c.mainReason}</AppText>
          <AppText variant="caption" style={styles.meta}>
            Score {c.riskScore} · {c.status} · {new Date(c.createdAt).toLocaleDateString()}
          </AppText>
        </Pressable>
      ))}
    </Screen>
  );
}

function kpiLabel(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}

const styles = StyleSheet.create({
  kpiRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  kpi: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  kpiValue: { fontSize: 20, fontWeight: '700' },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
  meta: { marginTop: theme.spacing.sm },
});
