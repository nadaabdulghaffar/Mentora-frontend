export function formatReviewDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatRating(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  return value.toFixed(decimals);
}
