import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { Chip } from '@/components/ui/Chip';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader, ScreenHeaderActions } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdminContracts } from '@/hooks/useMithrilAdmin';
import { currentContractMonth, formatMinorAmount } from '@/lib/mithril';
import { theme } from '@/constants/theme';

export default function ContractsScreen() {
  const router = useRouter();
  const [month, setMonth] = useState(currentContractMonth());
  const { data, isLoading, error, refetch } = useAdminContracts(month);
  const contracts = data?.contracts ?? [];

  return (
    <Screen>
      <ScreenHeader
        title="Contracts"
        subtitle={month}
        showBack
        right={<ScreenHeaderActions icon="refresh" onPress={() => refetch()} />}
      />
      <AdminOnly>
        <View style={styles.monthRow}>
          <Chip label="This month" active={month === currentContractMonth()} onPress={() => setMonth(currentContractMonth())} />
        </View>
        <QueryState loading={isLoading} error={error} empty={!isLoading && contracts.length === 0} />
        {contracts.map((c) => (
          <Pressable key={c.id} style={styles.row} onPress={() => router.push(`/contracts/${c.id}?month=${month}`)}>
            <View style={styles.main}>
              <AppText variant="subtitle">{c.clientName}</AppText>
              <AppText variant="caption">
                {c.workers?.length ?? 0} workers · {formatMinorAmount(c.monthlyFeeMinor, c.currency)}/mo
              </AppText>
            </View>
            <StatusBadge label={c.status} tone={c.status === 'active' ? 'success' : 'muted'} />
          </Pressable>
        ))}
      </AdminOnly>
    </Screen>
  );
}

const styles = StyleSheet.create({
  monthRow: { flexDirection: 'row', marginBottom: theme.spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
  },
  main: { flex: 1 },
});
