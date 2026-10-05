import { queryOptions } from '@tanstack/react-query';

import { client, handleApiError } from '@/api/client';

import type {
  ChangePasswordData,
  RecoveryCodesResponse,
  TwoFactorSetupResponse,
  TwoFactorStatus,
  UpdateProfileData
} from '../../shared/types/profile';
import {
  recoveryCodesResponseSchema,
  twoFactorSetupResponseSchema,
  twoFactorStatusSchema
} from '../../shared/types/profile';
import { type User, userSchema } from '../../shared/types/users';

export const profileKeys = {
  me: ['profile', 'me'] as const,
  twoFactor: ['profile', 'two-factor'] as const
};

export function meQueryOptions() {
  return queryOptions({
    queryKey: profileKeys.me,
    queryFn: fetchMe
  });
}

export function twoFactorStatusQueryOptions() {
  return queryOptions({
    queryKey: profileKeys.twoFactor,
    queryFn: fetchTwoFactorStatus
  });
}

async function fetchMe(): Promise<User> {
  try {
    const response = await client.get('/users/me');
    return userSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchMe');
  }
}

async function updateMe(updates: UpdateProfileData): Promise<User> {
  try {
    const response = await client.patch('/users/me', updates);
    return userSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'updateMe');
  }
}

async function changePassword(
  data: ChangePasswordData
): Promise<{ message: string; other_sessions_signed_out: boolean }> {
  try {
    const response = await client.post('/auth/change-password', data);
    return response.data;
  } catch (err) {
    handleApiError(err, 'changePassword');
  }
}

/**
 * Every two-factor call takes an optional `current_password`: the server may
 * answer REAUTH_REQUIRED, and the client then replays the identical request
 * with the password filled in.
 */
interface Reauth {
  current_password?: string;
}

async function startTwoFactorSetup(
  reauth: Reauth = {}
): Promise<TwoFactorSetupResponse> {
  try {
    const response = await client.post('/two-factor/setup', reauth);
    return twoFactorSetupResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'startTwoFactorSetup');
  }
}

async function enableTwoFactor(
  code: string,
  reauth: Reauth = {}
): Promise<RecoveryCodesResponse> {
  try {
    const response = await client.post('/two-factor/enable', {
      ...reauth,
      code
    });
    return recoveryCodesResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'enableTwoFactor');
  }
}

async function disableTwoFactor(
  code: string,
  reauth: Reauth = {}
): Promise<{ message: string }> {
  try {
    const response = await client.post('/two-factor/disable', {
      ...reauth,
      code
    });
    return response.data;
  } catch (err) {
    handleApiError(err, 'disableTwoFactor');
  }
}

async function regenerateRecoveryCodes(
  reauth: Reauth = {}
): Promise<RecoveryCodesResponse> {
  try {
    const response = await client.post('/two-factor/recovery-codes', reauth);
    return recoveryCodesResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'regenerateRecoveryCodes');
  }
}

async function fetchTwoFactorStatus(): Promise<TwoFactorStatus> {
  try {
    const response = await client.get('/two-factor');
    return twoFactorStatusSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchTwoFactorStatus');
  }
}

export {
  changePassword,
  disableTwoFactor,
  enableTwoFactor,
  fetchMe,
  fetchTwoFactorStatus,
  regenerateRecoveryCodes,
  startTwoFactorSetup,
  updateMe
};
