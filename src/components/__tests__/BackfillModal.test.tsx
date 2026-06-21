import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import dayjs from 'dayjs';
import { BackfillModal } from '../BackfillModal';
import { ToastProvider } from '../ToastProvider';
import { useStore } from '@/store';

function seed() {
  useStore.setState({
    tasks: [], records: [], milestones: [], unlockedMilestones: [], recentlyUnlocked: null,
  } as never);
}

const yesterday = () => dayjs().subtract(1, 'day').format('YYYY-MM-DD');

describe('BackfillModal', () => {
  beforeEach(seed);

  it('backfills the tapped task for the default (yesterday) day', () => {
    const t = useStore.getState().addTask({
      categoryId: 'study', name: '朗读', icon: 'book', points: 8,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    render(<ToastProvider><BackfillModal open onClose={() => {}} /></ToastProvider>);
    fireEvent.click(screen.getByLabelText(`backfill-${t.id}`));
    const recs = useStore.getState().records;
    expect(recs).toHaveLength(1);
    expect(recs[0].backfilled).toBe(true);
    expect(recs[0].date).toBe(yesterday());
  });

  it('adds no record and stays at one when the day is already full', () => {
    const t = useStore.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 5,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    useStore.getState().backfillCheckIn(t.id, yesterday());
    render(<ToastProvider><BackfillModal open onClose={() => {}} /></ToastProvider>);
    fireEvent.click(screen.getByLabelText(`backfill-${t.id}`));
    expect(useStore.getState().records).toHaveLength(1);
  });

  it('shows no undo control before any backfill exists', () => {
    const t = useStore.getState().addTask({
      categoryId: 'study', name: '朗读', icon: 'book', points: 8,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    render(<ToastProvider><BackfillModal open onClose={() => {}} /></ToastProvider>);
    expect(screen.queryByLabelText(`undo-backfill-${t.id}`)).toBeNull();
  });

  it('undoes a backfilled record from the task row', () => {
    const t = useStore.getState().addTask({
      categoryId: 'study', name: '朗读', icon: 'book', points: 8,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    render(<ToastProvider><BackfillModal open onClose={() => {}} /></ToastProvider>);
    fireEvent.click(screen.getByLabelText(`backfill-${t.id}`));
    expect(useStore.getState().records).toHaveLength(1);
    fireEvent.click(screen.getByLabelText(`undo-backfill-${t.id}`));
    expect(useStore.getState().records).toHaveLength(0);
  });
});
