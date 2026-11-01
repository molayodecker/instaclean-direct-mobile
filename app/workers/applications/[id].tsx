import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { Button } from '@/components/ui/Button';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AppText } from '@/components/ui/Typography';
import { useAdminCleanerApplication, useApproveCleanerApplication } from '@/hooks/useMithrilOps';
import { theme } from '@/constants/theme';

export default function CleanerApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const applicationId = id ?? '';
  const { data, isLoading, error, refetch } = useAdminCleanerApplication(applicationId);
  const approve = useApproveCleanerApplication(applicationId);

  return (
    <Screen>
      <ScreenHeader title="Application" showBack />
      <AdminOnly>
        <QueryState loading={isLoading} error={error} empty={!isLoading && !data} emptyMessage="Application not found." />
        {data && (
          <>
            <View style={styles.card}>
              <View style={styles.top}>
                <AppText variant="subtitle">{data.name}</AppText>
                <StatusBadge label={data.status} tone="warning" />
              </View>
              <AppText variant="caption">KYC {data.kycStatus}</AppText>
              <AppText variant="caption">{data.phone ?? data.email ?? '—'}</AppText>
              <AppText variant="body">{data.bio ?? data.applicantBio ?? 'No bio on file.'}</AppText>
            </View>

            {data.status === 'pending' && (
              <Button
                label={approve.isPending ? 'Approving…' : 'Approve application'}
                onPress={() =>
                  approve.mutate(undefined, {
                    onSuccess: () => {
                      refetch();
                      router.back();
                    },
                  })
                }
              />
            )}
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
});
