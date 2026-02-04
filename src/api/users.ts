import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import { client, handleApiError } from '@/api/client';

import {
  type CreateUserData,
  type FetchUsersParams,
  type FetchUsersResponse,
  fetchUsersParamsSchema,
  fetchUsersResponseSchema,
  type Role,
  roleSchema,
  type UpdateUserData,
  type User,
  userSchema
} from '../../shared/types/users';

function usersQueryOptions({
  page,
  per_page,
  q,
  sort_by,
  sort_order
}: FetchUsersParams) {
  return queryOptions({
    queryKey: ['users', page, per_page, q, sort_by, sort_order],
    queryFn: () =>
      fetchUsers({
        page,
        per_page,
        q,
        sort_by,
        sort_order
      }),
    placeholderData: keepPreviousData
  });
}

async function fetchUsers(
  params: FetchUsersParams
): Promise<FetchUsersResponse> {
  try {
    const validatedParams = fetchUsersParamsSchema.parse(params);
    const response = await client.get('/users', {
      params: validatedParams
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

export {
  fetchUsers,
  fetchUserById,
  createUser,
  updateUserById,
  deleteUserById,
  fetchUsersParamsSchema,
  fetchUsersResponseSchema,
  roleSchema,
  userSchema,
  usersQueryOptions,
  type User,
  type Role,
  type FetchUsersParams,
  type FetchUsersResponse,
  type CreateUserData,
  type UpdateUserData
};
