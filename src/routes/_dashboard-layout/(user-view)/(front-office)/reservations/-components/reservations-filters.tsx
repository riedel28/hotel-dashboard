import type { ReactNode } from 'react';

interface ReservationsFiltersProps {
  children: ReactNode;
}

export function ReservationsFilters({ children }: ReservationsFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] md:gap-3 lg:flex lg:items-center">
      {children}
    </div>
  );
}
