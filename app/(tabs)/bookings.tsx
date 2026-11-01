import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader, ScreenHeaderActions } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { Chip } from '@/components/ui/Chip';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { QueryState } from '@/components/ui/QueryState';
import { useAdminBookings } from '@/hooks/useMithrilAdmin';
import { formatBookingWhen } from '@/lib/mithril';
import { theme } from '@/constants/theme';
import { useState } from 'react';

export default function BookingsScreen() {
  const router = useRouter();
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);
  const { data, isLoading, error, refetch, isRefetching } = useAdminBookings();
  const allBookings = data?.bookings ?? [];
  const unassigned = allBookings.filter((b) => !b.cleanerName && b.status !== 'cancelled').length;
  const bookings = showUnassignedOnly
    ? allBookings.filter((b) => !b.cleanerName && b.status !== 'cancelled')
    : allBookings;

  return (
    <Screen>
      <ScreenHeader title="Bookings" right={<ScreenHeaderActions icon="refresh" onPress={() => refetch()} />} />
      <View style={styles.chips}>
        <Chip label={`All ${allBookings.length}`} active={!showUnassignedOnly} onPress={() => setShowUnassignedOnly(false)} />
        <Chip
          label={`Unassigned ${unassigned}`}
          active={showUnassignedOnly}
          onPress={() => setShowUnassignedOnly(true)}
        />
      </View>
      <QueryState loading={isLoading || isRefetching} error={error} empty={bookings.length === 0} emptyMessage="No bookings from Mithril." />
      {bookings.map((b) => (
        <Pressable key={b.id} style={styles.row} onPress={() => router.push(`/bookings/${b.id}`)}>
          <View style={styles.main}>
            <AppText variant="subtitle">{b.customerName}</AppText>
            <AppText variant="caption">{b.serviceName} · {formatBookingWhen(b.scheduledDate, b.scheduledTime)}</AppText>
            <AppText variant="caption" style={styles.id}>{b.id.slice(0, 8)}… · {b.paymentStatus}</AppText>
          </View>
          <StatusBadge
            label={b.cleanerName ? b.status : 'Unassigned'}
            tone={!b.cleanerName ? 'warning' : b.status === 'completed' ? 'success' : 'muted'}
          />
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', marginBottom: theme.spacing.lg, flexWrap: 'wrap' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
  },
  main: { flex: 1 },
  id: { marginTop: 4, color: theme.colors.textDim },
});
