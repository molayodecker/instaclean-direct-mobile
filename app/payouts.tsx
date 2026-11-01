import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { Chip } from '@/components/ui/Chip';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { QueryState } from '@/components/ui/QueryState';
import { useAdminPayouts } from '@/hooks/useMithrilAdmin';
import { formatMinorAmount } from '@/lib/mithril';
import { theme } from '@/constants/theme';

type StatusFilter = 'pending' | 'paid' | 'failed' | undefined;

export default function PayoutsScreen() {
  const [status, setStatus] = useState<StatusFilter>('pending');
  const { data, isLoading, error } = useAdminPayouts(status);
  const summary = data?.summary;
  const payouts = data?.payouts ?? [];

  const chips = useMemo(
    () => [
      { key: 'pending' as const, label: `Pending ${summary?.pendingCount ?? 0}` },
      { key: 'paid' as const, label: 'Paid' },
      { key: 'failed' as const, label: 'Failed' },
    ],
    [summary?.pendingCount],
  );

  return (
    <Screen>
      <ScreenHeader title="Payments & payouts" showBack />
      <QueryState loading={isLoading} error={error} />
      {summary && (
        <View style={styles.summary}>
          <AppText variant="caption">Owed in worker wallets</AppText>
          <AppText variant="title" style={styles.total}>
            {formatMinorAmount(summary.owedMinor ?? 0, summary.currency ?? 'GHS')}
          </AppText>
          <AppText variant="caption">
            {summary.cleanersWithBalance ?? 0} workers · pending{' '}
            {formatMinorAmount(summary.pendingMinor ?? 0, summary.currency ?? 'GHS')}
          </AppText>
        </View>
      )}
      <View style={styles.chips}>
        {chips.map((c) => (
          <Chip
            key={c.key}
            label={c.label}
            active={status === c.key}
            onPress={() => setStatus(c.key)}
          />
        ))}
      </View>
      {payouts.map((p) => (
        <View key={p.id} style={styles.row}>
          <View style={styles.avatar}>
            <AppText style={styles.avatarText}>{initials(p.cleanerName ?? '—')}</AppText>
          </View>
          <View style={styles.main}>
            <AppText variant="subtitle">{p.cleanerName}</AppText>
            <AppText variant="caption">
              {p.payoutMethodLabel ?? 'Payout'}
              {p.recentJobsCount != null ? ` · ${p.recentJobsCount} jobs` : ''}
            </AppText>
          </View>
          <View style={styles.right}>
            <AppText variant="body">
              {formatMinorAmount(p.amountMinor ?? 0, p.currency ?? summary?.currency ?? 'GHS')}
            </AppText>
            <StatusBadge label={payoutStatusLabel(p.status ?? '')} tone={payoutTone(p.status ?? '')} />
          </View>
        </View>
      ))}
    </Screen>
  );
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '?'
  );
}

function payoutStatusLabel(status: string) {
  const s = status.toLowerCase();
  if (s === 'pending' || s === 'processing' || s === 'queued') return 'Pending';
  if (s === 'failed' || s === 'reversed') return 'Failed';
  if (s === 'success' || s === 'paid' || s === 'completed') return 'Paid';
  return status;
}

function payoutTone(status: string) {
  const s = status.toLowerCase();
  if (s === 'failed' || s === 'reversed') return 'danger';
  if (s === 'success' || s === 'paid' || s === 'completed') return 'success';
  return 'warning';
}

const styles = StyleSheet.create({
  summary: {
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
  },
  total: { marginVertical: theme.spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.sm, gap: theme.spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700' },
  main: { flex: 1 },
  right: { alignItems: 'flex-end', gap: 6 },
});
