import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import type { EventCategory } from 'shared/types/events';

// Labels are lazy `msg` descriptors, resolved with `t(label)` at render.
export const eventCategoryLabels: Record<EventCategory, MessageDescriptor> = {
  music: msg`Music`,
  party: msg`Party`,
  food_drink: msg`Food & drink`,
  wellness: msg`Wellness`,
  kids: msg`Kids`,
  sports: msg`Sports`,
  culture: msg`Culture`,
  tour: msg`Tour`,
  other: msg`Other`
};
