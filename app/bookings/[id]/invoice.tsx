import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Linking, StyleSheet, TextInput, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { Button } from '@/components/ui/Button';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import {
  useAdminBooking,
  useAdminJobInvoice,
  useSendJobInvoice,
  useUpsertJobInvoice,
} from '@/hooks/useMithrilOps';
import { formatMinorAmount } from '@/lib/mithril';
import { theme } from '@/constants/theme';
import type { AdminJobInvoiceUpsertRequest } from '@/lib/mithril';

function accraTodayIso() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Accra' }).format(new Date());
}

export default function BookingInvoiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = id ?? '';
  const bookingQuery = useAdminBooking(bookingId);
  const invoiceQuery = useAdminJobInvoice(bookingId);
  const upsert = useUpsertJobInvoice(bookingId);
  const send = useSendJobInvoice(bookingId);

  const booking = bookingQuery.data;
  const saved = invoiceQuery.data;
  const loading = bookingQuery.isLoading || (invoiceQuery.isLoading && !invoiceQuery.isError);

  const [billToName, setBillToName] = useState('');
  const [project, setProject] = useState('');
  const [notes, setNotes] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (saved) {
      setBillToName(saved.billToName);
      setProject(saved.project);
      setNotes(saved.notes ?? '');
      return;
    }
    if (booking && !saved) {
      setBillToName(booking.customerName);
      setProject(`${booking.serviceName} · ${booking.address ?? 'On site'}`);
    }
  }, [saved, booking]);

  const draftBody = useMemo((): AdminJobInvoiceUpsertRequest | null => {
    if (!booking) return null;
    const name = billToName.trim();
    const proj = project.trim();
    if (!name || !proj) return null;
    return {
      billToName: name,
      billToEmail: saved ? saved.billToEmail : (booking.customerEmail ?? null),
      billToPhone: saved ? saved.billToPhone : (booking.customerPhone ?? null),
      billToAddress: saved ? saved.billToAddress : (booking.address ?? null),
      project: proj,
      issuedOn: saved?.issuedOn ?? accraTodayIso(),
      adjustmentMinor: saved?.adjustmentMinor ?? 0,
      invoiceNo: saved?.invoiceNo ?? null,
      signatoryRole: saved?.signatoryRole ?? null,
      notes: notes.trim() || null,
      lines:
        saved?.lines?.map((line) => ({
          description: line.description,
          unitMinor: line.unitMinor,
          qty: line.qty ?? null,
          days: line.days ?? null,
        })) ??
        [
          {
            description: booking.serviceName,
            unitMinor: booking.amountMinor,
            qty: 1,
            days: null,
          },
        ],
    };
  }, [billToName, booking, notes, project, saved]);

  const busy = upsert.isPending || send.isPending;
  const display = saved ?? null;

  async function saveDraft() {
    if (!draftBody) {
      setActionError('Fill in bill-to name and project.');
      return;
    }
    setActionError(null);
    try {
      await upsert.mutateAsync(draftBody);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not save invoice.');
    }
  }

  async function deliver(channel: 'whatsapp' | 'email') {
    setActionError(null);
    try {
      if (!saved && draftBody) await upsert.mutateAsync(draftBody);
      await send.mutateAsync({ channel });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not send invoice.');
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Job invoice" subtitle={booking?.customerName} showBack />
      <AdminOnly>
        <QueryState
          loading={loading}
          error={bookingQuery.error}
          empty={!loading && !booking}
          emptyMessage="Booking not found."
        />
        {booking && (
          <>
            {display && (
              <View style={styles.summary}>
                <AppText variant="subtitle">{display.invoiceNo}</AppText>
                <AppText variant="body">{formatMinorAmount(display.totalMinor, display.currency)}</AppText>
                {display.lastWhatsappSentAt && (
                  <AppText variant="caption">WhatsApp sent · {display.lastWhatsappSentAt}</AppText>
                )}
                {display.lastEmailSentAt && (
                  <AppText variant="caption">Email sent · {display.lastEmailSentAt}</AppText>
                )}
                {display.viewUrl && (
                  <Button
                    label="Open invoice link"
                    variant="ghost"
                    small
                    onPress={() => void Linking.openURL(display.viewUrl!)}
                  />
                )}
              </View>
            )}

            <AppText variant="section">Bill to</AppText>
            <TextInput
              style={styles.input}
              value={billToName}
              onChangeText={setBillToName}
              placeholder="Customer name"
              placeholderTextColor={theme.colors.textDim}
            />
            <TextInput
              style={styles.input}
              value={project}
              onChangeText={setProject}
              placeholder="Project description"
              placeholderTextColor={theme.colors.textDim}
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes"
              placeholderTextColor={theme.colors.textDim}
              multiline
            />

            {(display?.lines ?? draftBody?.lines ?? []).map((line, index) => (
              <AppText key={`${line.description}-${index}`} variant="caption">
                {line.description} ·{' '}
                {formatMinorAmount(
                  'unitMinor' in line ? line.unitMinor : 0,
                  display?.currency ?? booking.currency,
                )}
              </AppText>
            ))}

            <Button
              label={busy ? 'Saving…' : 'Save invoice'}
              variant="outline"
              onPress={busy ? undefined : () => void saveDraft()}
              style={styles.stackBtn}
            />

            <AppText variant="section">Send</AppText>
            <View style={styles.row}>
              <Button
                label="WhatsApp"
                variant="outline"
                small
                onPress={busy ? undefined : () => void deliver('whatsapp')}
              />
              <Button
                label="Email"
                variant="outline"
                small
                onPress={busy ? undefined : () => void deliver('email')}
              />
            </View>

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
  summary: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
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
  row: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' },
  stackBtn: { marginTop: theme.spacing.sm, marginBottom: theme.spacing.md },
  error: { color: theme.colors.danger, marginTop: theme.spacing.md },
});
