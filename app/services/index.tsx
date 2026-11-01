import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { Chip } from '@/components/ui/Chip';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { QueryState } from '@/components/ui/QueryState';
import { useAdminServices } from '@/hooks/useMithrilAdmin';
import type { AdminService } from '@/lib/mithril';
import { theme } from '@/constants/theme';

export default function ServicesScreen() {
  const router = useRouter();
  const { data, isLoading, error } = useAdminServices();
  const services = data?.services ?? [];

  const categories = useMemo(() => {
    const map = new Map<string, AdminService[]>();
    for (const s of services) {
      const key = s.categoryName ?? 'Other';
      const list = map.get(key) ?? [];
      list.push(s);
      map.set(key, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [services]);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0][0]);
    }
  }, [categories, activeCategory]);

  const visible = useMemo(() => {
    if (!activeCategory) return services;
    return categories.find(([name]) => name === activeCategory)?.[1] ?? services;
  }, [activeCategory, categories, services]);

  return (
    <Screen>
      <ScreenHeader title="Services & pricing" showBack />
      <QueryState loading={isLoading} error={error} />
      {categories.length > 1 && (
        <View style={styles.chips}>
          {categories.map(([name, items]) => (
            <Chip
              key={name}
              label={`${name} ${items.length}`}
              active={activeCategory === name}
              onPress={() => setActiveCategory(name)}
            />
          ))}
        </View>
      )}
      {visible.map((s) => (
        <Pressable key={s.id} style={styles.row} onPress={() => router.push(`/services/${s.id}`)}>
          <View style={styles.iconBox}>
            <Ionicons name="sparkles-outline" size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.main}>
            <AppText variant="subtitle">{s.name}</AppText>
            <AppText variant="caption">
              GH₵ {Number(s.priceGhs).toFixed(0)}/hr · min {s.minimumDurationHours ?? 2}h
            </AppText>
          </View>
          <StatusBadge label={s.active ? 'On' : 'Off'} tone={s.active ? 'success' : 'muted'} />
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
    gap: theme.spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: { flex: 1 },
});
