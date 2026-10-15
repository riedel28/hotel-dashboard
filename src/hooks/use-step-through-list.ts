import { useEffect } from 'react';

/**
 * While an item is open, ↑/↓ open the previous or next one in `items` (the
 * table page behind a details drawer) and stop at its ends.
 */
export function useStepThroughList<TItem extends { id: number }>(
  items: TItem[],
  openId: number | undefined,
  onSelect: (id: number) => void
) {
  useEffect(() => {
    if (openId === undefined) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
        return;
      }
      const index = items.findIndex((item) => item.id === openId);
      const next = items[index + (event.key === 'ArrowDown' ? 1 : -1)];
      if (index !== -1 && next) {
        event.preventDefault();
        onSelect(next.id);
      }
    };

    // Capture phase: the open dialog stops arrow keys from bubbling this far
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [items, openId, onSelect]);
}
