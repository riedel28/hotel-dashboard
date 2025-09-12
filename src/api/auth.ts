import { authResponseSchema, type LoginData } from '@/lib/schemas';
import { client, handleApiError } from './client';

async function login(user: LoginData) {
  try {
    const response = await client.post('/auth/login', user);
    return authResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'login');
  }
}

export { login };
