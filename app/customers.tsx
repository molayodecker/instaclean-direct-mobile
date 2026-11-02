import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader, ScreenHeaderActions } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { QueryState } from '@/components/ui/QueryState';
import { useAdminCustomers } from '@/hooks/useMithrilAdmin';
import { theme } from '@/constants/theme';

export default function CustomersScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useAdminCustomers(search.trim() || undefined);
  const customers = data?.customers ?? [];

  return (
    <Screen>
      <ScreenHeader
        title="Customers"
        showBack
        right={<ScreenHeaderActions icon="shuffle" onPress={() => router.push('/users/merge')} />}
      />
      <View style={styles.search}>
        <TextInput
          placeholder="Search name, email, or phone"
          placeholderTextColor={theme.colors.textDim}
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>
      <QueryState loading={isLoading} error={error} empty={!isLoading && customers.length === 0} emptyMessage="No customers found." />
      {customers.map((c) => (
        <View key={c.userId} style={styles.row}>
          <View style={styles.main}>
            <AppText variant="subtitle">{c.name}</AppText>
            <AppText variant="caption">{[c.phone, c.email].filter(Boolean).join(' · ')}</AppText>
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  searchInput: { color: theme.colors.text, paddingVertical: 12, fontSize: 16 },
  row: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
  },
  main: { flex: 1 },
});
