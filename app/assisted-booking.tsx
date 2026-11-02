import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { QueryState } from '@/components/ui/QueryState';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { useAdminCustomers, useAdminServices } from '@/hooks/useMithrilAdmin';
import { useBookingCleaners, useCreateAssistedBooking } from '@/hooks/useMithrilOps';
import type { AdminAssistedBookingRequest } from '@/lib/mithril';
import { theme } from '@/constants/theme';

function newIdempotencyKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export default function AssistedBookingScreen() {
  const router = useRouter();
  const create = useCreateAssistedBooking();

  const [customerQuery, setCustomerQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const customersQuery = useAdminCustomers(customerQuery.trim().length >= 2 ? customerQuery : undefined);

  const servicesQuery = useAdminServices();
  const services = servicesQuery.data?.services ?? [];
  const [serviceId, setServiceId] = useState<number | null>(null);
  const cleanersQuery = useBookingCleaners(serviceId);
  const cleaners = cleanersQuery.data?.cleaners ?? [];

  const [cleanerId, setCleanerId] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [durationHours, setDurationHours] = useState('2');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [sendNotifications, setSendNotifications] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const idempotencyKey = useRef(newIdempotencyKey());

  useEffect(() => {
    idempotencyKey.current = newIdempotencyKey();
  }, [selectedCustomerId, serviceId, cleanerId, address, scheduledDate, scheduledTime,
    durationHours, specialInstructions, adminNote, consentConfirmed, sendNotifications]);

  const selectedCustomer = useMemo(
    () => (customersQuery.data?.customers ?? []).find((c) => c.userId === selectedCustomerId),
    [customersQuery.data, selectedCustomerId],
  );

  useEffect(() => {
    setCleanerId(null);
  }, [serviceId]);

  const busy = create.isPending;

  async function onSubmit() {
    if (!selectedCustomerId || !serviceId || !cleanerId) {
      setActionError('Choose customer, service, and worker.');
      return;
    }
    const addr = address.trim();
    const date = scheduledDate.trim();
    if (!addr || !date) {
      setActionError('Address and date are required.');
      return;
    }
    if (!consentConfirmed) {
      setActionError('Confirm customer consent before creating the booking.');
      return;
    }
    const hours = Number(durationHours);
    if (!Number.isFinite(hours) || hours <= 0) {
      setActionError('Enter valid duration hours.');
      return;
    }

    const body: AdminAssistedBookingRequest = {
      customerUserId: selectedCustomerId,
      serviceId,
      cleanerId,
      address: addr,
      scheduledDate: date,
      scheduledTime: scheduledTime.trim() || '09:00',
      durationHours: hours,
      timezone: 'Africa/Accra',
      scheduleKind: 'once',
      recurrenceInterval: null,
      occurrenceCount: null,
      customDates: null,
      source: 'admin',
      consentConfirmed: true,
      sendNotifications,
      specialInstructions: specialInstructions.trim() || null,
      adminNote: adminNote.trim() || null,
      idempotencyKey: idempotencyKey.current,
    };

    setActionError(null);
    try {
      const result = await create.mutateAsync(body);
      idempotencyKey.current = newIdempotencyKey();
      Alert.alert(
        'Booking created',
        `${result.count} booking(s) · ${result.paymentStatus}`,
        [
          { text: 'Done', onPress: () => router.replace(`/bookings/${result.id}`) },
          { text: 'Stay', style: 'cancel' },
        ],
      );
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not create booking.');
    }
  }

  return (
    <Screen>
      <ScreenHeader title="New booking" subtitle="Assisted create" showBack />
      <AdminOnly>
        <AppText variant="section">Customer</AppText>
        <TextInput
          style={styles.input}
          placeholder="Search name, email, phone (2+ chars)"
          placeholderTextColor={theme.colors.textDim}
          value={customerQuery}
          onChangeText={(text) => {
            setCustomerQuery(text);
            setSelectedCustomerId(null);
          }}
          autoCapitalize="none"
        />
        <QueryState loading={customersQuery.isLoading} error={customersQuery.error} />
        {(customersQuery.data?.customers ?? []).slice(0, 8).map((c) => (
          <Button
            key={c.userId}
            variant={selectedCustomerId === c.userId ? 'primary' : 'outline'}
            label={`${c.name}${c.phone ? ` · ${c.phone}` : ''}`}
            onPress={() => setSelectedCustomerId(c.userId)}
            style={styles.stackBtn}
          />
        ))}
        {selectedCustomer && (
          <AppText variant="caption" style={styles.selected}>
            Selected · {selectedCustomer.name}
          </AppText>
        )}

        <AppText variant="section">Service</AppText>
        <QueryState loading={servicesQuery.isLoading} error={servicesQuery.error} />
        <View style={styles.chips}>
          {services.map((s) => (
            <Chip
              key={s.id}
              label={s.name}
              active={serviceId === s.id}
              onPress={() => setServiceId(s.id)}
            />
          ))}
        </View>

        {serviceId && (
          <>
            <AppText variant="section">Worker</AppText>
            <QueryState loading={cleanersQuery.isLoading} error={cleanersQuery.error} />
            {cleaners.map((c) => (
              <Button
                key={c.userId}
                variant={cleanerId === c.userId ? 'primary' : 'outline'}
                label={c.name}
                onPress={() => setCleanerId(c.userId)}
                style={styles.stackBtn}
              />
            ))}
          </>
        )}

        <AppText variant="section">Schedule</AppText>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.colors.textDim}
          value={scheduledDate}
          onChangeText={setScheduledDate}
        />
        <TextInput
          style={styles.input}
          placeholder="HH:MM"
          placeholderTextColor={theme.colors.textDim}
          value={scheduledTime}
          onChangeText={setScheduledTime}
        />
        <TextInput
          style={styles.input}
          placeholder="Duration (hours)"
          placeholderTextColor={theme.colors.textDim}
          keyboardType="decimal-pad"
          value={durationHours}
          onChangeText={setDurationHours}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          placeholderTextColor={theme.colors.textDim}
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Special instructions"
          placeholderTextColor={theme.colors.textDim}
          multiline
          value={specialInstructions}
          onChangeText={setSpecialInstructions}
        />
        <TextInput
          style={styles.input}
          placeholder="Admin note (internal)"
          placeholderTextColor={theme.colors.textDim}
          value={adminNote}
          onChangeText={setAdminNote}
        />

        <View style={styles.chips}>
          <Chip
            label="Customer consent confirmed"
            active={consentConfirmed}
            onPress={() => setConsentConfirmed((v) => !v)}
          />
          <Chip
            label="Send notifications"
            active={sendNotifications}
            onPress={() => setSendNotifications((v) => !v)}
          />
        </View>

        <Button label={busy ? 'Creating…' : 'Create booking'} onPress={busy ? undefined : () => void onSubmit()} />

        {actionError && (
          <AppText variant="caption" style={styles.error}>
            {actionError}
          </AppText>
        )}
      </AdminOnly>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  multiline: { minHeight: 72, textAlignVertical: 'top' },
  stackBtn: { marginBottom: theme.spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  selected: { marginBottom: theme.spacing.md },
  error: { color: theme.colors.danger, marginTop: theme.spacing.md },
});
