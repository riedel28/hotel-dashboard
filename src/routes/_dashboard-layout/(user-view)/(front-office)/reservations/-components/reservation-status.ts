import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import type { ReservationState } from '@/api/reservations';
import type { BadgeProps } from '@/components/ui/badge';

interface ReservationStatusDisplay {
  label: MessageDescriptor;
  badgeColor: BadgeProps['color'];
}

/**
 * Single source of truth for how a reservation status is shown, so the table
 * cell and the status filter cannot drift apart.
 */
const reservationStatusDisplay: Record<
  ReservationState,
  ReservationStatusDisplay
> = {
  pending: { label: msg`Pending`, badgeColor: 'yellow' },
  ready_in: { label: msg`Ready in`, badgeColor: 'indigo' },
  checked_in: { label: msg`Checked in`, badgeColor: 'sky' },
  ready_out: { label: msg`Ready out`, badgeColor: 'orange' },
  checked_out: { label: msg`Checked out`, badgeColor: 'emerald' }
};

export { reservationStatusDisplay };
