'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BedDouble, DollarSign, Users, Calendar, Loader2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useRooms } from '../hooks/use-rooms';
import { useProperties } from '@/features/properties/hooks/use-properties';

const roomSchema = z.object({
  name: z.string().min(2, 'Room title is required (e.g. Deluxe Suite)'),
  roomNumber: z.string().min(1, 'Room number/code is required (e.g. 101)'),
  roomType: z.string().min(1, 'Room category is required'),
  pricePerNight: z.coerce.number().min(1, 'Valid price per night is required'),
  numberOfBeds: z.coerce.number().min(1, 'Number of beds must be at least 1'),
  minStay: z.coerce.number().min(1).default(1),
  maxStay: z.coerce.number().min(1).default(30),
  propertyId: z.string().optional(),
});

type RoomFormData = z.infer<typeof roomSchema>;

export function AddRoomForm() {
  const { createRoom, isCreating } = useRooms();
  const { properties } = useProperties();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema) as any,
    defaultValues: {
      roomType: 'Deluxe Suite',
      pricePerNight: 150,
      numberOfBeds: 1,
      minStay: 1,
      maxStay: 30,
    },
  });

  const onSubmit = async (data: RoomFormData) => {
    try {
      await createRoom(data);
      reset();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-400" /> Add Room Unit
        </CardTitle>
        <CardDescription>
          Create and assign inventory units to your hotel property.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Hotel Property Selector */}
          {properties.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Assign to Property</label>
              <select
                {...register('propertyId')}
                className="w-full h-10 rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/80"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Room Name / Label *</label>
            <Input placeholder="e.g. Presidential King Suite" {...register('name')} />
            {errors.name && <p className="text-[11px] text-rose-400">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Room Number *</label>
              <Input placeholder="101" {...register('roomNumber')} />
              {errors.roomNumber && <p className="text-[11px] text-rose-400">{errors.roomNumber.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Category / Type</label>
              <Input placeholder="Suite" {...register('roomType')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Price / Night ($) *</label>
              <Input type="number" step="0.01" icon={<DollarSign className="w-3.5 h-3.5" />} {...register('pricePerNight')} />
              {errors.pricePerNight && (
                <p className="text-[11px] text-rose-400">{errors.pricePerNight.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Beds Quantity *</label>
              <Input type="number" min={1} icon={<BedDouble className="w-3.5 h-3.5" />} {...register('numberOfBeds')} />
              {errors.numberOfBeds && (
                <p className="text-[11px] text-rose-400">{errors.numberOfBeds.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Min Stay (Nights)</label>
              <Input type="number" min={1} {...register('minStay')} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Max Stay (Nights)</label>
              <Input type="number" min={1} {...register('maxStay')} />
            </div>
          </div>

          <Button type="submit" variant="glow" className="w-full mt-2" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving Room...
              </>
            ) : (
              'Save Room Unit'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
