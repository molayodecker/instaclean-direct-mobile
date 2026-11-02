import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import {
  useAddCustomerTrustNote,
  useAdminCustomerTrustDetail,
  useCustomerTrustAction,
} from '@/hooks/useMithrilOps';
import { adminCustomerTrustActions, type AdminCustomerTrustNote } from '@/lib/mithril';
import { theme } from '@/constants/theme';

export default function CustomerTrustDetailScreen() {
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const id = customerId ?? '';
  const { data, isLoading, error, refetch } = useAdminCustomerTrustDetail(id);
  const addNote = useAddCustomerTrustNote(id);
  const trustAction = useCustomerTrustAction(id);
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('Reviewed on mobile');
  const [actionError, setActionError] = useState<string | null>(null);

  const profile = data;

  async function saveNote() {
    const text = note.trim();
    if (!text) return;
    setActionError(null);
    try {
      await addNote.mutateAsync({ note: text });
      setNote('');
      await refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not save note.');
    }
  }

  async function runAction(action: (typeof adminCustomerTrustActions)[number]) {
    setActionError(null);
    try {
      await trustAction.mutateAsync({ action, reason: reason.trim() || 'Mobile admin action' });
      await refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Action failed.');
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Customer trust" showBack />
      <AdminOnly>
        <QueryState loading={isLoading} error={error} empty={!isLoading && !profile} emptyMessage="Profile not found." />
        {profile && (
          <>
            <View style={styles.card}>
              <AppText variant="subtitle">{profile.name}</AppText>
              <AppText variant="caption">{profile.email ?? profile.phone ?? '—'}</AppText>
              <AppText variant="body">Risk score {profile.riskScore}</AppText>
              <AppText variant="caption">
                Bookings {profile.completedBookingsCount} · failed payments {profile.failedPaymentCount}
              </AppText>
            </View>

            <AppText variant="section">Notes</AppText>
            {(data?.adminNotes ?? []).slice(0, 5).map((n: AdminCustomerTrustNote, index) => (
              <View key={`${n.createdAt}-${index}`} style={styles.note}>
                <AppText variant="body">{n.note}</AppText>
                <AppText variant="caption">{new Date(n.createdAt).toLocaleString()}</AppText>
              </View>
            ))}
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Add internal note"
              placeholderTextColor={theme.colors.textDim}
              multiline
              value={note}
              onChangeText={setNote}
            />
            <Button
              label={addNote.isPending ? 'Saving…' : 'Save note'}
              variant="outline"
              onPress={addNote.isPending ? undefined : () => void saveNote()}
            />

            <AppText variant="section">Actions</AppText>
            <TextInput
              style={styles.input}
              placeholder="Reason"
              placeholderTextColor={theme.colors.textDim}
              value={reason}
              onChangeText={setReason}
            />
            <View style={styles.chips}>
              {adminCustomerTrustActions.map((action) => (
                <Chip
                  key={action}
                  label={action.replace(/_/g, ' ')}
                  onPress={() => void runAction(action)}
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
  note: {
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
