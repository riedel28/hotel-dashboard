import { queryOptions } from '@tanstack/react-query';
import {
  fetchWorklogsResponseSchema,
  type Worklog,
  type WorklogMessageData,
  worklogMessageSchema,
  worklogSchema,
  type WorklogUser
} from 'shared/types/worklogs';

import { client, handleApiError } from './client';

export function worklogsQueryOptions(propertyId: string) {
  return queryOptions({
    queryKey: ['worklogs', propertyId],
    queryFn: () => fetchWorklogs(propertyId)
  });
}

async function fetchWorklogs(propertyId: string): Promise<Worklog[]> {
  try {
    const response = await client.get(`/properties/${propertyId}/worklogs`);
    return fetchWorklogsResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchWorklogs');
  }
}

async function createWorklog(
  propertyId: string,
  data: WorklogMessageData
): Promise<Worklog> {
  try {
    const validated = worklogMessageSchema.parse(data);
    const response = await client.post(
      `/properties/${propertyId}/worklogs`,
      validated
    );
    return worklogSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'createWorklog');
  }
}

async function updateWorklog(
  propertyId: string,
  worklogId: number,
  data: WorklogMessageData
): Promise<Worklog> {
  try {
    const validated = worklogMessageSchema.parse(data);
    const response = await client.patch(
      `/properties/${propertyId}/worklogs/${worklogId}`,
      validated
    );
    return worklogSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'updateWorklog');
  }
}

async function deleteWorklog(
  propertyId: string,
  worklogId: number
): Promise<void> {
  try {
    await client.delete(`/properties/${propertyId}/worklogs/${worklogId}`);
  } catch (err) {
    handleApiError(err, 'deleteWorklog');
  }
}

export {
  createWorklog,
  deleteWorklog,
  updateWorklog,
  type Worklog,
  type WorklogUser
};
