import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import { ApiError, client, handleApiError } from '@/api/client';

import {
  type FetchPaymentsParams,
  fetchPaymentsParamsSchema,
  type FetchPaymentsResponse,
  fetchPaymentsResponseSchema,
  type Payment,
  paymentSchema
} from '../../shared/types/payments';

// Callers name only the filters they care about; the schema fills in paging
// and sorting defaults.
type PaymentsQuery = Partial<FetchPaymentsParams>;

function paymentsQueryOptions(params: PaymentsQuery) {
  return queryOptions({
    queryKey: ['payments', params],
    queryFn: () => fetchPayments(params),
    placeholderData: keepPreviousData
  });
}

async function fetchPayments(
  params: PaymentsQuery
): Promise<FetchPaymentsResponse> {
  try {
    const response = await client.get('/payments', {
      params: fetchPaymentsParamsSchema.parse(params)
    });
    return fetchPaymentsResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchPayments');
  }
}

function paymentQueryOptions(id: number) {
  return queryOptions({
    queryKey: ['payments', 'payment', id],
    queryFn: () => fetchPayment(id),
    // A missing payment stays missing
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 3
  });
}

async function fetchPayment(id: number): Promise<Payment> {
  try {
    const response = await client.get(`/payments/${id}`);
    return paymentSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchPayment');
  }
}

export {
  fetchPaymentsParamsSchema,
  paymentQueryOptions,
  type PaymentsQuery,
  paymentsQueryOptions
};
