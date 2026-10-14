import { queryOptions } from '@tanstack/react-query';
import {
  type CmsNode,
  cmsNodeSchema,
  type CreateCmsNodeData,
  fetchCmsNodesResponseSchema,
  type MoveCmsNodeData,
  type SaveCmsNodeData
} from 'shared/types/cms';
import { z } from 'zod';

import { client, handleApiError } from './client';

export type { CmsNode };

async function fetchCmsNodes(): Promise<CmsNode[]> {
  try {
    const response = await client.get('/cms/nodes');
    return fetchCmsNodesResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchCmsNodes');
  }
}

// Every node of the selected property, flat. Tree, editor and preview all
// read this one cache entry; structural changes refetch it.
const cmsNodesQueryOptions = queryOptions({
  queryKey: ['cms-nodes'] as const,
  queryFn: fetchCmsNodes
});

async function nodeRequest(
  context: string,
  request: () => Promise<{ data: unknown }>
): Promise<CmsNode> {
  try {
    return cmsNodeSchema.parse((await request()).data);
  } catch (err) {
    handleApiError(err, context);
  }
}

const createCmsNode = (data: CreateCmsNodeData) =>
  nodeRequest('createCmsNode', () => client.post('/cms/nodes', data));

const saveCmsNode = (id: number, data: SaveCmsNodeData) =>
  nodeRequest('saveCmsNode', () => client.put(`/cms/nodes/${id}`, data));

const moveCmsNode = (id: number, data: MoveCmsNodeData) =>
  nodeRequest('moveCmsNode', () => client.post(`/cms/nodes/${id}/move`, data));

const setCmsNodeVisibility = (id: number, hidden: boolean) =>
  nodeRequest('setCmsNodeVisibility', () =>
    client.patch(`/cms/nodes/${id}/visibility`, { hidden })
  );

const duplicateCmsNode = (id: number) =>
  nodeRequest('duplicateCmsNode', () =>
    client.post(`/cms/nodes/${id}/duplicate`)
  );

async function deleteCmsNode(id: number): Promise<void> {
  try {
    await client.delete(`/cms/nodes/${id}`);
  } catch (err) {
    handleApiError(err, 'deleteCmsNode');
  }
}

async function uploadCmsImage(file: File): Promise<string> {
  try {
    const body = new FormData();
    body.append('file', file);
    const response = await client.post('/cms/images', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60_000
    });
    return z.object({ id: z.uuid() }).parse(response.data).id;
  } catch (err) {
    handleApiError(err, 'uploadCmsImage');
  }
}

/** Where an uploaded image is served (publicly, for the app too). */
function cmsImageUrl(id: string) {
  return `${import.meta.env.VITE_API_BASE_URL}/cms/images/${id}`;
}

export {
  cmsImageUrl,
  cmsNodesQueryOptions,
  createCmsNode,
  deleteCmsNode,
  duplicateCmsNode,
  moveCmsNode,
  saveCmsNode,
  setCmsNodeVisibility,
  uploadCmsImage
};
