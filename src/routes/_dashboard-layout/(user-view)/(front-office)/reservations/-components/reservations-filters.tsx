import type { ReactNode } from 'react';

interface ReservationsFiltersProps {
  children: ReactNode;
}

export function ReservationsFilters({ children }: ReservationsFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
      {children}
    </div>
  );
}
