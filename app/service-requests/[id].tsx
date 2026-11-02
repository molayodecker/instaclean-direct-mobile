import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AppText } from '@/components/ui/Typography';
import { useAdminServiceRequests } from '@/hooks/useMithrilAdmin';
import { useAdminCandidates, useAssignServiceRequest, useUpdateServiceRequest } from '@/hooks/useMithrilOps';
import { adminMutableServiceRequestStatuses, formatBookingWhen, isOpenServiceRequestStatus, type AdminCandidate } from '@/lib/mithril';
import { theme } from '@/constants/theme';

export default function ServiceRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const requestId = id ?? '';
  const list = useAdminServiceRequests();
  const candidates = useAdminCandidates();
  const assign = useAssignServiceRequest(requestId);
  const update = useUpdateServiceRequest(requestId);
  const [actionError, setActionError] = useState<string | null>(null);

  const request = useMemo(
    () => (list.data?.requests ?? []).find((r) => r.id === requestId),
    [list.data, requestId],
  );

  const rows = candidates.data?.candidates ?? [];
  const requestedRole = request?.role;
  const workerChoices = requestedRole
    ? rows.filter((c: AdminCandidate) => c.desiredRoles.includes(requestedRole))
    : rows;

  async function runAssign(workerUserId: string) {
    setActionError(null);
    try {
      await assign.mutateAsync({ workerUserId, sendNotifications: true });
      await list.refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not assign.');
    }
  }

  async function runStatus(status: (typeof adminMutableServiceRequestStatuses)[number]) {
    setActionError(null);
    try {
      await update.mutateAsync({ status, adminNote: null });
      await list.refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not update status.');
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Service request" showBack />
      <QueryState
        loading={list.isLoading}
        error={list.error}
        empty={!list.isLoading && !request}
        emptyMessage="Request not found."
      />
      {request && (
        <>
          <View style={styles.card}>
            <View style={styles.top}>
              <AppText variant="subtitle">{request.customerName}</AppText>
              <StatusBadge label={request.priority} tone={request.priority === 'urgent' ? 'danger' : 'warning'} />
            </View>
            <AppText variant="body">
              {request.kind === 'urgent_help' ? 'Urgent help' : 'Replacement'} · {request.status}
            </AppText>
            <AppText variant="caption">{request.householdAddress}</AppText>
            <AppText variant="caption">
              {formatBookingWhen(
                request.requestedStartAt?.slice(0, 10),
                request.requestedStartAt?.includes('T')
                  ? request.requestedStartAt.split('T')[1]?.slice(0, 5)
                  : undefined,
              )}
            </AppText>
            {request.assignedWorkerName && (
              <AppText variant="body">Assigned: {request.assignedWorkerName}</AppText>
            )}
          </View>

          {isOpenServiceRequestStatus(request.status) && !request.assignedWorkerName && (
            <>
              <AppText variant="section">Match provider</AppText>
              <QueryState loading={candidates.isLoading} error={candidates.error} />
              {workerChoices.map((c) => (
                <Pressable
                  key={c.userId}
                  style={styles.row}
                  disabled={assign.isPending}
                  onPress={() => void runAssign(c.userId)}>
                  <AppText variant="subtitle">{c.name}</AppText>
                  <AppText variant="caption">
                    {c.rating != null ? `${c.rating.toFixed(1)}★ · ` : ''}
                    {c.completedJobs ?? 0} jobs
                  </AppText>
                </Pressable>
              ))}
            </>
          )}

          <AppText variant="section">Update status</AppText>
          <View style={styles.chips}>
            {adminMutableServiceRequestStatuses.map((status) => (
              <Chip key={status} label={status} active={request.status === status} onPress={() => void runStatus(status)} />
            ))}
          </View>

          {actionError && <AppText variant="caption" style={styles.error}>{actionError}</AppText>}
          <Button label="Refresh" variant="outline" onPress={() => list.refetch()} />
        </>
      )}
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
    gap: theme.spacing.sm,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  error: { color: theme.colors.danger, marginBottom: theme.spacing.sm },
});
