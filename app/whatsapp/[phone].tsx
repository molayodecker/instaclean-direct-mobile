import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { useAdminWhatsAppMessages, useSendWhatsAppMessage, useSendWhatsAppSms } from '@/hooks/useMithrilOps';
import { theme } from '@/constants/theme';

function decodePhoneParam(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function WhatsAppThreadScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const phoneE164 = decodePhoneParam(phone);
  const { data, isLoading, error, refetch } = useAdminWhatsAppMessages(phoneE164);
  const send = useSendWhatsAppMessage();
  const sendSms = useSendWhatsAppSms();
  const [draft, setDraft] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);

  const messages = data?.messages ?? [];

  async function onSend() {
    const body = draft.trim();
    if (!body || !phoneE164) return;
    setSendError(null);
    try {
      await send.mutateAsync({ phoneE164, body });
      setDraft('');
      await refetch();
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Could not send message.');
    }
  }

  return (
    <Screen scroll={false} padded={false} chat>
      <View style={styles.header}>
        <ScreenHeader title="WhatsApp" subtitle={phoneE164} showBack />
      </View>
      <QueryState loading={isLoading} error={error} />
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={messages}
        keyExtractor={(m, index) => `${m.id}-${index}`}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.direction === 'outbound' ? styles.out : styles.in]}>
            <AppText variant="body">{item.body}</AppText>
            {item.createdAt && (
              <AppText variant="caption" style={styles.time}>
                {new Date(item.createdAt).toLocaleString()}
              </AppText>
            )}
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? <AppText variant="caption" style={styles.empty}>No messages yet.</AppText> : null
        }
      />
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Message"
          placeholderTextColor={theme.colors.textDim}
          value={draft}
          onChangeText={setDraft}
          multiline
        />
        <Button label={send.isPending ? '…' : 'Send'} onPress={send.isPending ? undefined : () => void onSend()} />
        <Button
          label={sendSms.isPending ? '…' : 'Send as SMS'}
          variant="outline"
          onPress={
            sendSms.isPending
              ? undefined
              : () => {
                  const body = draft.trim();
                  if (!body || !phoneE164) return;
                  setSendError(null);
                  sendSms
                    .mutateAsync({ phoneE164, body })
                    .then(() => {
                      setDraft('');
                      return refetch();
                    })
                    .catch((e) =>
                      setSendError(e instanceof Error ? e.message : 'Could not send SMS.'),
                    );
                }
          }
        />
        {sendError && <AppText variant="caption" style={styles.error}>{sendError}</AppText>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: theme.spacing.lg },
  list: { flex: 1 },
  listContent: { padding: theme.spacing.lg, gap: theme.spacing.sm },
  bubble: {
    maxWidth: '85%',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  in: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  out: { alignSelf: 'flex-end', backgroundColor: theme.colors.primary },
  time: { marginTop: 4, opacity: 0.8 },
  empty: { textAlign: 'center', marginTop: theme.spacing.lg },
  composer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderMuted,
    gap: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    color: theme.colors.text,
    maxHeight: 120,
  },
  error: { color: theme.colors.danger },
});
