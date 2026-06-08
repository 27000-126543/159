export function addDays(date: Date | string | number, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date | string | number, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function addYears(date: Date | string | number, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

export function diffDays(
  date1: Date | string | number,
  date2: Date | string | number,
): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function diffHours(
  date1: Date | string | number,
  date2: Date | string | number,
): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60));
}

export function isOverdue(
  targetDate: Date | string | number,
  compareDate: Date | string | number = new Date(),
): boolean {
  const target = new Date(targetDate);
  const compare = new Date(compareDate);
  return compare > target;
}

export function isToday(date: Date | string | number): boolean {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function isPast(date: Date | string | number): boolean {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

export function isFuture(date: Date | string | number): boolean {
  const d = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return d > today;
}

export function getStartOfDay(date: Date | string | number): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date: Date | string | number): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getCreditDueDate(
  invoiceDate: Date | string | number,
  creditDays: number,
): Date {
  return addDays(invoiceDate, creditDays);
}

export function getRemainingDays(
  dueDate: Date | string | number,
  compareDate: Date | string | number = new Date(),
): number {
  const due = new Date(dueDate);
  const compare = new Date(compareDate);
  const diffTime = due.getTime() - compare.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getCreditStatus(
  dueDate: Date | string | number,
  compareDate: Date | string | number = new Date(),
): 'normal' | 'warning' | 'overdue' | 'urgent' {
  const remaining = getRemainingDays(dueDate, compareDate);

  if (remaining < 0) return 'overdue';
  if (remaining === 0) return 'urgent';
  if (remaining <= 3) return 'warning';
  return 'normal';
}

export function getApprovalTimeoutDate(
  submitDate: Date | string | number,
  timeoutHours: number = 24,
): Date {
  const d = new Date(submitDate);
  d.setHours(d.getHours() + timeoutHours);
  return d;
}

export function isApprovalTimeout(
  submitDate: Date | string | number,
  timeoutHours: number = 24,
  compareDate: Date | string | number = new Date(),
): boolean {
  const timeoutDate = getApprovalTimeoutDate(submitDate, timeoutHours);
  const compare = new Date(compareDate);
  return compare > timeoutDate;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) {
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours > 0) {
    return `${days}天${remainingHours}小时`;
  }
  return `${days}天`;
}

export function getAge(birthDate: Date | string | number): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function getQuarter(date: Date | string | number): number {
  const d = new Date(date);
  return Math.floor(d.getMonth() / 3) + 1;
}

export function getWeekNumber(date: Date | string | number): number {
  const d = new Date(date);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}
