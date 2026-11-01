import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { Chip } from '@/components/ui/Chip';
import { QueryState } from '@/components/ui/QueryState';
import { useAdminReportsSummary } from '@/hooks/useMithrilAdmin';
import { formatMinorAmount, type AdminReportsDays } from '@/lib/mithril';
import { theme } from '@/constants/theme';

export default function ReportsScreen() {
  const [days, setDays] = useState<AdminReportsDays>(30);
  const { data, isLoading, error } = useAdminReportsSummary(days);
  const summary = data?.summary;

  const maxBar = useMemo(() => {
    const values = summary?.dailyRevenue?.map((d) => d.revenueMinor) ?? [1];
    return Math.max(...values, 1);
  }, [summary]);

  return (
    <Screen>
      <ScreenHeader title="Reports" showBack />
      <View style={styles.chips}>
        <Chip label="7 days" active={days === 7} onPress={() => setDays(7)} />
        <Chip label="30 days" active={days === 30} onPress={() => setDays(30)} />
        <Chip label="Quarter" active={days === 90} onPress={() => setDays(90)} />
      </View>
      <QueryState loading={isLoading} error={error} />
      {summary && (
        <>
          <View style={styles.revenueCard}>
            <View style={styles.revenueTop}>
              <AppText variant="caption">Revenue · {summary.days} days</AppText>
              {summary.revenueGrowthPercent != null && (
                <AppText style={styles.growth}>
                  {summary.revenueGrowthPercent >= 0 ? '+' : ''}
                  {summary.revenueGrowthPercent}%
                </AppText>
              )}
            </View>
            <AppText variant="title" style={styles.amount}>
              {formatMinorAmount(summary.revenueMinor, summary.currency)}
            </AppText>
            <View style={styles.bars}>
              {(summary.dailyRevenue ?? []).map((d, i, arr) => {
                const h = d.revenueMinor / maxBar;
                const isLast = i === arr.length - 1;
                return (
                  <View
                    key={d.day}
                    style={[
                      styles.bar,
                      { height: Math.max(8, 48 * h) },
                      isLast && { backgroundColor: theme.colors.accent },
                    ]}
                  />
                );
              })}
            </View>
          </View>
          <View style={styles.grid}>
            <MetricCard label="Bookings" value={String(summary.bookingsCount)} />
            <MetricCard label="Fill rate" value={`${summary.fillRatePercent}%`} accent="success" />
            <MetricCard label="Cancel rate" value={`${summary.cancelRatePercent}%`} accent="warning" />
            <MetricCard label="Avg order" value={formatMinorAmount(summary.avgOrderMinor ?? 0, summary.currency)} />
          </View>
          <AppText variant="section">Top areas</AppText>
          {(summary.topAreas ?? []).length === 0 && (
            <AppText variant="caption">No paid bookings in this window yet.</AppText>
          )}
          {(summary.topAreas ?? []).map((area, index) => (
            <View key={area.name} style={styles.areaRow}>
              <AppText variant="caption">{index + 1}</AppText>
              <AppText variant="body" style={styles.areaName}>{area.name}</AppText>
              <AppText variant="body">{formatMinorAmount(area.revenueMinor, summary.currency)}</AppText>
            </View>
          ))}
        </>
      )}
    </Screen>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'success' | 'warning';
}) {
  const color =
    accent === 'success' ? theme.colors.success : accent === 'warning' ? theme.colors.accent : theme.colors.text;
  return (
    <View style={styles.metric}>
      <AppText style={[styles.metricValue, { color }]}>{value}</AppText>
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', marginBottom: theme.spacing.lg },
  revenueCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  revenueTop: { flexDirection: 'row', justifyContent: 'space-between' },
  growth: { color: theme.colors.success, fontWeight: '600', fontSize: 13 },
  amount: { marginVertical: theme.spacing.sm },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: theme.spacing.md, height: 56 },
  bar: { flex: 1, backgroundColor: theme.colors.primary, borderRadius: 4, opacity: 0.85 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  metric: {
    width: '48%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.md,
  },
  metricValue: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
    gap: theme.spacing.md,
  },
  areaName: { flex: 1 },
});
