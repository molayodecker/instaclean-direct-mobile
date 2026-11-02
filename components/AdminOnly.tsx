import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { AppText } from '@/components/ui/Typography';
import { theme } from '@/constants/theme';

export function AdminOnly({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user?.admin) {
    return (
      <View style={styles.box}>
        <AppText variant="subtitle">Admin access required</AppText>
        <AppText variant="caption" style={styles.caption}>
          This screen uses Mithril admin-only routes. Ask an owner to grant the admin role.
        </AppText>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  box: {
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  caption: { lineHeight: 20 },
});
