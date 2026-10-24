'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsService, CreateReservationDto } from '../services/reservations.service';
import { useTenantStore } from '@/stores/tenant-store';

export function useReservations() {
  const queryClient = useQueryClient();
  const { currentTenantId } = useTenantStore();

  const reservationsQuery = useQuery({
    queryKey: ['reservations', currentTenantId],
    queryFn: () => reservationsService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateReservationDto) => reservationsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });

  const checkInMutation = useMutation({
    mutationFn: (bookingId: string) => reservationsService.checkIn(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (bookingId: string) => reservationsService.checkOut(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  return {
    reservations: reservationsQuery.data || [],
    isLoading: reservationsQuery.isLoading,
    error: reservationsQuery.error,
    createReservation: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    checkIn: checkInMutation.mutateAsync,
    isCheckingIn: checkInMutation.isPending,
    checkOut: checkOutMutation.mutateAsync,
    isCheckingOut: checkOutMutation.isPending,
  };
}
