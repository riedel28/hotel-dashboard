import Flag from 'react-flagkit';
import { Trans } from '@lingui/react/macro';

import type { Reservation } from '../../reservations-table';

interface GuestsCellProps {
  guests: Reservation['guests'];
}

export function GuestsCell({ guests }: GuestsCellProps) {
  return (
    <div className="space-y-0.5">
      {guests.map((guest) => {
        const firstName = guest.first_name;
        const lastName = guest.last_name;

        return (
          <div key={guest.id} className="flex items-center gap-2 text-nowrap">
            <Flag
              country={guest.nationality_code}
              title={guest.nationality_code}
              className="size-3.5 rounded-sm"
              aria-label={guest.nationality_code}
            />
            <Trans>
              {lastName}, {firstName}
            </Trans>
          </div>
        );
      })}
    </div>
  );
}


