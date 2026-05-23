import { beforeEach } from 'vitest';

import { cleanupDatabase } from '../helpers/db-helpers';

beforeEach(async () => {
  await cleanupDatabase();
});
