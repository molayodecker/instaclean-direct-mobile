import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

type ContentColumnProps = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** Override max width (defaults to responsive content column). */
  maxWidth?: number;
  padded?: boolean;
  flex?: boolean;
};

export function ContentColumn({
  children,
  style,
  maxWidth: maxWidthProp,
  padded = true,
  flex = false,
}: ContentColumnProps) {
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  const maxWidth = maxWidthProp ?? contentMaxWidth;

  return (
    <View
      style={[styles.base, flex && styles.flex, { maxWidth, paddingHorizontal: padded ? horizontalPadding : 0 }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    alignSelf: 'center',
  },
  flex: {
    flex: 1,
  },
});
