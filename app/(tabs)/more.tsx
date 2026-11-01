import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader, ScreenHeaderActions } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { useAuth } from '@/context/AuthContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { moreSections } from '@/constants/moreMenu';
import { theme } from '@/constants/theme';

export default function MoreScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { gridTileWidth, isTablet } = useResponsiveLayout();
  const tileWidth = gridTileWidth();

  return (
    <Screen>
      <ScreenHeader title="More" right={<ScreenHeaderActions icon="search" />} />

      <Pressable style={styles.profile} onPress={() => router.push('/settings')}>
        <View style={styles.avatar}>
          <AppText style={styles.avatarText}>{profileInitials(user?.name ?? user?.email)}</AppText>
        </View>
        <View style={styles.profileText}>
          <AppText variant="subtitle">{user?.name ?? user?.email ?? 'Team member'}</AppText>
          <AppText variant="caption">
            {[user?.admin ? 'Admin' : null, user?.reviewer ? 'Reviewer' : null].filter(Boolean).join(' · ') || 'Staff'}
            {user?.email ? ` · ${user.email}` : ''}
          </AppText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textDim} />
      </Pressable>

      {moreSections.map((section) => (
        <View key={section.title}>
          <AppText variant="section">{section.title}</AppText>
          <View style={styles.grid}>
            {section.items.map((item) => (
              <Pressable
                key={item.label}
                style={[styles.tile, { width: tileWidth, minHeight: isTablet ? 96 : undefined }]}
                onPress={() => item.href && router.push(item.href)}>
                <View style={styles.tileIcon}>
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={theme.colors.primary}
                  />
                </View>
                <AppText variant="caption" style={styles.tileLabel}>{item.label}</AppText>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </Screen>
  );
}

function profileInitials(label?: string | null) {
  if (!label) return '?';
  const parts = label.includes('@') ? [label.split('@')[0]] : label.split(/\s+/);
  return (
    parts
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '?'
  );
}

const styles = StyleSheet.create({
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: theme.colors.text, fontWeight: '700', fontSize: 16 },
  profileText: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  tile: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.md,
    alignItems: 'flex-start',
  },
  tileIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  tileLabel: { fontSize: 12, lineHeight: 16 },
});
