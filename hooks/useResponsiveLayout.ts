import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { layout } from '@/constants/layout';
import { theme } from '@/constants/theme';

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const isTablet = width >= layout.tabletMinWidth;
    const isLargeTablet = width >= layout.largeTabletMinWidth;
    const isLandscape = width > height;
    const contentMaxWidth = isLargeTablet
      ? layout.wideContentMaxWidth
      : isTablet
        ? layout.contentMaxWidth
        : width;

    const horizontalPadding = isLargeTablet
      ? theme.spacing.xxl
      : isTablet
        ? theme.spacing.xl
        : theme.spacing.lg;

    const gridColumns = isLargeTablet ? 6 : isTablet ? 4 : 3;

    function columnWidth(maxWidth: number, gap: number, columns: number) {
      const outer = Math.min(width, maxWidth);
      const inner = outer - horizontalPadding * 2;
      if (columns <= 1) return inner;
      return (inner - gap * (columns - 1)) / columns;
    }

    function gridTileWidth(gap = theme.spacing.sm, columns = gridColumns) {
      return columnWidth(contentMaxWidth, gap, columns);
    }

    return {
      width,
      height,
      isTablet,
      isLargeTablet,
      isLandscape,
      contentMaxWidth,
      formMaxWidth: layout.formMaxWidth,
      chatMaxWidth: layout.chatMaxWidth,
      horizontalPadding,
      gridColumns,
      gridTileWidth,
      columnWidth,
    };
  }, [width, height]);
}
