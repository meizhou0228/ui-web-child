import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShopCard } from '../ShopCard';
import { makeReward } from '../../../test/factories';

describe('ShopCard', () => {
  it('enables redeem when affordable', () => {
    const reward = makeReward({ cost: 50 });
    const onRedeem = vi.fn();
    render(<ShopCard reward={reward} balance={100} onRedeem={onRedeem} />);
    fireEvent.click(screen.getByLabelText('redeem'));
    expect(onRedeem).toHaveBeenCalled();
  });

  it('disables and shows "还差 X 分" when not affordable', () => {
    const reward = makeReward({ cost: 100 });
    render(<ShopCard reward={reward} balance={40} onRedeem={() => {}} />);
    const btn = screen.getByLabelText('insufficient') as HTMLButtonElement;
    expect(btn).toBeDisabled();
    expect(btn.textContent).toContain('还差 60');
  });
});
