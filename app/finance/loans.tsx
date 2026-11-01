import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader, ScreenHeaderActions } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdminWorkerLoanRequests } from '@/hooks/useMithrilAdmin';
import { useReviewWorkerLoan } from '@/hooks/useMithrilOps';
import { formatMinorAmount } from '@/lib/mithril';
import { theme } from '@/constants/theme';

type StatusFilter = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'all';

export default function WorkerLoansScreen() {
  const [status, setStatus] = useState<StatusFilter>('pending');
  const { data, isLoading, error, refetch } = useAdminWorkerLoanRequests(status);
  const review = useReviewWorkerLoan();
  const requests = data?.requests ?? [];

  function onReview(requestId: string, decision: 'approve' | 'reject', workerLabel: string) {
    Alert.alert(decision === 'approve' ? 'Approve loan' : 'Reject loan', workerLabel, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: decision === 'approve' ? 'Approve' : 'Reject',
        style: decision === 'approve' ? 'default' : 'destructive',
        onPress: () =>
          void review.mutateAsync({ requestId, body: { decision, reviewNotes: null } }).then(() => refetch()),
      },
    ]);
  }

  return (
    <Screen>
      <ScreenHeader
        title="Worker loans"
        showBack
        right={<ScreenHeaderActions icon="refresh" onPress={() => refetch()} />}
      />
      <AdminOnly>
        <View style={styles.chips}>
          {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
            <Chip key={s} label={s} active={status === s} onPress={() => setStatus(s)} />
          ))}
        </View>
        <QueryState loading={isLoading} error={error} empty={!isLoading && requests.length === 0} />
        {requests.map((r) => (
          <View key={r.id} style={styles.row}>
            <View style={styles.rowTop}>
              <AppText variant="subtitle">{r.workerLabel ?? r.workerId.slice(0, 8)}</AppText>
              <StatusBadge label={r.status} tone={r.status === 'pending' ? 'warning' : 'muted'} />
            </View>
            <AppText variant="body">{formatMinorAmount(r.amountMinor, 'GHS')}</AppText>
            {r.reason && <AppText variant="caption">{r.reason}</AppText>}
            {r.status === 'pending' && (
              <View style={styles.actions}>
                <Button label="Approve" variant="outline" small onPress={() => onReview(r.id, 'approve', r.workerLabel ?? 'Worker')} />
                <Button label="Reject" variant="ghost" small onPress={() => onReview(r.id, 'reject', r.workerLabel ?? 'Worker')} />
              </View>
            )}
          </View>
        ))}
      </AdminOnly>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  row: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
    gap: 4,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actions: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
});
