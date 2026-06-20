import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);

export const FIVE_MINUTES_MS = 5 * 60 * 1000;

export function todayKey(now: number = Date.now()): string {
  return dayjs(now).format('YYYY-MM-DD');
}

export function isSameDay(a: number, b: number): boolean {
  return dayjs(a).isSame(dayjs(b), 'day');
}

export function isoWeekKey(now: number = Date.now()): string {
  const d = dayjs(now);
  return `${d.isoWeekYear()}-W${String(d.isoWeek()).padStart(2, '0')}`;
}

export function startOfIsoWeek(now: number = Date.now()): number {
  return dayjs(now).startOf('isoWeek').valueOf();
}

export function endOfIsoWeek(now: number = Date.now()): number {
  return dayjs(now).endOf('isoWeek').valueOf();
}

export function withinUndoWindow(timestamp: number, now: number = Date.now()): boolean {
  return now - timestamp <= FIVE_MINUTES_MS;
}

export function formatHM(timestamp: number): string {
  return dayjs(timestamp).format('HH:mm');
}

export function formatDateZh(date: string): string {
  return dayjs(date).format('YYYY-MM-DD');
}

export function noonOf(dateKey: string): number {
  return dayjs(dateKey).hour(12).minute(0).second(0).millisecond(0).valueOf();
}
