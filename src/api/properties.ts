import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import {
  type CreatePropertyData,
  createPropertySchema,
  type FetchPropertiesParams,
  fetchPropertiesResponseSchema,
  type Property,
  propertySchema,
  type UpdatePropertyData,
  updatePropertySchema
} from 'shared/types/properties';
import { client, handleApiError } from './client';

export function propertiesQueryOptions(params?: FetchPropertiesParams) {
  return queryOptions({
    queryKey: ['properties', params ?? {}],
    queryFn: () => fetchProperties(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5 // 5 minutes (matches default QueryClient config)
  });
}

async function fetchProperties(params?: FetchPropertiesParams) {
  try {
    const response = await client.get('/properties', { params });
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
  fetchProperties,
  fetchPropertyById,
  updatePropertyById,
  deletePropertyById,
  propertyByIdQueryOptions
};
