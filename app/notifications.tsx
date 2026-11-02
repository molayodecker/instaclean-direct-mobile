import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader, ScreenHeaderActions } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { useAdminNotificationDeliveries, useAdminNotificationTargets } from '@/hooks/useMithrilAdmin';
import { useSendAdminNotification, useSendNotificationBroadcast } from '@/hooks/useMithrilOps';
import type { AdminNotificationBroadcastRequest } from '@/lib/mithril';
import { relativeTime } from '@/lib/mithril';
import { theme } from '@/constants/theme';

type Tab = 'history' | 'send' | 'broadcast';

export default function NotificationsScreen() {
  const [tab, setTab] = useState<Tab>('history');
  const deliveries = useAdminNotificationDeliveries(1);

  return (
    <Screen>
      <ScreenHeader
        title="Notifications"
        showBack
        right={<ScreenHeaderActions icon="refresh" onPress={() => deliveries.refetch()} />}
      />
      <AdminOnly>
        <View style={styles.tabs}>
          {(['history', 'send', 'broadcast'] as const).map((key) => (
            <Chip key={key} label={tabLabel(key)} active={tab === key} onPress={() => setTab(key)} />
          ))}
        </View>

        {tab === 'history' && <HistoryTab query={deliveries} />}
        {tab === 'send' && <SendTab />}
        {tab === 'broadcast' && <BroadcastTab />}
      </AdminOnly>
    </Screen>
  );
}

function tabLabel(tab: Tab) {
  if (tab === 'history') return 'History';
  if (tab === 'send') return 'Send one';
  return 'Broadcast';
}

function HistoryTab({ query }: { query: ReturnType<typeof useAdminNotificationDeliveries> }) {
  const items = query.data?.deliveries ?? [];
  return (
    <>
      <QueryState loading={query.isLoading} error={query.error} empty={!query.isLoading && items.length === 0} />
      {items.map((d) => (
        <View key={d.id} style={styles.row}>
          <AppText variant="subtitle">{d.title}</AppText>
          <AppText variant="caption">
            {d.recipientName}
            {d.createdAt ? ` · ${relativeTime(d.createdAt)}` : ''}
          </AppText>
          <AppText variant="body" numberOfLines={2}>
            {d.message}
          </AppText>
        </View>
      ))}
    </>
  );
}

function SendTab() {
  const [targetQuery, setTargetQuery] = useState('');
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [includeSms, setIncludeSms] = useState(false);
  const [includeWhatsapp, setIncludeWhatsapp] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const targets = useAdminNotificationTargets(targetQuery);
  const send = useSendAdminNotification();
  const selected = (targets.data?.targets ?? []).find((t) => t.id === targetUserId);

  async function onSend() {
    if (!targetUserId || !title.trim() || !message.trim()) {
      setActionError('Recipient, title, and message are required.');
      return;
    }
    setActionError(null);
    try {
      await send.mutateAsync({
        targetUserId,
        title: title.trim(),
        message: message.trim(),
        includeSms,
        includeWhatsapp,
        type: 'admin_message',
      });
      setTitle('');
      setMessage('');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Send failed.');
    }
  }

  return (
    <>
      <TextInput
        style={styles.input}
        placeholder="Search recipient (2+ chars)"
        placeholderTextColor={theme.colors.textDim}
        value={targetQuery}
        onChangeText={(t) => {
          setTargetQuery(t);
          setTargetUserId(null);
        }}
      />
      <QueryState loading={targets.isLoading} error={targets.error} />
      {(targets.data?.targets ?? []).slice(0, 6).map((t) => (
        <Button
          key={t.id}
          variant={targetUserId === t.id ? 'primary' : 'outline'}
          label={`${t.name}${t.phone ? ` · ${t.phone}` : ''}`}
          onPress={() => setTargetUserId(t.id)}
          style={styles.stackBtn}
        />
      ))}
      {selected && <AppText variant="caption">To · {selected.name}</AppText>}

      <TextInput
        style={styles.input}
        placeholder="Title"
        placeholderTextColor={theme.colors.textDim}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Message"
        placeholderTextColor={theme.colors.textDim}
        multiline
        value={message}
        onChangeText={setMessage}
      />
      <View style={styles.chips}>
        <Chip label="Also SMS" active={includeSms} onPress={() => setIncludeSms((v) => !v)} />
        <Chip label="Also WhatsApp" active={includeWhatsapp} onPress={() => setIncludeWhatsapp((v) => !v)} />
      </View>
      <Button label={send.isPending ? 'Sending…' : 'Send'} onPress={send.isPending ? undefined : () => void onSend()} />
      {actionError && <AppText variant="caption" style={styles.error}>{actionError}</AppText>}
    </>
  );
}

function BroadcastTab() {
  const [segment, setSegment] = useState<AdminNotificationBroadcastRequest['segment']>('customers');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [includeSms, setIncludeSms] = useState(false);
  const [includeWhatsapp, setIncludeWhatsapp] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const broadcast = useSendNotificationBroadcast();

  async function onBroadcast() {
    if (!title.trim() || !message.trim()) {
      setActionError('Title and message are required.');
      return;
    }
    setActionError(null);
    try {
      await broadcast.mutateAsync({
        segment,
        title: title.trim(),
        message: message.trim(),
        includeSms,
        includeWhatsapp,
        type: 'admin_message',
      });
      setTitle('');
      setMessage('');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Broadcast failed.');
    }
  }

  return (
    <>
      <AppText variant="caption">Segment</AppText>
      <View style={styles.chips}>
        <Chip label="Customers" active={segment === 'customers'} onPress={() => setSegment('customers')} />
        <Chip label="Workers" active={segment === 'cleaners'} onPress={() => setSegment('cleaners')} />
        <Chip label="All app users" active={segment === 'all_app_users'} onPress={() => setSegment('all_app_users')} />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Title"
        placeholderTextColor={theme.colors.textDim}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Message"
        placeholderTextColor={theme.colors.textDim}
        multiline
        value={message}
        onChangeText={setMessage}
      />
      <View style={styles.chips}>
        <Chip label="Also SMS" active={includeSms} onPress={() => setIncludeSms((v) => !v)} />
        <Chip label="Also WhatsApp" active={includeWhatsapp} onPress={() => setIncludeWhatsapp((v) => !v)} />
      </View>
      <Button
        label={broadcast.isPending ? 'Sending…' : 'Send broadcast'}
        onPress={broadcast.isPending ? undefined : () => void onBroadcast()}
      />
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
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  stackBtn: { marginBottom: theme.spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  error: { color: theme.colors.danger, marginTop: theme.spacing.md },
});
