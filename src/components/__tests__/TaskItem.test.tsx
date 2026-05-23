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

  it('shows 打卡 button when not done', () => {
    const t = makeTask();
    const onCheckIn = vi.fn();
    render(<TaskItem task={t} onCheckIn={onCheckIn} onUndo={() => {}} />);
    fireEvent.click(screen.getByLabelText('check in'));
    expect(onCheckIn).toHaveBeenCalled();
  });

  it('shows undo when done within window', () => {
    const t = makeTask();
    const r = makeRecord({ taskId: t.id, timestamp: Date.now() });
    const onUndo = vi.fn();
    render(<TaskItem task={t} todayRecord={r} onCheckIn={() => {}} onUndo={onUndo} />);
    fireEvent.click(screen.getByLabelText('undo'));
    expect(onUndo).toHaveBeenCalled();
  });

  it('hides undo after window expires', () => {
    const t = makeTask();
    const r = makeRecord({ taskId: t.id, timestamp: Date.now() - 10 * 60 * 1000 });
    render(<TaskItem task={t} todayRecord={r} onCheckIn={() => {}} onUndo={() => {}} />);
    expect(screen.queryByLabelText('undo')).toBeNull();
  });
});
