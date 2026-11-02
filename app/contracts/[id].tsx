import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdminContract } from '@/hooks/useMithrilAdmin';
import { currentContractMonth, formatMinorAmount } from '@/lib/mithril';
import { theme } from '@/constants/theme';

export default function ContractDetailScreen() {
  const { id, month: monthParam } = useLocalSearchParams<{ id: string; month?: string }>();
  const contractId = id ?? '';
  const month = monthParam ?? currentContractMonth();
  const { data, isLoading, error } = useAdminContract(contractId, month);

  const client = data?.client;

  return (
    <Screen>
      <ScreenHeader title={client?.name ?? 'Contract'} subtitle={month} showBack />
      <AdminOnly>
        <QueryState loading={isLoading} error={error} empty={!isLoading && !data} emptyMessage="Contract not found." />
        {data && client && (
          <>
            <View style={styles.card}>
              <View style={styles.row}>
                <AppText variant="subtitle">{client.name}</AppText>
                <StatusBadge label={data.status ?? 'unknown'} tone={data.status === 'active' ? 'success' : 'muted'} />
              </View>
              <AppText variant="body">{formatMinorAmount(data.monthlyFeeMinor, data.currency)} monthly</AppText>
              <AppText variant="caption">{client.email ?? client.phone ?? data.billingContact ?? '—'}</AppText>
              <AppText variant="caption">Invoice · {(data.invoiceStatus ?? 'not_invoiced').replace(/_/g, ' ')}</AppText>
            </View>

            <AppText variant="section">Workers on contract</AppText>
            {(data.workers ?? []).map((w) => (
              <View key={w.id} style={styles.workerRow}>
                <AppText variant="subtitle">{w.workerName}</AppText>
                <AppText variant="caption">
                  Net {formatMinorAmount(w.netMinor, data.currency)} · {w.status}
                </AppText>
              </View>
            ))}

            <AppText variant="section">Advances</AppText>
            {(data.advances ?? []).length === 0 && <AppText variant="caption">No advances this month.</AppText>}
            {(data.advances ?? []).slice(0, 8).map((a) => (
              <AppText key={a.id} variant="caption">
                {a.workerName} · {formatMinorAmount(a.amountMinor, data.currency)} · {a.weekLabel}
              </AppText>
            ))}
          </>
        )}
      </AdminOnly>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  workerRow: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
  },
});
