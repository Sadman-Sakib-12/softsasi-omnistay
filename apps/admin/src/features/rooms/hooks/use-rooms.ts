'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsService, CreateRoomDto } from '../services/rooms.service';
import { useTenantStore } from '@/stores/tenant-store';

export function useRooms() {
  const queryClient = useQueryClient();
  const { currentTenantId, currentPropertyId } = useTenantStore();

  const roomsQuery = useQuery({
    queryKey: ['rooms', currentTenantId, currentPropertyId],
    queryFn: () => roomsService.getAll(currentPropertyId || undefined),
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateRoomDto) => roomsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roomsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  return {
    rooms: roomsQuery.data || [],
    isLoading: roomsQuery.isLoading,
    error: roomsQuery.error,
    createRoom: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteRoom: deleteMutation.mutateAsync,
  };
}
