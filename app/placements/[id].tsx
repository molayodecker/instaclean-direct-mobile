import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { Button } from '@/components/ui/Button';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AppText } from '@/components/ui/Typography';
import { useAdminPlacements } from '@/hooks/useMithrilAdmin';
import { useAdminCandidates, useMatchPlacement } from '@/hooks/useMithrilOps';
import { theme } from '@/constants/theme';
import type { AdminCandidate } from '@/lib/mithril';

export default function PlacementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const placementId = id ?? '';
  const list = useAdminPlacements();
  const candidates = useAdminCandidates();
  const match = useMatchPlacement(placementId);
  const [actionError, setActionError] = useState<string | null>(null);

  const placement = useMemo(
    () => (list.data?.placements ?? []).find((p) => p.id === placementId),
    [list.data, placementId],
  );

  const choices = useMemo(() => {
    const rows = candidates.data?.candidates ?? [];
    if (!placement?.role) return rows;
    return rows.filter((c: AdminCandidate) => c.desiredRoles.includes(placement.role));
  }, [candidates.data, placement?.role]);

  async function onMatch(candidateUserId: string) {
    setActionError(null);
    try {
      await match.mutateAsync({
        candidateUserId,
        consentConfirmed: true,
        customerVisibleNote: null,
      });
      await list.refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not match candidate.');
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Placement" showBack />
      <AdminOnly>
        <QueryState
          loading={list.isLoading}
          error={list.error}
          empty={!list.isLoading && !placement}
          emptyMessage="Placement not found."
        />
        {placement && (
          <>
            <View style={styles.card}>
              <View style={styles.top}>
                <AppText variant="subtitle">{placement.customerName}</AppText>
                <StatusBadge label={placement.status} tone={placement.status === 'placed' ? 'success' : 'info'} />
              </View>
              <AppText variant="body">{placement.role.replace(/_/g, ' ')}</AppText>
              <AppText variant="caption">{placement.householdAddress}</AppText>
              <AppText variant="caption">
                Shortlist {placement.shortlistCount}
                {placement.desiredStartDate ? ` · start ${placement.desiredStartDate}` : ''}
              </AppText>
            </View>

            <AppText variant="section">Match candidate</AppText>
            <QueryState loading={candidates.isLoading} error={candidates.error} />
            {choices.map((c) => (
              <Pressable
                key={c.userId}
                style={styles.row}
                disabled={match.isPending}
                onPress={() => void onMatch(c.userId)}>
                <AppText variant="subtitle">{c.name}</AppText>
                <AppText variant="caption">
                  {c.placementStatus} · {c.rating != null ? `${c.rating.toFixed(1)}★` : '—'}
                </AppText>
              </Pressable>
            ))}

            {actionError && <AppText variant="caption" style={styles.error}>{actionError}</AppText>}
            <Button label="Refresh" variant="outline" onPress={() => list.refetch()} />
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
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  error: { color: theme.colors.danger, marginBottom: theme.spacing.sm },
});
