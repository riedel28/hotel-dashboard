import { msg } from '@lingui/core/macro';

import type { TestConnectionStep } from '@/components/provider-setup/test-connection-dialog';

/** What a connection test of a property management system checks. */
export const PMS_TEST_STEPS: TestConnectionStep[] = [
  {
    id: 'reach',
    name: msg`Reach the API`,
    error: msg`Could not reach the API — request timed out after 5000 ms.`
  },
  {
    id: 'auth',
    name: msg`Authenticate credentials`,
    error: msg`401 Unauthorized — the credentials were rejected.`
  },
  {
    id: 'property',
    name: msg`Fetch property`,
    error: msg`Property not found — check its ID.`
  }
];
