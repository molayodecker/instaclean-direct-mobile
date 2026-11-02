import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { QueryState } from '@/components/ui/QueryState';
import { useAdminServiceAreas } from '@/hooks/useMithrilAdmin';
import { theme } from '@/constants/theme';

export default function ServiceAreasScreen() {
  const { data, isLoading, error } = useAdminServiceAreas();
  const [query, setQuery] = useState('');
  const areas = data?.areas ?? [];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return areas;
    return areas.filter((a) => a.name.toLowerCase().includes(q));
  }, [areas, query]);

  return (
    <Screen>
      <ScreenHeader title="Service areas" showBack />
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={theme.colors.textDim} />
        <TextInput
          placeholder="Search areas"
          placeholderTextColor={theme.colors.textDim}
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />
      </View>
      <View style={styles.map}>
        <AppText variant="caption">
          {areas.filter((a) => a.active).length} live zones · {areas.reduce((n, a) => n + a.cleanerCount, 0)} workers
        </AppText>
      </View>
      <QueryState loading={isLoading} error={error} />
      {visible.map((a) => (
        <View key={a.id} style={styles.row}>
          <View style={styles.iconBox}>
            <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.main}>
            <AppText variant="subtitle">{a.name}</AppText>
            <AppText variant="caption">
              {a.country} · {a.cleanerCount} workers
            </AppText>
          </View>
          <StatusBadge
            label={a.active ? 'Live' : 'Off'}
            tone={a.active ? 'success' : 'muted'}
          />
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  searchInput: { flex: 1, color: theme.colors.text, paddingVertical: 12, fontSize: 16 },
  map: {
    height: 72,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.card,
    justifyContent: 'flex-end',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: { flex: 1 },
});
