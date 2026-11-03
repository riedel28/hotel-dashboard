import type { ReactNode } from 'react';

interface ReservationsFiltersProps {
  children: ReactNode;
}

export function ReservationsFilters({ children }: ReservationsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 md:grid md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:flex lg:flex-nowrap lg:items-center">
      {children}
    </div>
  );
}
