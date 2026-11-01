import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppText } from '@/components/ui/Typography';
import { Chip } from '@/components/ui/Chip';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { QueryState } from '@/components/ui/QueryState';
import { useAdminPromotionCodes } from '@/hooks/useMithrilAdmin';
import { formatMinorAmount, type AdminPromotionCode, type AdminPromotionCodeStatus } from '@/lib/mithril';
import { theme } from '@/constants/theme';

type Filter = 'active' | 'scheduled' | 'expired' | 'all';

export default function PromoCodesScreen() {
  const { data, isLoading, error } = useAdminPromotionCodes();
  const codes = data?.codes ?? [];
  const [filter, setFilter] = useState<Filter>('active');

  const counts = useMemo(() => {
    const tally: Record<AdminPromotionCodeStatus, number> = {
      active: 0,
      scheduled: 0,
      expired: 0,
      inactive: 0,
      exhausted: 0,
    };
    for (const c of codes) {
      tally[c.status] = (tally[c.status] ?? 0) + 1;
    }
    return tally;
  }, [codes]);

  const visible = useMemo(() => {
    if (filter === 'all') return codes;
    return codes.filter((c) => c.status === filter);
  }, [codes, filter]);

  return (
    <Screen>
      <ScreenHeader title="Promo codes" showBack />
      <QueryState loading={isLoading} error={error} />
      <View style={styles.chips}>
        <Chip label={`Active ${counts.active}`} active={filter === 'active'} onPress={() => setFilter('active')} />
        <Chip
          label={`Scheduled ${counts.scheduled}`}
          active={filter === 'scheduled'}
          onPress={() => setFilter('scheduled')}
        />
        <Chip label={`Expired ${counts.expired}`} active={filter === 'expired'} onPress={() => setFilter('expired')} />
      </View>
      {visible.map((p) => (
        <View key={p.id} style={styles.card}>
          <View style={styles.cardTop}>
            <AppText style={styles.code}>{p.code}</AppText>
            <StatusBadge label={statusLabel(p.status)} tone={statusTone(p.status)} />
          </View>
          <AppText variant="body">{p.headline || promoSummary(p)}</AppText>
          <AppText variant="caption" style={styles.meta}>{promoMeta(p)}</AppText>
        </View>
      ))}
    </Screen>
  );
}

function promoSummary(p: AdminPromotionCode) {
  if (p.promotionType === 'percent_off' && p.promotionValue != null) {
    return `${p.promotionValue}% off`;
  }
  if (p.promotionType === 'fixed_credit_minor' && p.promotionValue != null) {
    return `${formatMinorAmount(p.promotionValue)} off`;
  }
  if (p.promotionType === 'free_hours' && p.promotionValue != null) {
    return `${p.promotionValue} free hours`;
  }
  return 'Promotion';
}

function promoMeta(p: AdminPromotionCode) {
  const used = `${p.redemptionCount} used`;
  const cap = p.maxRedemptions != null ? ` / ${p.maxRedemptions}` : ' · no limit';
  const end = p.validTo ? ` · ends ${new Date(p.validTo).toLocaleDateString()}` : '';
  return `${used}${cap}${end}`;
}

function statusLabel(status: AdminPromotionCode['status']) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusTone(status: AdminPromotionCode['status']) {
  if (status === 'active') return 'success';
  if (status === 'scheduled') return 'warning';
  if (status === 'expired') return 'muted';
  return 'muted';
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.lg, gap: theme.spacing.sm },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
  code: { color: theme.colors.accent, fontWeight: '700', fontSize: 18 },
  meta: { marginTop: theme.spacing.sm },
});
