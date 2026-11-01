import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { Chip } from '@/components/ui/Chip';
import { QueryState } from '@/components/ui/QueryState';
import { useAdminReviews } from '@/hooks/useMithrilAdmin';
import type { AdminReviewFilter } from '@/lib/mithril';
import { theme } from '@/constants/theme';

export default function ReviewsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<AdminReviewFilter>('all');
  const { data, isLoading, error } = useAdminReviews(filter);
  const stats = data?.stats;
  const reviews = data?.reviews ?? [];

  return (
    <Screen>
      <ScreenHeader title="Reviews" showBack />
      <QueryState loading={isLoading} error={error} />
      {stats && (
        <View style={styles.stats}>
          <Stat value={String(stats.averageRating)} label="Average" />
          <Stat value={String(stats.thisMonthCount)} label="This month" />
          <Stat value={String(stats.lowRatingCount)} label="1–2 ★" danger />
        </View>
      )}
      <View style={styles.chips}>
        <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip
          label={`1–2 ★ ${stats?.lowRatingCount ?? 0}`}
          active={filter === 'low'}
          onPress={() => setFilter('low')}
        />
        <Chip
          label={`Needs reply ${stats?.needsReplyCount ?? 0}`}
          active={filter === 'needs_reply'}
          onPress={() => setFilter('needs_reply')}
        />
        <Chip label="Hidden" active={filter === 'hidden'} onPress={() => setFilter('hidden')} />
      </View>
      {reviews.map((r) => {
        const rating = r.rating ?? 0;
        const color =
          rating <= 2 ? theme.colors.danger : rating >= 4 ? theme.colors.success : theme.colors.accent;
        return (
          <View key={r.id} style={styles.card}>
            <View style={styles.cardTop}>
              <AppText variant="caption">
                {r.reviewerName} → {r.revieweeName}
              </AppText>
              <AppText style={{ color, fontWeight: '700' }}>{rating} ★</AppText>
            </View>
            {r.serviceName && <AppText variant="caption">{r.serviceName}</AppText>}
            <AppText variant="body" style={styles.quote}>{r.comment ?? 'No comment'}</AppText>
            {r.bookingId && (
              <Pressable onPress={() => router.push(`/(tabs)/bookings`)}>
                <AppText style={styles.link}>Open bookings</AppText>
              </Pressable>
            )}
          </View>
        );
      })}
    </Screen>
  );
}

function Stat({ value, label, danger }: { value: string; label: string; danger?: boolean }) {
  return (
    <View style={styles.stat}>
      <AppText style={[styles.statValue, danger && { color: theme.colors.danger }]}>{value}</AppText>
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  stat: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '700', color: theme.colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.md, gap: theme.spacing.sm },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
  quote: { marginBottom: theme.spacing.md },
  link: { color: theme.colors.primary, fontSize: 14, fontWeight: '600' },
});
