import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader, ScreenHeaderActions } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { QueryState } from '@/components/ui/QueryState';
import {
  useAdminCleanerApplications,
  useAdminWorkerApplicationDrafts,
  useAdminWorkers,
} from '@/hooks/useMithrilAdmin';
import { theme } from '@/constants/theme';

type Tab = 'roster' | 'applications' | 'drafts';

export default function WorkersScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('roster');
  const [search, setSearch] = useState('');
  const workers = useAdminWorkers(search.trim() || undefined);
  const applications = useAdminCleanerApplications();
  const drafts = useAdminWorkerApplicationDrafts();

  const loading =
    tab === 'roster' ? workers.isLoading : tab === 'applications' ? applications.isLoading : drafts.isLoading;
  const error = tab === 'roster' ? workers.error : tab === 'applications' ? applications.error : drafts.error;

  const refetch = () => {
    if (tab === 'roster') workers.refetch();
    else if (tab === 'applications') applications.refetch();
    else drafts.refetch();
  };

  return (
    <Screen>
      <ScreenHeader title="Workers" showBack right={<ScreenHeaderActions icon="refresh" onPress={refetch} />} />
      <AdminOnly>
        <View style={styles.chips}>
          <Chip label="Roster" active={tab === 'roster'} onPress={() => setTab('roster')} />
          <Chip
            label={`Applications ${applications.data?.applications.length ?? 0}`}
            active={tab === 'applications'}
            onPress={() => setTab('applications')}
          />
          <Chip
            label={`Drafts ${drafts.data?.drafts.length ?? 0}`}
            active={tab === 'drafts'}
            onPress={() => setTab('drafts')}
          />
        </View>
        {tab === 'roster' && (
          <TextInput
            style={styles.search}
            placeholder="Search workers"
            placeholderTextColor={theme.colors.textDim}
            value={search}
            onChangeText={setSearch}
          />
        )}
        <QueryState loading={loading} error={error} />
        {tab === 'roster' &&
          (workers.data?.cleaners ?? []).map((w) => (
            <Pressable key={w.userId} style={styles.row} onPress={() => router.push(`/workers/${w.userId}`)}>
              <View style={styles.avatar}>
                <AppText style={styles.avatarText}>{initials(w.name)}</AppText>
              </View>
              <View style={styles.main}>
                <AppText variant="subtitle">{w.name}</AppText>
                <AppText variant="caption">
                  {w.phone ?? w.email ?? '—'} · {w.completedJobs ?? 0} jobs
                  {w.rating != null ? ` · ${w.rating.toFixed(1)}★` : ''}
                </AppText>
              </View>
              <StatusBadge label={w.verified ? 'Verified' : w.status} tone={w.verified ? 'success' : 'muted'} />
            </Pressable>
          ))}
        {tab === 'applications' &&
          (applications.data?.applications ?? []).map((a) => (
            <Pressable
              key={a.id}
              style={styles.row}
              onPress={() => router.push(`/workers/applications/${a.id}`)}>
              <View style={styles.main}>
                <AppText variant="subtitle">{a.name}</AppText>
                <AppText variant="caption">{a.kycStatus} · {a.status}</AppText>
              </View>
              <StatusBadge label="Pending" tone="warning" />
            </Pressable>
          ))}
        {tab === 'drafts' &&
          (drafts.data?.drafts ?? []).map((d) => (
            <Pressable key={d.id} style={styles.row} onPress={() => router.push(`/workers/drafts/${d.id}`)}>
              <View style={styles.main}>
                <AppText variant="subtitle">{d.name}</AppText>
                <AppText variant="caption">
                  Step {d.currentStep}
                  {d.phone ? ` · ${d.phone}` : ''}
                </AppText>
              </View>
              <StatusBadge label="Draft" tone="muted" />
            </Pressable>
          ))}
      </AdminOnly>
    </Screen>
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  search: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
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
});
