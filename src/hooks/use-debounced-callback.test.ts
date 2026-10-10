import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { useDebouncedCallback } from './use-debounced-callback';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test('fires once, with the last arguments, after the delay', () => {
  const callback = vi.fn();
  const { result } = renderHook(() => useDebouncedCallback(callback, 500));

  result.current('a');
  result.current('ab');
  vi.advanceTimersByTime(500);

  expect(callback).toHaveBeenCalledExactlyOnceWith('ab');
});

test('does not fire a pending call after unmount', () => {
  const callback = vi.fn();
  const { result, unmount } = renderHook(() =>
    useDebouncedCallback(callback, 500)
  );

  result.current('a');
  unmount();
  vi.advanceTimersByTime(500);

  expect(callback).not.toHaveBeenCalled();
});
