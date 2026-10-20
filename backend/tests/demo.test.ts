import request from 'supertest';

import { DEMO_EMAIL, DEMO_FORBIDDEN } from '../../shared/demo';
import app from '../src/app';
import { createTestUser } from './helpers/db-helpers';

describe('Demo account', () => {
  let demoToken: string;
  let demoId: number;
  let otherId: number;
  let otherEmail: string;

  beforeEach(async () => {
    const demo = await createTestUser({ email: DEMO_EMAIL, is_admin: true });
    demoToken = demo.token;
    demoId = demo.user.id;
    const other = await createTestUser();
    otherId = other.user.id;
    otherEmail = other.user.email;
  });

  const as = (req: request.Test) =>
    req.set('Authorization', `Bearer ${demoToken}`);

  test.each([
    ['post', '/api/auth/change-password'],
    ['post', '/api/two-factor/setup'],
    ['post', '/api/two-factor/enable'],
    ['post', '/api/two-factor/disable'],
    ['post', '/api/users/invite'],
    ['post', '/api/users/invite/1/resend']
  ] as const)('refuses %s %s', async (method, url) => {
    const response = await as(request(app)[method](url)).send({}).expect(403);
    expect(response.body.code).toBe(DEMO_FORBIDDEN);
  });

  test('may not edit or delete itself', async () => {
    await as(request(app).patch(`/api/users/${demoId}`))
      .send({ is_admin: false })
      .expect(403);
    await as(request(app).delete(`/api/users/${demoId}`)).expect(403);
  });

  test("may not change another user's email", async () => {
    await as(request(app).patch(`/api/users/${otherId}`))
      .send({ email: 'someone@elsewhere.test' })
      .expect(403);
  });

  test('may edit other users otherwise', async () => {
    await as(request(app).patch(`/api/users/${otherId}`))
      .send({ email: otherEmail, first_name: 'Renamed' })
      .expect(200);
    await as(request(app).delete(`/api/users/${otherId}`)).expect(200);
  });
});
