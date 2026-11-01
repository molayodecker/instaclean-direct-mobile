import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader, ScreenHeaderActions } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { QueryState } from '@/components/ui/QueryState';
import {
  useAdminBookings,
  useAdminLiveJobs,
  useAdminReportsSummary,
  useAdminServiceRequests,
} from '@/hooks/useMithrilAdmin';
import { formatMinorAmount, isOpenServiceRequestStatus } from '@/lib/mithril';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { theme } from '@/constants/theme';

export default function HomeScreen() {
  const { isLargeTablet } = useResponsiveLayout();
  const bookings = useAdminBookings();
  const live = useAdminLiveJobs();
  const requests = useAdminServiceRequests();
  const reports = useAdminReportsSummary(7);

  const bookingList = bookings.data?.bookings ?? [];
  const unassigned = bookingList.filter((b) => !b.cleanerName).length;
  const liveCount = live.data?.jobs.length ?? 0;
  const openRequests = (requests.data?.requests ?? []).filter((r) =>
    isOpenServiceRequestStatus(r.status),
  ).length;
  const summary = reports.data?.summary;

  const loading =
    bookings.isLoading || live.isLoading || requests.isLoading || reports.isLoading;
  const error = bookings.error ?? live.error ?? requests.error ?? reports.error;

  return (
    <Screen>
      <ScreenHeader
        title="Today"
        right={
          <ScreenHeaderActions
            icon="refresh"
            onPress={() => {
              bookings.refetch();
              live.refetch();
              requests.refetch();
              reports.refetch();
            }}
          />
        }
      />

      <View style={isLargeTablet ? styles.dashboardRow : undefined}>
        <View style={isLargeTablet ? styles.dashboardCol : undefined}>
      <View style={styles.hero}>
        <AppText variant="caption">Last 7 days</AppText>
        <View style={styles.heroRow}>
          <StatPill
            label="Revenue"
            value={summary ? formatMinorAmount(summary.revenueMinor, summary.currency) : '—'}
          />
          <StatPill label="Bookings" value={String(summary?.bookingsCount ?? bookingList.length)} />
          <StatPill label="Unassigned" value={String(unassigned)} accent />
        </View>
        <View style={[styles.heroRow, { marginTop: theme.spacing.sm }]}>
          <StatPill label="Live now" value={String(liveCount)} />
          <StatPill label="Open concierge" value={String(openRequests)} />
          <StatPill
            label="Fill rate"
            value={summary ? `${summary.fillRatePercent}%` : '—'}
          />
        </View>
      </View>

      <QueryState loading={loading} error={error} />
        </View>
        <View style={isLargeTablet ? styles.dashboardCol : undefined}>
      <AppText variant="section">Needs attention</AppText>
      <View style={styles.card}>
        <Row
          icon="alert-circle"
          title={`${unassigned} bookings need a worker`}
          subtitle="Admin bookings desk"
          badge={unassigned > 0 ? 'Urgent' : 'Clear'}
          tone={unassigned > 0 ? 'warning' : 'success'}
        />
        <Divider />
        <Row
          icon="flash"
          title={`${openRequests} concierge requests`}
          subtitle="Service requests queue"
          badge="Open"
          tone="info"
        />
        <Divider />
        <Row
          icon="radio"
          title={`${liveCount} live jobs`}
          subtitle="In progress on the ground"
          badge="Live"
          tone="muted"
        />
      </View>
        </View>
      </View>
    </Screen>
  );
}

function StatPill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.pill}>
      <AppText style={[styles.pillValue, accent && { color: theme.colors.accent }]}>{value}</AppText>
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

function Row({
  icon,
  title,
  subtitle,
  badge,
  tone,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  badge: string;
  tone: 'warning' | 'info' | 'muted' | 'success';
}) {
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.rowText}>
        <AppText variant="subtitle" style={styles.rowTitle}>{title}</AppText>
        <AppText variant="caption">{subtitle}</AppText>
      </View>
      <StatusBadge label={badge} tone={tone} />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  dashboardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.lg,
  },
  dashboardCol: {
    flex: 1,
    minWidth: 0,
  },
  hero: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.md },
  pill: { alignItems: 'center', flex: 1 },
  pillValue: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.sm },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15 },
  divider: { height: 1, backgroundColor: theme.colors.borderMuted, marginVertical: 4 },
});
