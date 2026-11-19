import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { Button } from '@/components/ui/Button';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAdminContract, useSendAdminContractWorkerRating } from '@/hooks/useMithrilAdmin';
import { currentContractMonth, formatMinorAmount, MithrilApiError } from '@/lib/mithril';
import { theme } from '@/constants/theme';

export default function ContractDetailScreen() {
  const { id, month: monthParam } = useLocalSearchParams<{ id: string; month?: string }>();
  const contractId = id ?? '';
  const month = monthParam ?? currentContractMonth();
  const { data, isLoading, error } = useAdminContract(contractId, month);
  const sendRating = useSendAdminContractWorkerRating(contractId);
  const [number, setNumber] = useState('');
  const [ratingError, setRatingError] = useState<string | null>(null);

  const client = data?.client;
  const savedPhone = data?.phone || client?.phone;

  async function handleSendRating() {
    if (sendRating.isPending) return;
    setRatingError(null);
    try {
      const result = await sendRating.mutateAsync({ phone: number.trim() || null });
      if (!result.sent) {
        setRatingError('The rating request was not sent. Please try again.');
        return;
      }
      setNumber('');
      Alert.alert('Rating WhatsApp sent', `Sent to ${result.phone}.`);
    } catch (sendError) {
      setRatingError(ratingErrorMessage(sendError));
    }
  }

  return (
    <Screen>
      <ScreenHeader title={client?.name ?? 'Contract'} subtitle={month} showBack />
      <AdminOnly allowReviewers>
        <QueryState loading={isLoading} error={error} empty={!isLoading && !data} emptyMessage="Contract not found." />
        {data && client && (
          <>
            <View style={styles.card}>
              <View style={styles.row}>
                <AppText variant="subtitle">{client.name}</AppText>
                <StatusBadge label={data.status ?? 'unknown'} tone={data.status === 'active' ? 'success' : 'muted'} />
              </View>
              <AppText variant="body">{formatMinorAmount(data.monthlyFeeMinor, data.currency)} monthly</AppText>
              <AppText variant="caption">{client.email ?? client.phone ?? data.billingContact ?? '—'}</AppText>
              <AppText variant="caption">Invoice · {(data.invoiceStatus ?? 'not_invoiced').replace(/_/g, ' ')}</AppText>
            </View>

            <View style={styles.card}>
              <AppText variant="subtitle">Ask the client to rate their worker</AppText>
              <AppText variant="caption">
                {savedPhone
                  ? `Leave the number blank to use ${savedPhone}. We also send this every 3 months.`
                  : 'Enter a Ghana number. This contract does not have one saved. We also send this every 3 months.'}
              </AppText>
              <TextInput
                value={number}
                onChangeText={setNumber}
                editable={!sendRating.isPending}
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                maxLength={40}
                placeholder="Different number, optional"
                placeholderTextColor={theme.colors.textDim}
                style={styles.phone}
              />
              {ratingError ? <AppText variant="caption" style={styles.error}>{ratingError}</AppText> : null}
              <Button
                label={sendRating.isPending ? 'Sending' : 'WhatsApp'}
                disabled={sendRating.isPending}
                onPress={() => void handleSendRating()}
              />
            </View>

            <AppText variant="section">Workers on contract</AppText>
            {(data.workers ?? []).map((w) => (
              <View key={w.id} style={styles.workerRow}>
                <AppText variant="subtitle">{w.workerName}</AppText>
                <AppText variant="caption">
                  Net {formatMinorAmount(w.netMinor, data.currency)} · {w.status}
                </AppText>
              </View>
            ))}

            <AppText variant="section">Advances</AppText>
            {(data.advances ?? []).length === 0 && <AppText variant="caption">No advances this month.</AppText>}
            {(data.advances ?? []).slice(0, 8).map((a) => (
              <AppText key={a.id} variant="caption">
                {a.workerName} · {formatMinorAmount(a.amountMinor, data.currency)} · {a.weekLabel}
              </AppText>
            ))}
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
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  workerRow: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
  },
  phone: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    color: theme.colors.text,
    backgroundColor: theme.colors.inputBg,
  },
  error: { color: theme.colors.danger },
});

function ratingErrorMessage(error: unknown) {
  if (error instanceof MithrilApiError) {
    switch (error.code) {
      case 'invalid_phone':
        return 'Enter a valid Ghana phone number, like 024 000 0000.';
      case 'missing_phone':
        return 'Add a WhatsApp number before sending.';
      case 'no_worker':
        return 'Add a worker to this contract before asking for a rating.';
      case 'not_found':
      case 'contract_not_found':
        return 'This contract could not be found.';
      default:
        return 'The rating request could not be sent.';
    }
  }
  return 'The rating request could not be sent.';
}
