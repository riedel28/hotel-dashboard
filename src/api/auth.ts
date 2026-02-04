import {
  authResponseSchema,
  type LoginData,
  type RegisterData,
  type User,
  userSchema
} from '@/lib/schemas';
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

async function updateSelectedProperty(
  propertyId: string | null
): Promise<User> {
  try {
    const response = await client.patch('/users/me/selected-property', {
      selected_property_id: propertyId
    });
    return userSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'updateSelectedProperty');
  }
}

export { login, register, updateSelectedProperty };
