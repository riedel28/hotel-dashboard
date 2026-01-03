import { Trans } from '@lingui/react/macro';

interface ReservationSearchResultsProps {
  searchQuery?: string;
}

export function ReservationSearchResults({
  searchQuery
}: ReservationSearchResultsProps) {
  if (!searchQuery) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Trans>
        Show results for:{' '}
        <span className="font-medium text-foreground">"{searchQuery}"</span>
      </Trans>
    </div>
  );
}

