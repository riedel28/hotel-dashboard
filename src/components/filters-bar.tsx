import type { ReactNode } from 'react';

interface FiltersBarProps {
  children: ReactNode;
}

/** The row of filters above a table; put the refresh button last. */
export function FiltersBar({ children }: FiltersBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  );
}
