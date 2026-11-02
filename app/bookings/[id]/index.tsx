import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AppText } from '@/components/ui/Typography';
import {
  useAdminBooking,
  useAssignBookingCleaner,
  useBookingCleaners,
  useCancelBooking,
  useNotifyBookingCleaner,
  useRecordCashPayout,
  useResetBookingHold,
  useRescheduleBooking,
  useSendBookingReceipt,
  useUpdateBookingStatus,
} from '@/hooks/useMithrilOps';
import { adminBookingStatusOptions, formatBookingWhen, formatMinorAmount } from '@/lib/mithril';
import { theme } from '@/constants/theme';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const bookingId = id ?? '';
  const { data: booking, isLoading, error, refetch } = useAdminBooking(bookingId);
  const cleaners = useBookingCleaners(booking?.serviceId);
  const assign = useAssignBookingCleaner(bookingId);
  const updateStatus = useUpdateBookingStatus(bookingId);
  const cancel = useCancelBooking(bookingId);
  const reschedule = useRescheduleBooking(bookingId);
  const notifyCleaner = useNotifyBookingCleaner(bookingId);
  const sendReceipt = useSendBookingReceipt(bookingId);
  const resetHold = useResetBookingHold(bookingId);
  const cashPayout = useRecordCashPayout(bookingId);

  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('09:00');
  const [cancelReason, setCancelReason] = useState('');
  const [cashAmountGhs, setCashAmountGhs] = useState('');
  const [cashNotes, setCashNotes] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (booking) {
      setRescheduleDate(booking.scheduledDate ?? '');
      setRescheduleTime(booking.scheduledTime ?? '09:00');
    }
  }, [booking?.id, booking?.scheduledDate, booking?.scheduledTime]);

  const busy =
    assign.isPending ||
    updateStatus.isPending ||
    cancel.isPending ||
    reschedule.isPending ||
    notifyCleaner.isPending ||
    sendReceipt.isPending ||
    resetHold.isPending ||
    cashPayout.isPending;

  async function runAction(fn: () => Promise<unknown>) {
    setActionError(null);
    try {
      await fn();
      await refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Action failed.');
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Booking" subtitle={booking?.customerName ?? bookingId.slice(0, 8)} showBack />
      <AdminOnly>
        <QueryState loading={isLoading} error={error} empty={!isLoading && !booking} emptyMessage="Booking not found." />
        {booking && (
          <>
            <View style={styles.card}>
              <AppText variant="subtitle">{booking.serviceName}</AppText>
              <AppText variant="body">{formatBookingWhen(booking.scheduledDate, booking.scheduledTime)}</AppText>
              <AppText variant="caption">{booking.address ?? 'No address'}</AppText>
              <View style={styles.row}>
                <StatusBadge label={booking.status} tone="info" />
                <StatusBadge label={booking.paymentStatus} tone="muted" />
              </View>
              <AppText variant="body">{formatMinorAmount(booking.amountMinor, booking.currency)}</AppText>
              <AppText variant="caption">
                Customer {booking.customerName}
                {booking.customerPhone ? ` · ${booking.customerPhone}` : ''}
              </AppText>
              <AppText variant="caption">Worker {booking.cleanerName ?? 'Unassigned'}</AppText>
              <Button
                label="Job invoice"
                variant="ghost"
                small
                onPress={() => router.push(`/bookings/${bookingId}/invoice`)}
                style={styles.stackBtn}
              />
            </View>

            <AppText variant="section">Comms</AppText>
            <View style={styles.rowActions}>
              <Button
                label="Notify worker"
                variant="outline"
                small
                onPress={busy ? undefined : () => void runAction(() => notifyCleaner.mutateAsync())}
              />
              <Button
                label="Send receipt"
                variant="outline"
                small
                onPress={busy ? undefined : () => void runAction(() => sendReceipt.mutateAsync())}
              />
            </View>
            {booking.canResetHold && (
              <Button
                label="Reset exclusive hold"
                variant="outline"
                onPress={
                  busy
                    ? undefined
                    : () =>
                        Alert.alert('Reset hold', 'Release the assignment hold so another worker can take this job?', [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Reset',
                            onPress: () => void runAction(() => resetHold.mutateAsync({})),
                          },
                        ])
                }
                style={styles.stackBtn}
              />
            )}

            {booking.canRecordCashPayout && (
              <>
                <AppText variant="section">Cash payout</AppText>
                <TextInput
                  style={styles.input}
                  placeholder="Amount (GHS)"
                  placeholderTextColor={theme.colors.textDim}
                  keyboardType="decimal-pad"
                  value={cashAmountGhs}
                  onChangeText={setCashAmountGhs}
                />
                <TextInput
                  style={[styles.input, styles.multiline]}
                  placeholder="Notes (optional)"
                  placeholderTextColor={theme.colors.textDim}
                  multiline
                  value={cashNotes}
                  onChangeText={setCashNotes}
                />
                <Button
                  label="Record cash payout"
                  variant="outline"
                  onPress={
                    busy
                      ? undefined
                      : () => {
                          const parsed = Number(cashAmountGhs.replace(/,/g, '').trim());
                          if (!Number.isFinite(parsed) || parsed <= 0) {
                            setActionError('Enter a valid payout amount in GHS.');
                            return;
                          }
                          void runAction(() =>
                            cashPayout.mutateAsync({
                              amountMinor: Math.round(parsed * 100),
                              notes: cashNotes.trim() || null,
                            }),
                          );
                        }
                  }
                />
              </>
            )}

            {booking.canReassignCleaner && booking.serviceId && (
              <>
                <AppText variant="section">Assign worker</AppText>
                <QueryState loading={cleaners.isLoading} error={cleaners.error} />
                {(cleaners.data?.cleaners ?? []).map((c) => (
                  <Button
                    key={c.userId}
                    variant="outline"
                    label={`${c.name}${c.rating != null ? ` · ${c.rating.toFixed(1)}★` : ''}`}
                    onPress={busy ? undefined : () => void runAction(() => assign.mutateAsync({ cleanerId: c.userId }))}
                    style={styles.stackBtn}
                  />
                ))}
              </>
            )}

            <AppText variant="section">Status</AppText>
            <View style={styles.chips}>
              {adminBookingStatusOptions.map((status) => (
                <Chip
                  key={status}
                  label={status.replace(/_/g, ' ')}
                  active={booking.status === status}
                  onPress={() => void runAction(() => updateStatus.mutateAsync({ status }))}
                />
              ))}
            </View>

            <AppText variant="section">Reschedule</AppText>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.textDim}
              value={rescheduleDate || booking.scheduledDate || ''}
              onChangeText={setRescheduleDate}
            />
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              placeholderTextColor={theme.colors.textDim}
              value={rescheduleTime}
              onChangeText={setRescheduleTime}
            />
            <Button
              label={busy ? 'Saving…' : 'Save schedule'}
              variant="outline"
              onPress={
                busy
                  ? undefined
                  : () => {
                const scheduledDate = (rescheduleDate || booking.scheduledDate || '').trim();
                if (!scheduledDate) {
                  setActionError('Enter a date.');
                  return;
                }
                void runAction(() =>
                  reschedule.mutateAsync({
                    scheduledDate,
                    scheduledTime: rescheduleTime.trim() || '09:00',
                    timezone: 'Africa/Accra',
                  }),
                );
              }}
            />

            <AppText variant="section">Cancel</AppText>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Reason (optional)"
              placeholderTextColor={theme.colors.textDim}
              multiline
              value={cancelReason}
              onChangeText={setCancelReason}
            />
            <Button
              label="Cancel booking"
              variant="outline"
              onPress={
                busy
                  ? undefined
                  : () => {
                Alert.alert('Cancel booking', 'Refund follows Instaclean policy on the server.', [
                  { text: 'Keep', style: 'cancel' },
                  {
                    text: 'Cancel booking',
                    style: 'destructive',
                    onPress: () =>
                      void runAction(async () => {
                        await cancel.mutateAsync({ cancellationReason: cancelReason.trim() || null });
                        router.back();
                      }),
                  },
                ]);
              }}
            />

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
  row: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' },
  rowActions: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md, flexWrap: 'wrap' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
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
  stackBtn: { marginBottom: theme.spacing.sm },
  error: { color: theme.colors.danger, marginTop: theme.spacing.md },
});
