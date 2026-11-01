import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader, ScreenHeaderActions } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { QueryState } from '@/components/ui/QueryState';
import { useAdminServiceRequests } from '@/hooks/useMithrilAdmin';
import { formatBookingWhen } from '@/lib/mithril';
import { theme } from '@/constants/theme';

export default function ConciergeScreen() {
  const router = useRouter();
  const { data, isLoading, error } = useAdminServiceRequests();
  const requests = data?.requests ?? [];

  return (
    <Screen>
      <ScreenHeader
        title="Concierge"
        showBack
        right={
          <ScreenHeaderActions icon="add" onPress={() => router.push('/assisted-booking')} />
        }
      />
      <QueryState loading={isLoading} error={error} />
      {requests.map((r) => (
        <Pressable key={r.id} style={styles.card} onPress={() => router.push(`/service-requests/${r.id}`)}>
          <View style={styles.cardTop}>
            <AppText variant="subtitle">{r.customerName}</AppText>
            <StatusBadge
              label={r.priority}
              tone={r.priority === 'urgent' ? 'danger' : r.priority === 'same_day' ? 'warning' : 'info'}
            />
          </View>
          <AppText variant="body">
            {r.kind === 'urgent_help' ? 'Urgent help' : 'Replacement'} · {r.status}
          </AppText>
          <AppText variant="caption">{r.householdAddress}</AppText>
          <AppText variant="caption">
            {formatBookingWhen(
              r.requestedStartAt?.slice(0, 10),
              r.requestedStartAt?.includes('T') ? r.requestedStartAt.split('T')[1]?.slice(0, 5) : undefined,
            )}
          </AppText>
        </Pressable>
      ))}
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
    marginBottom: theme.spacing.md,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
});
