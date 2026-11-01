import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { QueryState } from '@/components/ui/QueryState';
import { useAuth } from '@/context/AuthContext';
import { useAdminAppUpdatePolicies } from '@/hooks/useMithrilAdmin';
import { mithrilApiBaseUrl, mithrilApiEnvironment } from '@/lib/mithril';
import { isSentryEnabled } from '@/lib/sentry';
import { theme } from '@/constants/theme';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const policies = useAdminAppUpdatePolicies();

  const staffLabel = [user?.admin ? 'Admin' : null, user?.reviewer ? 'Reviewer' : null]
    .filter(Boolean)
    .join(' · ');

  const productionPolicy = policies.data?.policies.find((p) => p.channel === 'production');

  return (
    <Screen>
      <ScreenHeader title="Settings" showBack />

      <AppText variant="section">Session</AppText>
      <View style={styles.card}>
        <Field label="Name" value={user?.name ?? '—'} />
        <Field label="Email" value={user?.email ?? '—'} />
        <Field label="Phone" value={user?.phone ?? '—'} />
        <Field label="Staff role" value={staffLabel || '—'} />
        <Field label="User ID" value={user?.id ?? '—'} mono />
      </View>

      <AppText variant="section">Mithril API</AppText>
      <View style={styles.card}>
        <Field label="Environment" value={mithrilApiEnvironment()} />
        <Field label="Base URL" value={mithrilApiBaseUrl()} mono />
        <Field label="Sentry" value={isSentryEnabled() ? 'Enabled' : 'Disabled (set EXPO_PUBLIC_SENTRY_DSN)'} />
        <QueryState loading={policies.isLoading} error={policies.error} />
        {productionPolicy && (
          <Field label="Production min app version" value={productionPolicy.minVersion} />
        )}
      </View>

      <AppText variant="section">Admin tools</AppText>
      <NavRow icon="phone-portrait" title="App update policy" sub="Load & save via Mithril" href="/app-update-policy" />
      <NavRow icon="map" title="Dispatch map" sub="Live workers & bookings" href="/dispatch-map" />
      <NavRow icon="stats-chart" title="Reports" sub="7 / 30 / 90 day summary" href="/reports" />

      <AppText variant="section">Account</AppText>
      <Pressable
        style={styles.row}
        onPress={async () => {
          await signOut();
          router.replace('/sign-in');
        }}>
        <View style={styles.iconBox}>
          <Ionicons name="log-out" size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.main}>
          <AppText variant="subtitle">Sign out</AppText>
          <AppText variant="caption">Clears secure session tokens</AppText>
        </View>
      </Pressable>
    </Screen>
  );
}

function NavRow({
  icon,
  title,
  sub,
  href,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  sub: string;
  href: '/app-update-policy' | '/dispatch-map' | '/reports';
}) {
  const router = useRouter();
  return (
    <Pressable style={styles.row} onPress={() => router.push(href)}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.main}>
        <AppText variant="subtitle" style={styles.itemTitle}>{title}</AppText>
        <AppText variant="caption">{sub}</AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textDim} />
    </Pressable>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.field}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="body" style={mono ? styles.mono : undefined}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  field: { marginBottom: theme.spacing.md },
  mono: { fontFamily: 'SpaceMono', fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: { flex: 1 },
  itemTitle: { fontSize: 16 },
});
