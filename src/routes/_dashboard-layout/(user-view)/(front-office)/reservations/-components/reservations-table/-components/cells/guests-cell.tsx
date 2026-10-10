import { useLingui } from '@lingui/react/macro';

import { type Guest } from '@/api/reservations';
import { badgeVariants } from '@/components/ui/badge';
import { CountryFlag } from '@/components/ui/country-flag';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { getCountryName } from '@/lib/countries';
import { cn } from '@/lib/utils';

const guestName = (guest: Guest) => `${guest.last_name}, ${guest.first_name}`;

function GuestLine({ guest }: { guest: Guest }) {
  const { i18n } = useLingui();
  const countryName = getCountryName(guest.nationality_code, i18n.locale);

  return (
    <span className="flex min-w-0 items-center gap-2">
      <CountryFlag
        code={guest.nationality_code}
        title={countryName}
        className="size-4 shrink-0"
        aria-label={countryName}
      />
      <span className="truncate" title={guestName(guest)}>
        {guestName(guest)}
      </span>
    </span>
  );
}

/** The primary guest, the fellow travelers behind a "+N" tooltip. */
export function GuestsCell({ guests }: { guests: Guest[] }) {
  const [primaryGuest, ...fellowTravelers] = guests;

  if (!primaryGuest) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <GuestLine guest={primaryGuest} />
      {fellowTravelers.length > 0 && (
        <Tooltip>
          <TooltipTrigger
            type="button"
            aria-label={fellowTravelers.map(guestName).join('; ')}
            className={cn(badgeVariants({ color: 'gray', size: 'sm' }))}
          >
            +{fellowTravelers.length}
          </TooltipTrigger>
          <TooltipContent>
            <ul className="space-y-1">
              {fellowTravelers.map((guest) => (
                <li key={guest.id}>
                  <GuestLine guest={guest} />
                </li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
