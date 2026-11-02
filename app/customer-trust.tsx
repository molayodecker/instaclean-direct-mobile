import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { QueryState } from '@/components/ui/QueryState';
import { useAdminCustomerTrust } from '@/hooks/useMithrilAdmin';
import { theme } from '@/constants/theme';

export default function CustomerTrustScreen() {
  const router = useRouter();
  const { data, isLoading, error } = useAdminCustomerTrust();
  const profiles = data?.profiles ?? [];

  return (
    <Screen>
      <ScreenHeader title="Customer trust" showBack />
      <QueryState loading={isLoading} error={error} />
      {profiles.map((p) => (
        <Pressable
          key={p.customerId}
          style={styles.row}
          onPress={() => router.push(`/customer-trust/${p.customerId}`)}>
          <View style={styles.main}>
            <AppText variant="subtitle">{p.name}</AppText>
            <AppText variant="caption">
              Risk {p.riskScore} · {p.completedBookingsCount} completed · {p.failedPaymentCount} failed payments
            </AppText>
          </View>
          <StatusBadge
            label={p.canDispatchCleaner ? 'Dispatch OK' : 'Hold'}
            tone={p.canDispatchCleaner ? 'success' : 'warning'}
          />
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
