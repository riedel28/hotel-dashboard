import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { type Guest } from '@/api/reservations';
import { CountryFlag } from '@/components/ui/country-flag';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

interface GuestsCellProps {
  guests: Guest[];
}

function GuestName({ guest }: { guest: Guest }) {
  return (
    <div className="flex items-center gap-2 text-nowrap">
      <CountryFlag
        code={guest.nationality_code}
        title={guest.nationality_code}
        className="size-4"
        aria-label={guest.nationality_code}
      />
      <Trans>
        {guest.last_name}, {guest.first_name}
      </Trans>
    </div>
  );
}

export function GuestsCell({ guests }: GuestsCellProps) {
  if (guests.length === 0) {
    return (
      <span className="text-muted-foreground">
        <Trans>No guests</Trans>
      </span>
    );
  }

  // Safe: guarded by early return above
  const firstGuest = guests[0]!;
  const rest = guests.slice(1);

  return (
    <div className="flex items-center gap-1.5">
      <GuestName guest={firstGuest} />
      {rest.length > 0 && (
        <Popover>
          <PopoverTrigger className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted/80">
            +{rest.length}
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto min-w-48 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {t`${guests.length} guests total`}
            </p>
            <div className="space-y-1.5">
              {guests.map((guest) => (
                <GuestName key={guest.id} guest={guest} />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
