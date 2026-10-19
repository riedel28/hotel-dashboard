import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { describe, expect, test, vi } from 'vitest';

import { render } from '@/test-utils';

import { DateRangeFilter } from './date-range-filter';

describe('DateRangeFilter', () => {
  test('offers the quick picks and applies one at once', async () => {
    const user = userEvent.setup();
    const onRangeChange = vi.fn();
    render(<DateRangeFilter onRangeChange={onRangeChange} />);

    await user.click(screen.getByRole('button', { name: 'All dates' }));
    for (const name of ['Today', 'Last 30 days', 'Last year']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }

    await user.click(screen.getByRole('button', { name: 'Last 7 days' }));
    const [range] = onRangeChange.mock.calls[0]!;
    expect(dayjs(range.to).isSame(dayjs(), 'day')).toBe(true);
    expect(dayjs(range.to).diff(range.from, 'day')).toBe(6);
  });

  test('marks the quick pick the applied range matches', async () => {
    const user = userEvent.setup();
    const today = dayjs().format('YYYY-MM-DD');
    render(<DateRangeFilter from={today} to={today} onRangeChange={vi.fn()} />);

    await user.click(
      screen.getByRole('button', { name: /\d{2}\.\d{2}\.\d{4}/ })
    );
    expect(screen.getByRole('button', { name: 'Today' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  test('quick: a complete range applies without Apply, Reset clears it', async () => {
    const user = userEvent.setup();
    const onRangeChange = vi.fn();
    render(<DateRangeFilter onRangeChange={onRangeChange} />);
    await user.click(screen.getByRole('button', { name: 'All dates' }));

    const days = screen
      .getAllByRole('button')
      .filter((button) => /^\d+$/.test(button.textContent ?? ''));
    // As before: the first day picked is a one-day range, applied at once;
    // the second one widens it
    await user.click(days[0]!);
    const [first] = onRangeChange.mock.lastCall!;
    expect(dayjs(first.from).isSame(first.to, 'day')).toBe(true);
    await user.click(days[1]!);
    const [widened] = onRangeChange.mock.lastCall!;
    expect(dayjs(widened.to).diff(widened.from, 'day')).toBe(1);

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(onRangeChange).toHaveBeenLastCalledWith(undefined);
  });

  test('keeps to past days unless allowFuture', async () => {
    // Mid-month, so tomorrow is in the month on screen
    vi.useFakeTimers({ toFake: ['Date'], now: new Date(2026, 9, 16, 12) });
    try {
      const user = userEvent.setup();
      const { unmount } = render(<DateRangeFilter onRangeChange={vi.fn()} />);
      await user.click(screen.getByRole('button', { name: 'All dates' }));
      expect(
        screen.getByRole('button', { name: /October 17th, 2026/ })
      ).toBeDisabled();
      unmount();

      render(<DateRangeFilter onRangeChange={vi.fn()} allowFuture />);
      await user.click(screen.getByRole('button', { name: 'All dates' }));
      expect(
        screen.getByRole('button', { name: /October 17th, 2026/ })
      ).toBeEnabled();
    } finally {
      vi.useRealTimers();
    }
  });
});
