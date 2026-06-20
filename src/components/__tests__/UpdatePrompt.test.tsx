import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

let captured: ((apply: () => void) => void) | null = null;

vi.mock('@/utils/registerServiceWorker', () => ({
  onServiceWorkerUpdate: (fn: (apply: () => void) => void) => { captured = fn; },
}));

import { UpdatePrompt } from '../UpdatePrompt';

describe('UpdatePrompt', () => {
  beforeEach(() => { captured = null; });

  it('renders nothing until an update is announced', () => {
    render(<UpdatePrompt />);
    expect(screen.queryByText(/发现新版本/)).toBeNull();
  });

  it('shows the banner and applies the update on click', () => {
    const apply = vi.fn();
    render(<UpdatePrompt />);
    act(() => { captured?.(apply); });
    fireEvent.click(screen.getByRole('button', { name: /刷新/ }));
    expect(apply).toHaveBeenCalledTimes(1);
  });
});
