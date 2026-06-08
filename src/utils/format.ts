export function formatCurrency(
  value: number | string | null | undefined,
  currency: string = 'CNY',
  decimals: number = 2,
): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return '-';
  }
  const formatter = new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return formatter.format(numValue);
}

export function formatDate(
  date: Date | string | number | null | undefined,
  format: string = 'YYYY-MM-DD',
): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
}

export function formatDateTime(
  date: Date | string | number | null | undefined,
  format: string = 'YYYY-MM-DD HH:mm:ss',
): string {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return formatDate(date, format)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

export function formatPercent(
  value: number | string | null | undefined,
  decimals: number = 2,
  showSymbol: boolean = true,
): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '-';

  const formatted = numValue.toFixed(decimals);
  return showSymbol ? `${formatted}%` : formatted;
}

export function formatNumber(
  value: number | string | null | undefined,
  decimals: number = 0,
): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '-';

  const parts = numValue.toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}
