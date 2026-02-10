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

async function logout() {
  try {
    await client.post('/auth/logout');
  } catch (err) {
    handleApiError(err, 'logout');
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

interface SignUpData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

async function signUp(data: SignUpData): Promise<{ message: string }> {
  try {
    const response = await client.post('/auth/sign-up', data);
    return response.data;
  } catch (err) {
    handleApiError(err, 'signUp');
  }
}

async function verifyEmail(token: string): Promise<{ message: string }> {
  try {
    const response = await client.post('/auth/verify-email', { token });
    return response.data;
  } catch (err) {
    handleApiError(err, 'verifyEmail');
  }
}

async function resendVerification(email: string): Promise<{ message: string }> {
  try {
    const response = await client.post('/auth/resend-verification', { email });
    return response.data;
  } catch (err) {
    handleApiError(err, 'resendVerification');
  }
}

interface AcceptInvitationData {
  token: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

async function acceptInvitation(
  data: AcceptInvitationData
): Promise<{ message: string }> {
  try {
    const response = await client.post('/auth/accept-invitation', data);
    return response.data;
  } catch (err) {
    handleApiError(err, 'acceptInvitation');
  }
}

async function forgotPassword(email: string): Promise<{ message: string }> {
  try {
    const response = await client.post('/auth/forgot-password', { email });
    return response.data;
  } catch (err) {
    handleApiError(err, 'forgotPassword');
  }
}

async function resetPassword(
  token: string,
  password: string
): Promise<{ message: string }> {
  try {
    const response = await client.post('/auth/reset-password', {
      token,
      password
    });
    return response.data;
  } catch (err) {
    handleApiError(err, 'resetPassword');
  }
}

export {
  acceptInvitation,
  forgotPassword,
  login,
  logout,
  register,
  resendVerification,
  resetPassword,
  signUp,
  updateSelectedProperty,
  verifyEmail
};
