import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader, ScreenHeaderActions } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { QueryState } from '@/components/ui/QueryState';
import {
  useAdminBookings,
  useAdminServiceRequests,
  useAdminWhatsAppThreads,
} from '@/hooks/useMithrilAdmin';
import { formatBookingWhen, relativeTime } from '@/lib/mithril';
import { theme } from '@/constants/theme';

type InboxCard = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  action: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export default function InboxScreen() {
  const router = useRouter();
  const bookingsQuery = useAdminBookings();
  const requestsQuery = useAdminServiceRequests();
  const whatsappQuery = useAdminWhatsAppThreads();

  const loading = bookingsQuery.isLoading || requestsQuery.isLoading || whatsappQuery.isLoading;
  const error = bookingsQuery.error ?? requestsQuery.error ?? whatsappQuery.error;

  const items = useMemo(() => {
    const cards: InboxCard[] = [];
    const bookings = bookingsQuery.data?.bookings ?? [];
    bookings
      .filter((b) => !b.cleanerName)
      .slice(0, 5)
      .forEach((b) => {
        cards.push({
          id: `booking-${b.id}`,
          title: `${b.serviceName} · ${b.customerName}`,
          subtitle: `${formatBookingWhen(b.scheduledDate, b.scheduledTime)} · no worker yet`,
          time: 'now',
          action: 'Assign worker',
          icon: 'radio-button-on',
        });
      });

    const requests = requestsQuery.data?.requests ?? [];
    requests.slice(0, 5).forEach((r) => {
      cards.push({
        id: `request-${r.id}`,
        title: `${r.kind === 'urgent_help' ? 'Urgent househelp' : 'Replacement'} · ${r.customerName}`,
        subtitle: `${r.householdAddress} · ${r.status}`,
        time: relativeTime(r.createdAt),
        action: r.assignedWorkerName ? 'View request' : 'Match helper',
        icon: 'flash',
      });
    });

    const threads = whatsappQuery.data?.threads ?? [];
    threads.slice(0, 5).forEach((t) => {
      cards.push({
        id: `wa-${t.phoneE164}`,
        title: t.displayLabel || t.phoneE164,
        subtitle: t.preview,
        time: relativeTime(t.lastAt),
        action: 'Reply',
        icon: 'logo-whatsapp',
      });
    });

    return cards;
  }, [bookingsQuery.data, requestsQuery.data, whatsappQuery.data]);

  const refetchAll = () => {
    bookingsQuery.refetch();
    requestsQuery.refetch();
    whatsappQuery.refetch();
  };

  function openItem(item: InboxCard) {
    if (item.id.startsWith('booking-')) {
      router.push(`/bookings/${item.id.replace('booking-', '')}`);
      return;
    }
    if (item.id.startsWith('request-')) {
      router.push(`/service-requests/${item.id.replace('request-', '')}`);
      return;
    }
    if (item.id.startsWith('wa-')) {
      const phone = encodeURIComponent(item.id.replace('wa-', ''));
      router.push(`/whatsapp/${phone}`);
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Inbox" right={<ScreenHeaderActions icon="refresh" onPress={refetchAll} />} />
      <QueryState loading={loading} error={error} empty={items.length === 0} emptyMessage="Inbox is clear." />
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.iconBox}>
              <Ionicons name={item.icon} size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.cardMain}>
              <AppText variant="subtitle" style={styles.cardTitle}>{item.title}</AppText>
              <AppText variant="caption">{item.subtitle}</AppText>
            </View>
            <AppText variant="caption">{item.time}</AppText>
          </View>
          <View style={styles.actions}>
            <Button
              label={item.action}
              variant="ghost"
              small
              style={styles.primaryAction}
              onPress={() => openItem(item)}
            />
            <Button label="Later" variant="outline" small />
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMain: { flex: 1 },
  cardTitle: { fontSize: 15 },
  actions: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md },
  primaryAction: { flex: 1 },
});
