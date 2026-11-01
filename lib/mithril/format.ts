export function formatMinorAmount(amountMinor: number, currency = 'GHS') {
  const major = amountMinor / 100;
  const symbol = currency === 'GHS' ? 'GH₵' : currency;
  return `${symbol} ${major.toLocaleString('en-GH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatBookingWhen(scheduledDate?: string | null, scheduledTime?: string | null) {
  if (!scheduledDate && !scheduledTime) return 'Unscheduled';
  const date = scheduledDate ?? '';
  const time = scheduledTime ?? '';
  return [date, time].filter(Boolean).join(' · ');
}

export function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
