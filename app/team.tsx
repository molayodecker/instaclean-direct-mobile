import { useMemo, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { QueryState } from '@/components/ui/QueryState';
import { useAdminTeam } from '@/hooks/useMithrilAdmin';
import { useGrantTeamRole, useRevokeTeamRole } from '@/hooks/useMithrilOps';
import { theme } from '@/constants/theme';

export default function TeamScreen() {
  const { data, isLoading, error, refetch } = useAdminTeam();
  const grant = useGrantTeamRole();
  const revoke = useRevokeTeamRole();
  const [query, setQuery] = useState('');
  const [grantEmail, setGrantEmail] = useState('');
  const [grantRole, setGrantRole] = useState<'admin' | 'reviewer'>('reviewer');
  const [actionError, setActionError] = useState<string | null>(null);
  const members = data?.members ?? [];
  const roleGuide = data?.roleGuide ?? [];

  const busy = grant.isPending || revoke.isPending;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        (m.name ?? '').toLowerCase().includes(q) ||
        (m.email ?? '').toLowerCase().includes(q) ||
        (m.roles ?? []).some((r) => r.includes(q)),
    );
  }, [members, query]);

  async function onGrant() {
    const email = grantEmail.trim().toLowerCase();
    if (!email) {
      setActionError('Enter an email to grant.');
      return;
    }
    setActionError(null);
    try {
      await grant.mutateAsync({ email, role: grantRole });
      setGrantEmail('');
      await refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Grant failed.');
    }
  }

  function onRevoke(userId: string | undefined, role: 'admin' | 'reviewer', name: string) {
    if (!userId) return;
    Alert.alert('Remove role', `Remove ${role} from ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          void revoke.mutateAsync({ userId, role }).then(() => refetch()).catch((e) =>
            setActionError(e instanceof Error ? e.message : 'Revoke failed.'),
          ),
      },
    ]);
  }

  return (
    <Screen>
      <ScreenHeader title="Team & roles" showBack />
      <AdminOnly>
        <View style={styles.search}>
          <TextInput
            placeholder="Search team"
            placeholderTextColor={theme.colors.textDim}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <QueryState loading={isLoading} error={error} />

        <AppText variant="section">Grant role</AppText>
        <TextInput
          style={styles.searchInput}
          placeholder="Email"
          placeholderTextColor={theme.colors.textDim}
          autoCapitalize="none"
          keyboardType="email-address"
          value={grantEmail}
          onChangeText={setGrantEmail}
        />
        <View style={styles.grantChips}>
          <Chip label="Reviewer" active={grantRole === 'reviewer'} onPress={() => setGrantRole('reviewer')} />
          <Chip label="Admin" active={grantRole === 'admin'} onPress={() => setGrantRole('admin')} />
        </View>
        <Button label={busy ? 'Saving…' : 'Grant role'} onPress={busy ? undefined : () => void onGrant()} />

        <AppText variant="section">Team</AppText>
        {visible.map((m) => {
          const roles = m.roles ?? [];
          return (
          <View key={m.userId} style={styles.row}>
            <View style={styles.avatar}>
              <AppText style={styles.avatarText}>{initials(m.name ?? '—')}</AppText>
            </View>
            <View style={styles.main}>
              <AppText variant="subtitle">{m.name}</AppText>
              <AppText variant="caption">{m.email ?? m.phone ?? 'Staff'}</AppText>
              <View style={styles.roleActions}>
                {roles.includes('admin') && (
                  <Button
                    label="Revoke admin"
                    variant="ghost"
                    small
                    onPress={busy ? undefined : () => onRevoke(m.userId, 'admin', m.name ?? 'member')}
                  />
                )}
                {roles.includes('reviewer') && (
                  <Button
                    label="Revoke reviewer"
                    variant="ghost"
                    small
                    onPress={busy ? undefined : () => onRevoke(m.userId, 'reviewer', m.name ?? 'member')}
                  />
                )}
              </View>
            </View>
            <StatusBadge
              label={roleLabel(roles)}
              tone={roles.includes('admin') ? 'warning' : 'info'}
            />
          </View>
        );
        })}
        {actionError && <AppText variant="caption" style={styles.actionError}>{actionError}</AppText>}
        <AppText variant="section">Roles</AppText>
        <View style={styles.rolesCard}>
          {roleGuide.map((entry) => (
            <View key={entry.role} style={styles.roleRow}>
              <AppText variant="caption" style={styles.roleName}>{entry.label}</AppText>
              <AppText variant="body" style={styles.roleAccess}>{entry.access}</AppText>
            </View>
          ))}
        </View>
      </AdminOnly>
    </Screen>
  );
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '?'
  );
}

function roleLabel(roles: string[]) {
  if (roles.includes('admin')) return 'Admin';
  if (roles.includes('reviewer')) return 'Reviewer';
  return roles[0] ?? 'Staff';
}

const styles = StyleSheet.create({
  search: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  grantChips: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  roleActions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: theme.spacing.xs },
  actionError: { color: theme.colors.danger, marginVertical: theme.spacing.md },
  searchInput: { color: theme.colors.text, paddingVertical: 12, fontSize: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  main: { flex: 1 },
  rolesCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.md,
  },
  roleRow: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
    gap: theme.spacing.md,
  },
  roleName: { width: 110 },
  roleAccess: { flex: 1, fontSize: 14 },
});
