import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { AppText } from '@/components/ui/Typography';
import { theme } from '@/constants/theme';

export function AdminOnly({
  children,
  allowReviewers = false,
}: {
  children: ReactNode;
  allowReviewers?: boolean;
}) {
  const { user } = useAuth();
  const allowed = allowReviewers ? Boolean(user?.admin || user?.reviewer) : Boolean(user?.admin);

  if (!allowed) {
    return (
      <View style={styles.box}>
        <AppText variant="subtitle">{allowReviewers ? 'Staff access required' : 'Admin access required'}</AppText>
        <AppText variant="caption" style={styles.caption}>
          {allowReviewers
            ? 'This screen is for admins and reviewers.'
            : 'This screen uses Mithril admin-only routes. Ask an owner to grant the admin role.'}
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
