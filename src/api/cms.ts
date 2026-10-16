import { queryOptions } from '@tanstack/react-query';
import {
  type CmsNode,
  cmsNodeSchema,
  type CreateCmsNodeData,
  fetchCmsNodesResponseSchema,
  type MoveCmsNodeData,
  type SaveCmsNodeData
} from 'shared/types/cms';

import { client, handleApiError } from './client';
import { uploadImage } from './images';

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

const uploadCmsImage = (file: File) => uploadImage('/cms/images', file);

export {
  cmsNodesQueryOptions,
  createCmsNode,
  deleteCmsNode,
  duplicateCmsNode,
  moveCmsNode,
  saveCmsNode,
  setCmsNodeVisibility,
  uploadCmsImage
};
