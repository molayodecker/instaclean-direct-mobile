import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { QueryState } from '@/components/ui/QueryState';
import { useAdminPlacements } from '@/hooks/useMithrilAdmin';
import { theme } from '@/constants/theme';

export default function PlacementsScreen() {
  const router = useRouter();
  const { data, isLoading, error } = useAdminPlacements();
  const placements = data?.placements ?? [];

  return (
    <Screen>
      <ScreenHeader title="Placements" showBack />
      <QueryState loading={isLoading} error={error} />
      {placements.map((p) => (
        <Pressable key={p.id} style={styles.card} onPress={() => router.push(`/placements/${p.id}`)}>
          <View style={styles.cardTop}>
            <AppText variant="subtitle">{p.customerName}</AppText>
            <StatusBadge label={p.status} tone={p.status === 'placed' ? 'success' : 'info'} />
          </View>
          <AppText variant="body">{p.role.replace(/_/g, ' ')}</AppText>
          <AppText variant="caption" style={styles.meta}>
            {p.householdAddress}
          </AppText>
          <AppText variant="caption">
            Shortlist {p.shortlistCount}
            {p.desiredStartDate ? ` · start ${p.desiredStartDate}` : ''}
          </AppText>
        </Pressable>
      ))}
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
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
  meta: { marginVertical: theme.spacing.sm },
});
