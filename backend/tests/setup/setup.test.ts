import { createTestUser } from '../helpers/db-helpers';

describe('Test Setup Verification', () => {
  test('should connect to test database', async () => {
    const { user, token } = await createTestUser();

    expect(user).toBeDefined();
    expect(user.email).toContain('@example.com');
    expect(token).toBeDefined();
  });
});
