import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ContentColumn } from '@/components/ui/ContentColumn';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { theme } from '@/constants/theme';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  /** Narrower column (e.g. forms). Uses responsive form max width. */
  form?: boolean;
  /** Wider chat-style column. */
  chat?: boolean;
};

export function Screen({
  children,
  scroll = true,
  padded = true,
  style,
  form = false,
  chat = false,
}: ScreenProps) {
  const { contentMaxWidth, formMaxWidth, chatMaxWidth } = useResponsiveLayout();
  const maxWidth = form ? formMaxWidth : chat ? chatMaxWidth : contentMaxWidth;

  const inner = (
    <ContentColumn maxWidth={maxWidth} padded={padded} flex={!scroll} style={!scroll ? styles.flexColumn : style}>
      {children}
    </ContentColumn>
  );

  if (scroll) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, styles.flexColumn]} edges={['top', 'left', 'right']}>
      {inner}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flexColumn: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xxl,
  },
});
