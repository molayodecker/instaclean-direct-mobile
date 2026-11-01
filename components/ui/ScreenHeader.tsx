import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from './Typography';
import { IconButton } from './IconButton';
import { theme } from '@/constants/theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
};

export function ScreenHeader({ title, subtitle, showBack, right }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {showBack && (
          <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </Pressable>
        )}
        <View>
          {subtitle && <AppText variant="caption">{subtitle}</AppText>}
          <AppText variant="title" style={styles.title}>{title}</AppText>
        </View>
      </View>
      {right}
    </View>
  );
}

export function ScreenHeaderActions({ icon, onPress }: { icon: keyof typeof Ionicons.glyphMap; onPress?: () => void }) {
  return <IconButton name={icon} onPress={onPress} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: theme.spacing.sm,
  },
  back: {
    marginTop: 6,
    marginRight: 4,
  },
  title: {
    fontSize: 26,
  },
});
