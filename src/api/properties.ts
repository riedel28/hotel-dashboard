import {
  keepPreviousData,
  type QueryClient,
  queryOptions
} from '@tanstack/react-query';
import {
  type CreatePropertyData,
  createPropertySchema,
  type FetchPropertiesParams,
  fetchPropertiesResponseSchema,
  type NavItemId,
  type Property,
  propertySchema,
  type UpdatePropertyData,
  updatePropertySchema
} from 'shared/types/properties';

import { ApiError, client, handleApiError } from './client';

export function propertiesQueryOptions(params?: FetchPropertiesParams) {
  return queryOptions({
    queryKey: ['properties', params ?? {}],
    queryFn: () => fetchProperties(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5 // 5 minutes (matches default QueryClient config)
  });
}

/**
 * The list behind the property selector: every Property rather than one page
 * of the admin table.
 */
export function selectablePropertiesQueryOptions() {
  // ponytail: the API's largest page; paginate or search server-side once
  // there are more than 100 Properties.
  return propertiesQueryOptions({ per_page: 100 });
}

async function fetchProperties(params?: FetchPropertiesParams) {
  try {
    const response = await client.get('/properties', {
      params: {
        ...params,
        stage: params?.stage?.join(',') || undefined,
        options: params?.options?.join(',') || undefined
      }
    });
    return fetchPropertiesResponseSchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchProperties');
  }
}

function propertyByIdQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['properties', id],
    queryFn: () => fetchPropertyById(id)
  });
}

async function fetchPropertyById(id: string): Promise<Property> {
  try {
    const response = await client.get(`/properties/${id}`);
    return propertySchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'fetchPropertyById');
  }
}

/**
 * The nav items switched off for a Property. None when no Property is selected
 * or it has since been deleted (404); any other failure propagates — treating
 * it as "nothing disabled" would open switched-off pages on a transient error.
 */
async function fetchDisabledNavItems(
  queryClient: QueryClient,
  propertyId: string | null | undefined
): Promise<NavItemId[]> {
  if (!propertyId) return [];
  try {
    const property = await queryClient.fetchQuery(
      propertyByIdQueryOptions(propertyId)
    );
    return property.disabled_nav_items;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return [];
    throw error;
  }
}

async function updatePropertyById(
  id: string,
  updates: UpdatePropertyData
): Promise<Property> {
  try {
    const validatedData = updatePropertySchema.parse(updates);
    const response = await client.patch(`/properties/${id}`, validatedData);
    return propertySchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'updatePropertyById');
  }
}

async function createProperty(data: CreatePropertyData): Promise<Property> {
  try {
    const validatedData = createPropertySchema.parse(data);
    const response = await client.post('/properties', validatedData);
    return propertySchema.parse(response.data);
  } catch (err) {
    handleApiError(err, 'createProperty');
  }
}

async function deletePropertyById(id: string): Promise<void> {
  try {
    await client.delete(`/properties/${id}`);
  } catch (err) {
    handleApiError(err, 'deletePropertyById');
  }
}

export {
  createProperty,
  deletePropertyById,
  fetchDisabledNavItems,
  fetchProperties,
  fetchPropertyById,
  propertyByIdQueryOptions,
  updatePropertyById
};
