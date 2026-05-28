import api from '@/lib/api';
import type { Location, PaginatedResponse } from '@/types/api';
import type { LocationFormValues } from '../schema';

export async function getLocations(params: { page?: number; limit?: number }): Promise<PaginatedResponse<Location>> {
  const { data } = await api.get<PaginatedResponse<Location>>('/locations', { params });
  return data;
}

export async function createLocation(body: LocationFormValues): Promise<Location> {
  const { data } = await api.post<Location>('/locations', body);
  return data;
}

export async function updateLocation(id: string, body: Partial<LocationFormValues>): Promise<Location> {
  const { data } = await api.patch<Location>(`/locations/${id}`, body);
  return data;
}

export async function deleteLocation(id: string): Promise<void> {
  await api.delete(`/locations/${id}`);
}
