import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { Button } from '@/components/ui/Button';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdminWorkers, useAdminWorkerWallet } from '@/hooks/useMithrilAdmin';
import { useCreditWorkerWallet } from '@/hooks/useMithrilOps';
import { formatMinorAmount } from '@/lib/mithril';
import { theme } from '@/constants/theme';

export default function WorkerDetailScreen() {
  const { userId, search } = useLocalSearchParams<{ userId: string; search?: string }>();
  const workerId = userId ?? '';
  const { data, isLoading, error } = useAdminWorkers(search || undefined);
  const walletQuery = useAdminWorkerWallet(workerId);
  const credit = useCreditWorkerWallet(workerId);
  const worker = (data?.cleaners ?? []).find((c) => c.userId === workerId);

  const [amountGhs, setAmountGhs] = useState('');
  const [notes, setNotes] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const wallet = walletQuery.data;
  const busy = credit.isPending;

  async function onCredit() {
    const parsed = Number(amountGhs.replace(/,/g, '').trim());
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setActionError('Enter a valid amount in GHS.');
      return;
    }
    setActionError(null);
    try {
      await credit.mutateAsync({
        amountMinor: Math.round(parsed * 100),
        notes: notes.trim() || null,
      });
      setAmountGhs('');
      setNotes('');
      await walletQuery.refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not credit wallet.');
    }
  }

  return (
    <Screen>
      <ScreenHeader title={worker?.name ?? 'Worker'} subtitle="Profile" showBack />
      <AdminOnly>
        <QueryState loading={isLoading} error={error} empty={!isLoading && !worker} emptyMessage="Worker not found in roster." />
        {worker && (
          <>
            <View style={styles.card}>
              <View style={styles.row}>
                <AppText variant="caption">Status</AppText>
                <StatusBadge label={worker.status} tone={worker.verified ? 'success' : 'muted'} />
              </View>
              <Field label="Email" value={worker.email} />
              <Field label="Phone" value={worker.phone} />
              <Field label="Hourly rate" value={worker.hourlyRateGhs != null ? `GH₵ ${worker.hourlyRateGhs}` : '—'} />
              <Field label="Completed jobs" value={String(worker.completedJobs ?? 0)} />
              <Field label="Specialties" value={(worker.specialties ?? []).join(', ') || '—'} />
            </View>

            <AppText variant="section">Wallet</AppText>
            <QueryState loading={walletQuery.isLoading} error={walletQuery.error} />
            {wallet && (
              <View style={styles.card}>
                <AppText variant="subtitle">
                  {formatMinorAmount(wallet.balanceMinor ?? 0, wallet.currency)}
                </AppText>
                <AppText variant="caption">Available balance</AppText>
              </View>
            )}

            <AppText variant="section">Add wallet credit</AppText>
            <TextInput
              style={styles.input}
              placeholder="Amount (GHS)"
              placeholderTextColor={theme.colors.textDim}
              keyboardType="decimal-pad"
              value={amountGhs}
              onChangeText={setAmountGhs}
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Notes (optional)"
              placeholderTextColor={theme.colors.textDim}
              multiline
              value={notes}
              onChangeText={setNotes}
            />
            <Button label={busy ? 'Saving…' : 'Credit wallet'} onPress={busy ? undefined : () => void onCredit()} />
            {actionError && (
              <AppText variant="caption" style={styles.error}>
                {actionError}
              </AppText>
            )}
          </>
        )}
      </AdminOnly>
    </Screen>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.field}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="body">{value || '—'}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  field: { gap: 4 },
  input: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  error: { color: theme.colors.danger, marginTop: theme.spacing.md },
});
