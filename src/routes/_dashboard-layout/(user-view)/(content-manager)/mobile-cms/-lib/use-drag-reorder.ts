import * as React from 'react';

/**
 * Native drag and drop for a short flat list (gallery, nested items): spread
 * `itemProps(index)` on each item; `onMove(from, to)` fires on drop with `to`
 * counted as if the item were already taken out. Lists that need keyboard
 * reordering offer move buttons next to it.
 */
export function useDragReorder(onMove: (from: number, to: number) => void) {
  const [dragging, setDragging] = React.useState<number | null>(null);
  const [over, setOver] = React.useState<number | null>(null);

  const itemProps = (index: number) => ({
    draggable: true,
    'data-dragging': dragging === index || undefined,
    'data-drop-target': (over === index && dragging !== index) || undefined,
    onDragStart: (event: React.DragEvent) => {
      event.dataTransfer.effectAllowed = 'move';
      // Firefox starts a drag only with some data set.
      event.dataTransfer.setData('text/plain', String(index));
      setDragging(index);
    },
    onDragOver: (event: React.DragEvent) => {
      if (dragging == null) return;
      event.preventDefault();
      setOver(index);
    },
    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      if (dragging != null && dragging !== index) onMove(dragging, index);
      setDragging(null);
      setOver(null);
    },
    onDragEnd: () => {
      setDragging(null);
      setOver(null);
    }
  });

  return { itemProps };
}

/** `items` with the one at `from` moved to `to`. */
export function moveItem<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}
