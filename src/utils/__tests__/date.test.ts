import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import {
  todayKey, isSameDay, isoWeekKey, withinUndoWindow, FIVE_MINUTES_MS, noonOf,
} from '../date';

describe('date utils', () => {
  it('todayKey returns YYYY-MM-DD', () => {
    const key = todayKey(new Date('2026-05-23T10:00:00').getTime());
    expect(key).toBe('2026-05-23');
  });

  it('isSameDay true for same calendar day', () => {
    const a = new Date('2026-05-23T01:00').getTime();
    const b = new Date('2026-05-23T23:59').getTime();
    expect(isSameDay(a, b)).toBe(true);
  });

  it('isSameDay false across days', () => {
    const a = new Date('2026-05-23T23:00').getTime();
    const b = new Date('2026-05-24T01:00').getTime();
    expect(isSameDay(a, b)).toBe(false);
  });

  it('isoWeekKey gives stable key', () => {
    const k1 = isoWeekKey(new Date('2026-05-18T00:00').getTime()); // Monday
    const k2 = isoWeekKey(new Date('2026-05-24T23:59').getTime()); // Sunday
    expect(k1).toBe(k2);
  });

  it('isoWeekKey differs across weeks', () => {
    const k1 = isoWeekKey(new Date('2026-05-24T23:00').getTime());
    const k2 = isoWeekKey(new Date('2026-05-25T01:00').getTime());
    expect(k1).not.toBe(k2);
  });

  it('withinUndoWindow true within 5 min', () => {
    const t = Date.now();
    expect(withinUndoWindow(t, t + FIVE_MINUTES_MS - 100)).toBe(true);
  });

  it('withinUndoWindow false past 5 min', () => {
    const t = Date.now();
    expect(withinUndoWindow(t, t + FIVE_MINUTES_MS + 100)).toBe(false);
  });
});

describe('noonOf', () => {
  it('returns noon of the given date key', () => {
    const ts = noonOf('2026-05-20');
    expect(dayjs(ts).format('YYYY-MM-DD HH:mm:ss')).toBe('2026-05-20 12:00:00');
  });
});
