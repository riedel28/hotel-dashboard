import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import {
  type CreateCustomerData,
  createCustomerSchema,
  type Customer,
  type CustomerDetail,
  customerDetailSchema,
  customerSchema,
  type FetchCustomersParams,
  fetchCustomersResponseSchema,
  type UpdateCustomerData,
  updateCustomerSchema
} from 'shared/types/customers';

import { client, handleApiError } from './client';

function customersQueryOptions(params?: FetchCustomersParams) {
  return queryOptions({
    queryKey: ['customers', params ?? {}],
    queryFn: () => fetchCustomers(params),
    placeholderData: keepPreviousData
  });
}

async function fetchCustomers(params?: FetchCustomersParams) {
  try {
    const response = await client.get('/customers', { params });
    return fetchCustomersResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchCustomers');
  }
}

function customerByIdQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['customers', id],
    queryFn: () => fetchCustomerById(id)
  });
}

async function fetchCustomerById(id: string): Promise<CustomerDetail> {
  try {
    const response = await client.get(`/customers/${id}`);
    return customerDetailSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchCustomerById');
  }
}

async function createCustomer(data: CreateCustomerData): Promise<Customer> {
  try {
    const validatedData = createCustomerSchema.parse(data);
    const response = await client.post('/customers', validatedData);
    return customerSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'createCustomer');
  }
}

async function updateCustomerById(
  id: string,
  updates: UpdateCustomerData
): Promise<Customer> {
  try {
    const validatedData = updateCustomerSchema.parse(updates);
    const response = await client.patch(`/customers/${id}`, validatedData);
    return customerSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'updateCustomerById');
  }
}

export {
  createCustomer,
  customerByIdQueryOptions,
  customersQueryOptions,
  updateCustomerById
};
