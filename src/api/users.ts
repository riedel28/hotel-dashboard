import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import { ApiError, client, handleApiError } from '@/api/client';

import {
  type CreateUserData,
  type FetchUsersParams,
  fetchUsersParamsSchema,
  type FetchUsersResponse,
  fetchUsersResponseSchema,
  type InviteUserData,
  type Role,
  roleSchema,
  type UpdateUserData,
  type User,
  userSchema
} from '../../shared/types/users';

function usersQueryOptions(params: FetchUsersParams) {
  return queryOptions({
    queryKey: ['users', 'list', params],
    queryFn: () => fetchUsers(params),
    placeholderData: keepPreviousData
  });
}

function userQueryOptions(id: number) {
  return queryOptions({
    queryKey: ['users', 'user', id],
    queryFn: () => fetchUserById(id),
    // A missing user stays missing
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 3
  });
}

async function fetchUsers(
  params: FetchUsersParams
): Promise<FetchUsersResponse> {
  try {
    const { role, ...rest } = fetchUsersParamsSchema.parse(params);
    const response = await client.get('/users', {
      params: {
        ...rest,
        role: role?.length ? role.join(',') : undefined
      }
    });
    return fetchUsersResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchUsers');
  }
}

async function fetchUserById(id: number): Promise<User> {
  try {
    const response = await client.get(`/users/${id}`);
    return userSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchUserById');
  }
}

async function updateUserById(
  id: number,
  updates: UpdateUserData
): Promise<User> {
  try {
    const response = await client.patch(`/users/${id}`, updates);
    return userSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'updateUserById');
  }
}

async function deleteUserById(id: number): Promise<User> {
  try {
    const response = await client.delete(`/users/${id}`);
    return userSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'deleteUserById');
  }
}

async function createUser(data: CreateUserData): Promise<User> {
  try {
    const response = await client.post('/users', data);
    return userSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'createUser');
  }
}

async function inviteUser(data: InviteUserData): Promise<User> {
  try {
    const response = await client.post('/users/invite', data);
    return userSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'inviteUser');
  }
}

async function resendInvitation(userId: number): Promise<{ message: string }> {
  try {
    const response = await client.post(`/users/invite/${userId}/resend`);
    return response.data;
  } catch (err) {
    handleApiError(err, 'resendInvitation');
  }
}

export {
  type CreateUserData,
  createUser,
  deleteUserById,
  type FetchUsersParams,
  type FetchUsersResponse,
  fetchUserById,
  fetchUsers,
  fetchUsersParamsSchema,
  fetchUsersResponseSchema,
  type InviteUserData,
  inviteUser,
  type Role,
  resendInvitation,
  roleSchema,
  type UpdateUserData,
  type User,
  updateUserById,
  userQueryOptions,
  userSchema,
  usersQueryOptions
};
