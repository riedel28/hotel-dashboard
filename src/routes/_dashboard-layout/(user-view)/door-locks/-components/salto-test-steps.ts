import { msg } from '@lingui/core/macro';

import type { TestConnectionStep } from '@/components/provider-setup/test-connection-dialog';

const TCP: TestConnectionStep = {
  id: 'tcp',
  name: msg`TCP connection`,
  error: msg`Connection timed out after 5000 ms — host unreachable.`
};
const AUTH: TestConnectionStep = {
  id: 'auth',
  name: msg`Authentication`,
  error: msg`401 Unauthorized — check username and password.`
};
const SHIP: TestConnectionStep = {
  id: 'ship',
  name: msg`SHIP handshake`,
  error: msg`SHIP handshake rejected: unsupported protocol version.`
};

/** What a connection test of SALTO checks, by how the locks are reached. */
export const SALTO_TEST_STEPS = {
  pms: [
    TCP,
    {
      id: 'handshake',
      name: msg`PMS interface handshake`,
      error: msg`No response from the PMS interface.`
    }
  ],
  stp: [TCP, AUTH, SHIP],
  https: [
    TCP,
    {
      id: 'tls',
      name: msg`TLS certificate`,
      error: msg`TLS handshake failed: certificate is self-signed or expired.`
    },
    AUTH,
    SHIP
  ]
} satisfies Record<string, TestConnectionStep[]>;
