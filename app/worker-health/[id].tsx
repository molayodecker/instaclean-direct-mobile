import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AppText } from '@/components/ui/Typography';
import { useAdminCleanerHealthCase, useRecordCleanerHealthAction } from '@/hooks/useMithrilOps';
import { adminCleanerHealthActionTypes, type AdminCleanerHealthCaseAction } from '@/lib/mithril';
import { theme } from '@/constants/theme';

export default function CleanerHealthCaseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const caseId = id ?? '';
  const { data, isLoading, error, refetch } = useAdminCleanerHealthCase(caseId);
  const record = useRecordCleanerHealthAction(caseId);
  const [notes, setNotes] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  async function onAction(actionType: (typeof adminCleanerHealthActionTypes)[number]) {
    setActionError(null);
    try {
      await record.mutateAsync({ actionType, notes: notes.trim() || null });
      setNotes('');
      await refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not record action.');
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Health case" showBack />
      <AdminOnly>
        <QueryState loading={isLoading} error={error} empty={!isLoading && !data} emptyMessage="Case not found." />
        {data && (
          <>
            <View style={styles.card}>
              <View style={styles.top}>
                <AppText variant="subtitle">{data.cleanerName}</AppText>
                <StatusBadge label={data.severity} tone={data.severity === 'red' ? 'danger' : 'warning'} />
              </View>
              <AppText variant="body">{data.mainReason}</AppText>
              <AppText variant="caption">
                Score {data.riskScore} · {data.status} · {new Date(data.createdAt).toLocaleDateString()}
              </AppText>
            </View>

            <AppText variant="section">Recent actions</AppText>
            {(data.actions ?? []).slice(0, 5).map((a: AdminCleanerHealthCaseAction, index) => (
              <View key={`${a.actionType}-${a.createdAt}-${index}`} style={styles.actionRow}>
                <AppText variant="caption">{a.actionType}</AppText>
                <AppText variant="body">{a.notes ?? '—'}</AppText>
              </View>
            ))}

            <AppText variant="section">Record action</AppText>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Notes (optional)"
              placeholderTextColor={theme.colors.textDim}
              multiline
              value={notes}
              onChangeText={setNotes}
            />
            <View style={styles.chips}>
              {adminCleanerHealthActionTypes.map((actionType) => (
                <Chip
                  key={actionType}
                  label={actionType}
                  onPress={() => void onAction(actionType)}
                />
              ))}
            </View>

            {actionError && <AppText variant="caption" style={styles.error}>{actionError}</AppText>}
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
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionRow: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  error: { color: theme.colors.danger, marginTop: theme.spacing.md },
});
