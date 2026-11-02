import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { useAdminWorkerApplicationDraft } from '@/hooks/useMithrilAdmin';
import { theme } from '@/constants/theme';

export default function WorkerApplicationDraftScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const draftId = id ?? '';
  const { data, isLoading, error } = useAdminWorkerApplicationDraft(draftId);

  return (
    <Screen>
      <ScreenHeader title="Application draft" showBack />
      <AdminOnly>
        <QueryState loading={isLoading} error={error} empty={!isLoading && !data} emptyMessage="Draft not found." />
        {data && (
          <View style={styles.card}>
            <AppText variant="subtitle">{data.name}</AppText>
            <AppText variant="caption">Step {data.currentStep} of onboarding</AppText>
            <Field label="Email" value={data.email} />
            <Field label="Phone" value={data.phone} />
            <Field label="City" value={data.city} />
            <Field label="Hours / week" value={data.hoursPerWeek} />
            <Field label="Bio" value={data.bio} />
            <AppText variant="section">Skills</AppText>
            <AppText variant="body">{(data.skills ?? []).join(', ') || '—'}</AppText>
            <AppText variant="section">Work areas</AppText>
            <AppText variant="body">{(data.workAreas ?? []).join(', ') || '—'}</AppText>
          </View>
        )}
      </AdminOnly>
    </Screen>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.field}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="body">{value || '—'}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  field: { gap: 4, marginTop: theme.spacing.sm },
});
