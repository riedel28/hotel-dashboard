import { Trans } from '@lingui/react/macro';

import type { NavSection } from '@/components/section-nav';

export { sectionHeadingId } from '@/components/section-nav';

/**
 * Single source of truth for the form's sections. The form renders one
 * `<section id={...} aria-labelledby={sectionHeadingId(id)}>` per entry and the
 * table of contents links to them by id.
 */
export const ADYEN_FORM_SECTIONS: NavSection[] = [
  { id: 'credentials', label: <Trans>Credentials</Trans> },
  { id: 'recipient', label: <Trans>Payment recipient</Trans> },
  { id: 'mapping', label: <Trans>Mapping codes</Trans> }
];
