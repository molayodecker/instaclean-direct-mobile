import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Switch, TextInput, View } from 'react-native';
import { AdminOnly } from '@/components/AdminOnly';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { QueryState } from '@/components/ui/QueryState';
import { useAdminService, useUpdateAdminService } from '@/hooks/useMithrilAdmin';
import { theme } from '@/constants/theme';

export default function EditServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const serviceId = id ?? '';
  const { data, isLoading, error } = useAdminService(serviceId);
  const save = useUpdateAdminService(serviceId);
  const service = data?.service;

  const [name, setName] = useState('');
  const [priceGhs, setPriceGhs] = useState('');
  const [minHours, setMinHours] = useState('');
  const [description, setDescription] = useState('');
  const [visible, setVisible] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!service) return;
    setName(service.name);
    setPriceGhs(String(service.priceGhs));
    setMinHours(String(service.minimumDurationHours ?? 2));
    setDescription(service.description ?? '');
    setVisible(service.active);
  }, [service]);

  const onSave = async () => {
    setSaveError(null);
    try {
      await save.mutateAsync({
        name: name.trim(),
        priceGhs: Number(priceGhs.trim()),
        minimumDurationHours: Number(minHours),
        description: description.trim() || null,
        active: visible,
      });
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not save service.');
    }
  };

  return (
    <Screen>
      <ScreenHeader title={service?.name ?? 'Service'} subtitle="Service" showBack />
      <QueryState loading={isLoading} error={error} />
      {service && (
        <AdminOnly>
          <AppText variant="label">Name</AppText>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
          <View style={styles.row}>
            <View style={styles.half}>
              <AppText variant="label">Rate (GH₵ / hr)</AppText>
              <TextInput
                style={styles.input}
                value={priceGhs}
                onChangeText={setPriceGhs}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.half}>
              <AppText variant="label">Minimum hours</AppText>
              <TextInput
                style={styles.input}
                value={minHours}
                onChangeText={setMinHours}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          <AppText variant="label">Description</AppText>
          <TextInput
            style={[styles.input, styles.multiline]}
            multiline
            value={description}
            onChangeText={setDescription}
          />
          <ToggleRow label="Visible in app" value={visible} onChange={setVisible} />
          {saveError && <AppText variant="caption" style={styles.error}>{saveError}</AppText>}
          <Button label={save.isPending ? 'Saving…' : 'Save changes'} style={styles.save} onPress={onSave} />
        </AdminOnly>
      )}
    </Screen>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <AppText variant="body">{label}</AppText>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
        thumbColor={theme.colors.text}
      />
    </View>
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
    marginBottom: theme.spacing.md,
    fontSize: 16,
  },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: theme.spacing.md },
  half: { flex: 1 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
  },
  save: { marginTop: theme.spacing.xl },
  error: { color: theme.colors.accent, marginBottom: theme.spacing.sm },
});
