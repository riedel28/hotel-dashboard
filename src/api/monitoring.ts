import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { client, handleApiError } from '@/api/client';

import {
  type FetchMonitoringLogsParams,
  type FetchMonitoringLogsResponse,
  fetchMonitoringLogsParamsSchema,
  fetchMonitoringLogsResponseSchema
} from '../../shared/types/monitoring';

function monitoringQueryOptions({
  page,
  per_page,
  status,
  type,
  q,
  from,
  to,
  sort_by,
  sort_order
}: FetchMonitoringLogsParams) {
  return queryOptions({
    queryKey: [
      'monitoring',
      page,
      per_page,
      status,
      type,
      q,
      from,
      to,
      sort_by,
      sort_order
    ],
    queryFn: () =>
      fetchMonitoringLogs({
        page,
        per_page,
        status,
        type,
        q,
        from,
        to,
        sort_by,
        sort_order
      }),
    placeholderData: keepPreviousData
  });
}

async function fetchMonitoringLogs(
  params: FetchMonitoringLogsParams
): Promise<FetchMonitoringLogsResponse> {
  try {
    const validatedParams = fetchMonitoringLogsParamsSchema.parse(params);
    const response = await client.get('/monitoring', {
      params: validatedParams
    });
    return fetchMonitoringLogsResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchMonitoringLogs');
  }
}

export {
  fetchMonitoringLogs,
  monitoringQueryOptions,
  fetchMonitoringLogsParamsSchema
};

