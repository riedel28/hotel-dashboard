import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { ApiError, client, handleApiError } from '@/api/client';

import {
  type FetchMonitoringLogsParams,
  fetchMonitoringLogsParamsSchema,
  type FetchMonitoringLogsResponse,
  fetchMonitoringLogsResponseSchema,
  type MonitoringLog,
  monitoringLogSchema
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

function monitoringLogQueryOptions(id: number) {
  return queryOptions({
    queryKey: ['monitoring', 'log', id],
    queryFn: () => fetchMonitoringLog(id),
    // A missing log stays missing
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 3
  });
}

async function fetchMonitoringLog(id: number): Promise<MonitoringLog> {
  try {
    const response = await client.get(`/monitoring/${id}`);
    return monitoringLogSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchMonitoringLog');
  }
}

export {
  fetchMonitoringLog,
  fetchMonitoringLogs,
  fetchMonitoringLogsParamsSchema,
  monitoringLogQueryOptions,
  monitoringQueryOptions
};
