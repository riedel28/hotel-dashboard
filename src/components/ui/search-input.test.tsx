import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { SearchInput } from '@/components/ui/search-input';
import { render } from '@/test-utils';

const DEBOUNCE_MS = 300;
const box = () => screen.getByRole<HTMLInputElement>('searchbox');
const type = (text: string) =>
  fireEvent.change(box(), { target: { value: text } });
const settle = () => act(() => vi.advanceTimersByTime(DEBOUNCE_MS));

describe('SearchInput', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test('reports what was typed once typing pauses', () => {
    const onChange = vi.fn();
    render(<SearchInput onChange={onChange} debounceMs={DEBOUNCE_MS} />);

    type('ta');
    type('tab');
    expect(onChange).not.toHaveBeenCalled();

    settle();
    expect(onChange).toHaveBeenCalledExactlyOnceWith('tab');
  });

  test('follows a value changed from outside, such as a filter reset', () => {
    const { rerender } = render(<SearchInput value="tablet" />);
    expect(box().value).toBe('tablet');

    rerender(<SearchInput value="" />);
    expect(box().value).toBe('');
  });

  test('keeps newer typing when its own earlier change comes back', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <SearchInput value="" onChange={onChange} debounceMs={DEBOUNCE_MS} />
    );

    type('a');
    settle();
    expect(onChange).toHaveBeenLastCalledWith('a');

    // The user is already typing more when the parent catches up with "a"
    type('ab');
    rerender(
      <SearchInput value="a" onChange={onChange} debounceMs={DEBOUNCE_MS} />
    );
    expect(box().value).toBe('ab');
  });

  test('clears through its button and reports it at once', () => {
    const onChange = vi.fn();
    render(
      <SearchInput value="tv" onChange={onChange} debounceMs={DEBOUNCE_MS} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(box().value).toBe('');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('');
  });
});
