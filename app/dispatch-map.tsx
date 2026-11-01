import { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { AdminOnly } from '@/components/AdminOnly';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader, ScreenHeaderActions } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { QueryState } from '@/components/ui/QueryState';
import { useAdminDispatchMap } from '@/hooks/useMithrilAdmin';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { theme } from '@/constants/theme';

const ACCRA = { latitude: 5.6037, longitude: -0.187 };

export default function DispatchMapScreen() {
  const { isTablet, height, horizontalPadding } = useResponsiveLayout();
  const { data, isLoading, error, refetch, isRefetching } = useAdminDispatchMap(7);

  const markers = useMemo(() => {
    const cleaners = (data?.cleaners ?? [])
      .filter((c) => c.latitude != null && c.longitude != null)
      .map((c) => ({
        id: `c-${c.userId}`,
        title: c.displayName,
        description: `${c.status} · ${c.verified ? 'verified' : 'unverified'}`,
        coordinate: { latitude: c.latitude!, longitude: c.longitude! },
        pinColor: theme.colors.primary,
      }));
    const bookings = (data?.customerBookings ?? []).map((b) => ({
      id: `b-${b.bookingId}`,
      title: b.customerName,
      description: `${b.serviceName} · ${b.status}`,
      coordinate: { latitude: b.latitude, longitude: b.longitude },
      pinColor: theme.colors.accent,
    }));
    return [...cleaners, ...bookings];
  }, [data]);

  const region = useMemo(() => {
    if (markers.length === 0) {
      return { ...ACCRA, latitudeDelta: 0.25, longitudeDelta: 0.25 };
    }
    const lats = markers.map((m) => m.coordinate.latitude);
    const lngs = markers.map((m) => m.coordinate.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(0.08, (maxLat - minLat) * 1.4 || 0.15),
      longitudeDelta: Math.max(0.08, (maxLng - minLng) * 1.4 || 0.15),
    };
  }, [markers]);

  return (
    <Screen scroll={false} padded={false}>
      <View style={[styles.padded, { paddingHorizontal: horizontalPadding }]}>
        <ScreenHeader
          title="Dispatch map"
          showBack
          right={<ScreenHeaderActions icon="refresh" onPress={() => refetch()} />}
        />
        <AppText variant="caption" style={styles.meta}>
          {data?.cleaners.length ?? 0} workers · {data?.customerBookings.length ?? 0} bookings (Mithril)
        </AppText>
      </View>
      <AdminOnly>
        <QueryState loading={isLoading || isRefetching} error={error} />
        <View style={[styles.mapWrap, isTablet && { flex: 1, height: undefined, minHeight: Math.min(height * 0.42, 560) }]}>
          <MapView style={styles.map} initialRegion={region} showsUserLocation={Platform.OS !== 'web'}>
            {markers.map((m) => (
              <Marker
                key={m.id}
                coordinate={m.coordinate}
                title={m.title}
                description={m.description}
                pinColor={m.pinColor}
              />
            ))}
          </MapView>
        </View>
        <View style={[styles.padded, { paddingHorizontal: horizontalPadding }]}>
          {(data?.customerBookings ?? []).slice(0, 8).map((b) => (
            <View key={b.bookingId} style={styles.row}>
              <AppText variant="subtitle">{b.customerName}</AppText>
              <AppText variant="caption">{b.serviceName} · {b.address}</AppText>
            </View>
          ))}
        </View>
      </AdminOnly>
    </Screen>
  );
}

const styles = StyleSheet.create({
  padded: { paddingHorizontal: theme.spacing.lg },
  meta: { marginBottom: theme.spacing.md },
  mapWrap: {
    height: 320,
    marginBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderMuted,
  },
  map: { flex: 1 },
  row: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
  },
});
