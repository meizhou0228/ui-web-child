import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskItem } from '../TaskItem';
import { makeTask, makeRecord } from '../../../test/factories';

describe('TaskItem', () => {
  it('renders task name and points', () => {
    const t = makeTask({ name: '刷牙', points: 3 });
    render(<TaskItem task={t} onCheckIn={() => {}} onUndo={() => {}} />);
    expect(screen.getByText('刷牙')).toBeInTheDocument();
    expect(screen.getByText('+3 分')).toBeInTheDocument();
  });

  it('shows 打卡 button when not done (count < limit)', () => {
    const t = makeTask();
    const onCheckIn = vi.fn();
    render(<TaskItem task={t} count={0} limit={1} onCheckIn={onCheckIn} onUndo={() => {}} />);
    fireEvent.click(screen.getByLabelText('check in'));
    expect(onCheckIn).toHaveBeenCalled();
  });

  it('shows undo when last record within window', () => {
    const t = makeTask();
    const r = makeRecord({ taskId: t.id, timestamp: Date.now() });
    const onUndo = vi.fn();
    render(<TaskItem task={t} count={1} limit={1} lastRecord={r} onCheckIn={() => {}} onUndo={onUndo} />);
    fireEvent.click(screen.getByLabelText('undo'));
    expect(onUndo).toHaveBeenCalled();
  });

  it('hides undo after window expires', () => {
    const t = makeTask();
    const r = makeRecord({ taskId: t.id, timestamp: Date.now() - 10 * 60 * 1000 });
    render(<TaskItem task={t} count={1} limit={1} lastRecord={r} onCheckIn={() => {}} onUndo={() => {}} />);
    expect(screen.queryByLabelText('undo')).toBeNull();
  });

  it('shows progress badge X/Y when limit > 1', () => {
    const t = makeTask({ name: '做家务', dailyLimit: 3 });
    render(<TaskItem task={t} count={1} limit={3} onCheckIn={() => {}} onUndo={() => {}} />);
    expect(screen.getByText('1/3')).toBeInTheDocument();
    // Still tappable since count < limit
    expect(screen.getByLabelText('check in')).toBeInTheDocument();
  });

  it('marks done when count >= limit (multi)', () => {
    const t = makeTask({ name: '做家务', dailyLimit: 3 });
    const r = makeRecord({ taskId: t.id, timestamp: Date.now() });
    render(<TaskItem task={t} count={3} limit={3} lastRecord={r} onCheckIn={() => {}} onUndo={() => {}} />);
    expect(screen.queryByLabelText('check in')).toBeNull();
    expect(screen.getByText(/已完成/)).toBeInTheDocument();
  });
});
