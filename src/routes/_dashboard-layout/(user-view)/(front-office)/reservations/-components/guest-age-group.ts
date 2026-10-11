import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import type { GuestAgeGroup } from 'shared/types/reservations';

/** What each age group is called, in the guest card and the guest dialogs. */
const guestAgeGroupLabels: Record<GuestAgeGroup, MessageDescriptor> = {
  adult: msg`Adult`,
  // One person here; the head-count label of the same name is a plural
  youth: msg({ message: 'Youth', context: 'one guest' }),
  child: msg`Child`,
  infant: msg`Infant`
};

export { guestAgeGroupLabels };
