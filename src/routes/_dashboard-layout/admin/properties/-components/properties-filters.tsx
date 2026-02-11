import type { ReactNode } from 'react';

interface PropertiesFiltersProps {
  children: ReactNode;
}

export function PropertiesFilters({ children }: PropertiesFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  );
}
