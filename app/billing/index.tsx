import { useEffect, useRef, useState } from 'react';
import { Linking, StyleSheet, TextInput, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader, ScreenHeaderActions } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  useAdminBillingInvoices,
  useAdminPaymentAdvices,
  useAdminPaymentRequests,
} from '@/hooks/useMithrilAdmin';
import { useCreatePaymentRequest, usePaymentRequestAction } from '@/hooks/useMithrilOps';
import { formatMinorAmount } from '@/lib/mithril';
import { theme } from '@/constants/theme';

type Tab = 'invoices' | 'advices' | 'requests';

function newIdempotencyKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export default function BillingScreen() {
  const [tab, setTab] = useState<Tab>('requests');
  const invoices = useAdminBillingInvoices(1);
  const advices = useAdminPaymentAdvices(1);
  const requests = useAdminPaymentRequests();

  const refetchAll = () => {
    invoices.refetch();
    advices.refetch();
    requests.refetch();
  };

  return (
    <Screen>
      <ScreenHeader
        title="Billing"
        showBack
        right={<ScreenHeaderActions icon="refresh" onPress={refetchAll} />}
      />
      <AdminOnly>
        <View style={styles.tabs}>
          <Chip label="Payment requests" active={tab === 'requests'} onPress={() => setTab('requests')} />
          <Chip label="Invoices" active={tab === 'invoices'} onPress={() => setTab('invoices')} />
          <Chip label="Pay advice" active={tab === 'advices'} onPress={() => setTab('advices')} />
        </View>

        {tab === 'invoices' && <InvoicesTab query={invoices} />}
        {tab === 'advices' && <AdvicesTab query={advices} />}
        {tab === 'requests' && <RequestsTab query={requests} />}
      </AdminOnly>
    </Screen>
  );
}

function InvoicesTab({ query }: { query: ReturnType<typeof useAdminBillingInvoices> }) {
  const items = query.data?.invoices ?? [];
  return (
    <>
      <QueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && items.length === 0} />
      {items.map((inv) => (
        <View key={inv.id} style={styles.row}>
          <AppText variant="subtitle">{inv.invoiceNo}</AppText>
          <AppText variant="caption">{inv.billToName} · {inv.project}</AppText>
          <AppText variant="body">{formatMinorAmount(inv.totalMinor, inv.currency)}</AppText>
        </View>
      ))}
    </>
  );
}

function AdvicesTab({ query }: { query: ReturnType<typeof useAdminPaymentAdvices> }) {
  const items = query.data?.advices ?? [];
  return (
    <>
      <QueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && items.length === 0} />
      {items.map((a) => (
        <View key={a.id} style={styles.row}>
          <AppText variant="subtitle">{a.adviceNo}</AppText>
          <AppText variant="caption">{a.paidToName} · {a.payPeriod}</AppText>
          <AppText variant="body">{formatMinorAmount(a.netMinor, a.currency)}</AppText>
        </View>
      ))}
    </>
  );
}

function RequestsTab({ query }: { query: ReturnType<typeof useAdminPaymentRequests> }) {
  const items = query.data?.requests ?? [];
  const action = usePaymentRequestAction();
  const create = useCreatePaymentRequest();
  const [showCreate, setShowCreate] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [amountGhs, setAmountGhs] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const idempotencyKey = useRef(newIdempotencyKey());

  useEffect(() => {
    idempotencyKey.current = newIdempotencyKey();
  }, [customerName, phone, description, amountGhs]);

  async function onCreate() {
    const amount = Number(amountGhs.replace(/,/g, '').trim());
    if (!customerName.trim() || !phone.trim() || !description.trim() || !Number.isFinite(amount) || amount <= 0) {
      setActionError('Fill customer, phone, description, and amount.');
      return;
    }
    setActionError(null);
    try {
      await create.mutateAsync({
        customerName: customerName.trim(),
        phone: phone.trim(),
        description: description.trim(),
        amountMinor: Math.round(amount * 100),
        idempotencyKey: idempotencyKey.current,
        remindIfUnpaid: false,
      });
      idempotencyKey.current = newIdempotencyKey();
      setShowCreate(false);
      setCustomerName('');
      setPhone('');
      setDescription('');
      setAmountGhs('');
      await query.refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not create request.');
    }
  }

  return (
    <>
      <Button
        label={showCreate ? 'Cancel new request' : 'New payment request'}
        variant="outline"
        onPress={() => setShowCreate((v) => !v)}
        style={styles.stackBtn}
      />
      {showCreate && (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Customer name" placeholderTextColor={theme.colors.textDim} value={customerName} onChangeText={setCustomerName} />
          <TextInput style={styles.input} placeholder="Phone" placeholderTextColor={theme.colors.textDim} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="Description" placeholderTextColor={theme.colors.textDim} value={description} onChangeText={setDescription} />
          <TextInput style={styles.input} placeholder="Amount (GHS)" placeholderTextColor={theme.colors.textDim} value={amountGhs} onChangeText={setAmountGhs} keyboardType="decimal-pad" />
          <Button label={create.isPending ? 'Sending…' : 'Send request'} onPress={create.isPending ? undefined : () => void onCreate()} />
        </View>
      )}

      <QueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && items.length === 0} />
      {items.map((r) => (
        <View key={r.id} style={styles.row}>
          <View style={styles.rowTop}>
            <AppText variant="subtitle">{r.customerName}</AppText>
            <StatusBadge label={r.status} tone={r.status === 'paid' ? 'success' : 'warning'} />
          </View>
          <AppText variant="caption">{r.description}</AppText>
          <AppText variant="body">{formatMinorAmount(r.amountMinor, r.currency)}</AppText>
          {r.payUrl && (
            <Button label="Open pay link" variant="ghost" small onPress={() => void Linking.openURL(r.payUrl)} />
          )}
          {r.status === 'unpaid' && (
            <View style={styles.actions}>
              <Button label="Remind" variant="outline" small onPress={() => void action.mutateAsync({ requestId: r.id, action: 'reminders' })} />
              <Button label="Retry" variant="outline" small onPress={() => void action.mutateAsync({ requestId: r.id, action: 'retry' })} />
              <Button
                label={r.reminderPaused ? 'Resume' : 'Pause'}
                variant="outline"
                small
                onPress={() =>
                  void action.mutateAsync({
                    requestId: r.id,
                    action: r.reminderPaused ? 'resume' : 'pause',
                  })
                }
              />
            </View>
          )}
        </View>
      ))}
      {actionError && <AppText variant="caption" style={styles.error}>{actionError}</AppText>}
    </>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  row: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
    gap: 4,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  form: { marginBottom: theme.spacing.md, gap: theme.spacing.sm },
  input: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    color: theme.colors.text,
  },
  stackBtn: { marginBottom: theme.spacing.md },
  error: { color: theme.colors.danger, marginTop: theme.spacing.md },
});
