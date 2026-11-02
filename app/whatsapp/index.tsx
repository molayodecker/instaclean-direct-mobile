import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader, ScreenHeaderActions } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { QueryState } from '@/components/ui/QueryState';
import { useAdminWhatsAppThreads } from '@/hooks/useMithrilAdmin';
import { relativeTime } from '@/lib/mithril';
import { theme } from '@/constants/theme';

export default function WhatsAppInboxScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useAdminWhatsAppThreads();
  const threads = data?.threads ?? [];

  return (
    <Screen>
      <ScreenHeader
        title="WhatsApp"
        showBack
        right={<ScreenHeaderActions icon="refresh" onPress={() => refetch()} />}
      />
      <QueryState
        loading={isLoading}
        error={error}
        empty={!isLoading && threads.length === 0}
        emptyMessage="No open threads."
      />
      {threads.map((t) => (
        <Pressable
          key={t.phoneE164}
          style={styles.row}
          onPress={() => router.push(`/whatsapp/${encodeURIComponent(t.phoneE164)}`)}>
          <View style={styles.icon}>
            <Ionicons name="logo-whatsapp" size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.main}>
            <View style={styles.top}>
              <AppText variant="subtitle">{t.displayLabel || t.phoneE164}</AppText>
              <AppText variant="caption">{relativeTime(t.lastAt)}</AppText>
            </View>
            <AppText variant="caption" numberOfLines={2}>
              {t.preview}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textDim} />
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: { flex: 1 },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.sm },
});
