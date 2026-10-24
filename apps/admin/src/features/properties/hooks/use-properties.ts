'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesService, CreatePropertyDto } from '../services/properties.service';
import { useTenantStore } from '@/stores/tenant-store';

export function useProperties() {
  const queryClient = useQueryClient();
  const { currentTenantId } = useTenantStore();

  const propertiesQuery = useQuery({
    queryKey: ['properties', currentTenantId],
    queryFn: () => propertiesService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreatePropertyDto) => propertiesService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertiesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  return {
    properties: propertiesQuery.data || [],
    isLoading: propertiesQuery.isLoading,
    error: propertiesQuery.error,
    createProperty: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteProperty: deleteMutation.mutateAsync,
  };
}
