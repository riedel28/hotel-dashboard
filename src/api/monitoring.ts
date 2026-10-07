import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { client, handleApiError } from '@/api/client';

import {
  type FetchMonitoringLogsParams,
  fetchMonitoringLogsParamsSchema,
  type FetchMonitoringLogsResponse,
  fetchMonitoringLogsResponseSchema
} from '../../shared/types/monitoring';

function monitoringQueryOptions(params: FetchMonitoringLogsParams) {
  return queryOptions({
    queryKey: ['monitoring', params],
    queryFn: () => fetchMonitoringLogs(params),
    placeholderData: keepPreviousData
  });
}

async function fetchMonitoringLogs(
  params: FetchMonitoringLogsParams
): Promise<FetchMonitoringLogsResponse> {
  try {
    const { type, from, to, ...rest } =
      fetchMonitoringLogsParamsSchema.parse(params);
    const response = await client.get('/monitoring', {
      params: {
        ...rest,
        type: type?.length ? type.join(',') : undefined,
        // The range is picked in whole days of the viewer's time zone
        from: from && dayjs(from).startOf('day').toISOString(),
        to: to && dayjs(to).endOf('day').toISOString()
      }
    });
    return fetchMonitoringLogsResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchMonitoringLogs');
  }
}

export {
  fetchMonitoringLogs,
  fetchMonitoringLogsParamsSchema,
  monitoringQueryOptions
};
