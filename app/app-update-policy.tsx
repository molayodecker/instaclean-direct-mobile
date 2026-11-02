import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { QueryState } from '@/components/ui/QueryState';
import { useAdminAppUpdatePolicies, useSaveAppUpdatePolicy } from '@/hooks/useMithrilAdmin';
import { adminAppUpdatePolicyApps, adminAppUpdatePolicyChannels, type AppUpdatePolicyApp, type AppUpdatePolicyChannel } from '@/lib/mithril';
import { theme } from '@/constants/theme';

export default function AppUpdatePolicyScreen() {
  const { data, isLoading, error, refetch } = useAdminAppUpdatePolicies();
  const save = useSaveAppUpdatePolicy();
  const [app, setApp] = useState<AppUpdatePolicyApp>('customer');
  const [channel, setChannel] = useState<AppUpdatePolicyChannel>('production');
  const [minVersion, setMinVersion] = useState('');
  const [recommendedVersion, setRecommendedVersion] = useState('');
  const [requiredMessage, setRequiredMessage] = useState('');
  const [recommendedMessage, setRecommendedMessage] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  const policy = (data?.policies ?? []).find((p) => p.app === app && p.channel === channel);

  useEffect(() => {
    if (!policy) {
      setMinVersion('');
      setRecommendedVersion('');
      setRequiredMessage('');
      setRecommendedMessage('');
      return;
    }
    setMinVersion(policy.minVersion);
    setRecommendedVersion(policy.recommendedVersion ?? '');
    setRequiredMessage(policy.requiredMessage);
    setRecommendedMessage(policy.recommendedMessage ?? '');
  }, [policy, app, channel]);

  const onSave = async () => {
    setSaveError(null);
    try {
      await save.mutateAsync({
        app,
        channel,
        minVersion: minVersion.trim(),
        recommendedVersion: recommendedVersion.trim() || null,
        requiredMessage: requiredMessage.trim(),
        recommendedMessage: recommendedMessage.trim() || null,
      });
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not save policy.');
    }
  };

  return (
    <Screen>
      <ScreenHeader title="App update policy" subtitle="Settings" showBack />
      <AdminOnly>
        <View style={styles.chips}>
          {adminAppUpdatePolicyApps.map((value) => (
            <Chip
              key={value}
              label={value === 'customer' ? 'Customer' : 'Worker'}
              active={app === value}
              onPress={() => setApp(value)}
            />
          ))}
        </View>
        <View style={styles.chips}>
          {adminAppUpdatePolicyChannels.map((value) => (
            <Chip
              key={value}
              label={value === 'production' ? 'Production' : 'Preview'}
              active={channel === value}
              onPress={() => setChannel(value)}
            />
          ))}
        </View>
        <QueryState loading={isLoading} error={error} />
        {!policy && !isLoading && (
          <AppText variant="caption" style={styles.empty}>
            No policy for {app} · {channel}. Enter values below and save to create one.
          </AppText>
        )}
        {(policy || !isLoading) && (
          <View style={styles.card}>
            {policy && (
              <AppText variant="caption">Last updated {new Date(policy.updatedAt).toLocaleString()}</AppText>
            )}
            <AppText variant="label">Minimum version</AppText>
            <TextInput style={styles.input} value={minVersion} onChangeText={setMinVersion} autoCapitalize="none" />
            <AppText variant="label">Recommended</AppText>
            <TextInput style={styles.input} value={recommendedVersion} onChangeText={setRecommendedVersion} autoCapitalize="none" />
            <AppText variant="label">Required update message</AppText>
            <TextInput
              style={[styles.input, styles.multiline]}
              multiline
              value={requiredMessage}
              onChangeText={setRequiredMessage}
            />
            <AppText variant="label">Recommended update message</AppText>
            <TextInput
              style={[styles.input, styles.multiline]}
              multiline
              value={recommendedMessage}
              onChangeText={setRecommendedMessage}
            />
            <AppText variant="section">Preview</AppText>
            <View style={styles.preview}>
              <AppText variant="subtitle">Update required</AppText>
              <AppText variant="caption">{requiredMessage}</AppText>
            </View>
            {saveError && <AppText variant="caption" style={styles.error}>{saveError}</AppText>}
            <Button label={save.isPending ? 'Saving…' : 'Save policy'} onPress={onSave} />
            <Button label="Reload" variant="outline" onPress={() => refetch()} style={styles.reload} />
          </View>
        )}
      </AdminOnly>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', marginBottom: theme.spacing.md },
  empty: { marginBottom: theme.spacing.md },
  card: { gap: theme.spacing.sm },
  input: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    color: theme.colors.text,
    fontSize: 16,
  },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  preview: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  error: { color: theme.colors.danger },
  reload: { marginTop: theme.spacing.sm },
});
