import { useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { Button } from '@/components/ui/Button';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { useAdminCustomers } from '@/hooks/useMithrilAdmin';
import { useMergeAccounts } from '@/hooks/useMithrilOps';
import { theme } from '@/constants/theme';

export default function MergeAccountsScreen() {
  const [primaryQuery, setPrimaryQuery] = useState('');
  const [secondaryQuery, setSecondaryQuery] = useState('');
  const [primaryUserId, setPrimaryUserId] = useState<string | null>(null);
  const [secondaryUserId, setSecondaryUserId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const primarySearch = useAdminCustomers(primaryQuery.trim().length >= 2 ? primaryQuery : undefined);
  const secondarySearch = useAdminCustomers(secondaryQuery.trim().length >= 2 ? secondaryQuery : undefined);
  const merge = useMergeAccounts();

  const primary = (primarySearch.data?.customers ?? []).find((c) => c.userId === primaryUserId);
  const secondary = (secondarySearch.data?.customers ?? []).find((c) => c.userId === secondaryUserId);

  function onMerge() {
    if (!primaryUserId || !secondaryUserId) {
      setActionError('Select primary and secondary accounts.');
      return;
    }
    if (primaryUserId === secondaryUserId) {
      setActionError('Choose two different accounts.');
      return;
    }
    Alert.alert(
      'Merge accounts',
      'Bookings and profile data move to the primary account. This cannot be undone from the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Merge',
          style: 'destructive',
          onPress: () => {
            setActionError(null);
            merge
              .mutateAsync({ primaryUserId, secondaryUserId })
              .then(() => {
                Alert.alert('Merged', 'Accounts were merged.');
                setPrimaryUserId(null);
                setSecondaryUserId(null);
                setPrimaryQuery('');
                setSecondaryQuery('');
              })
              .catch((e) => setActionError(e instanceof Error ? e.message : 'Merge failed.'));
          },
        },
      ],
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Merge accounts" showBack />
      <AdminOnly>
        <AppText variant="body">
          Keep the primary account. The secondary account is absorbed and deactivated on the server.
        </AppText>

        <AppText variant="section">Primary (keep)</AppText>
        <TextInput
          style={styles.input}
          placeholder="Search customer"
          placeholderTextColor={theme.colors.textDim}
          value={primaryQuery}
          onChangeText={(t) => {
            setPrimaryQuery(t);
            setPrimaryUserId(null);
          }}
        />
        <QueryState loading={primarySearch.isLoading} error={primarySearch.error} />
        {(primarySearch.data?.customers ?? []).slice(0, 6).map((c) => (
          <Button
            key={c.userId}
            variant={primaryUserId === c.userId ? 'primary' : 'outline'}
            label={`${c.name}${c.phone ? ` · ${c.phone}` : ''}`}
            onPress={() => setPrimaryUserId(c.userId)}
            style={styles.stackBtn}
          />
        ))}
        {primary && <AppText variant="caption">Selected · {primary.name}</AppText>}

        <AppText variant="section">Secondary (merge in)</AppText>
        <TextInput
          style={styles.input}
          placeholder="Search customer"
          placeholderTextColor={theme.colors.textDim}
          value={secondaryQuery}
          onChangeText={(t) => {
            setSecondaryQuery(t);
            setSecondaryUserId(null);
          }}
        />
        <QueryState loading={secondarySearch.isLoading} error={secondarySearch.error} />
        {(secondarySearch.data?.customers ?? []).slice(0, 6).map((c) => (
          <Button
            key={c.userId}
            variant={secondaryUserId === c.userId ? 'primary' : 'outline'}
            label={`${c.name}${c.phone ? ` · ${c.phone}` : ''}`}
            onPress={() => setSecondaryUserId(c.userId)}
            style={styles.stackBtn}
          />
        ))}
        {secondary && <AppText variant="caption">Selected · {secondary.name}</AppText>}

        <Button
          label={merge.isPending ? 'Merging…' : 'Merge accounts'}
          onPress={merge.isPending ? undefined : onMerge}
          style={styles.submit}
        />
        {actionError && (
          <AppText variant="caption" style={styles.error}>
            {actionError}
          </AppText>
        )}
      </AdminOnly>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  stackBtn: { marginBottom: theme.spacing.sm },
  submit: { marginTop: theme.spacing.lg },
  error: { color: theme.colors.danger, marginTop: theme.spacing.md },
});
