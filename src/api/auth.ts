import { authResponseSchema, type LoginData, type RegisterData } from '@/lib/schemas';
import { client, handleApiError } from './client';

async function login(user: LoginData) {
  try {
    const response = await client.post('/auth/login', user);
    return authResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'login');
  }
}

async function register(user: RegisterData) {
  try {
    const response = await client.post('/auth/register', user);
    return authResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'register');
  }
}

export { login, register };
