import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader, ScreenHeaderActions } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { Chip } from '@/components/ui/Chip';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { QueryState } from '@/components/ui/QueryState';
import { useAdminLiveJobs } from '@/hooks/useMithrilAdmin';
import { formatBookingWhen } from '@/lib/mithril';
import { theme } from '@/constants/theme';

export default function LiveScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = useAdminLiveJobs();
  const jobs = data?.jobs ?? [];

  return (
    <Screen>
      <ScreenHeader
        title="Live jobs"
        right={
          <View style={styles.headerActions}>
            <ScreenHeaderActions icon="map-outline" onPress={() => router.push('/dispatch-map')} />
            <ScreenHeaderActions icon="refresh" onPress={() => refetch()} />
          </View>
        }
      />
      <Pressable style={styles.mapPlaceholder} onPress={() => router.push('/dispatch-map')}>
        <AppText variant="caption" style={styles.mapLabel}>Open dispatch map · {jobs.length} live jobs</AppText>
      </Pressable>
      <View style={styles.chips}>
        <Chip label={`All ${jobs.length}`} active />
      </View>
      <QueryState loading={isLoading || isRefetching} error={error} empty={jobs.length === 0} emptyMessage="No live jobs right now." />
      {jobs.map((j) => (
        <View key={j.bookingId} style={styles.row}>
          <View style={styles.main}>
            <AppText variant="subtitle">{j.cleanerName}</AppText>
            <AppText variant="caption">{j.serviceName} · {j.customerName}</AppText>
            <AppText variant="caption">{j.address ?? formatBookingWhen(j.scheduledDate, j.scheduledTime)}</AppText>
          </View>
          <StatusBadge label={j.status} tone="success" />
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', gap: theme.spacing.sm },
  mapPlaceholder: {
    height: 160,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.card,
    marginBottom: theme.spacing.lg,
    justifyContent: 'flex-end',
    padding: theme.spacing.md,
  },
  mapLabel: { color: theme.colors.textDim },
  chips: { flexDirection: 'row', marginBottom: theme.spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
  },
  main: { flex: 1 },
});
