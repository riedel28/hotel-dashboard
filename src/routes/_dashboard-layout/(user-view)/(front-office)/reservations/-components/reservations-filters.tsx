import type { ReactNode } from 'react';

interface ReservationsFiltersProps {
  children: ReactNode;
}

export function ReservationsFilters({ children }: ReservationsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  );
}
