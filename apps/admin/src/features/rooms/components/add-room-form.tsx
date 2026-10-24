'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { useRooms } from '../hooks/use-rooms';
import { useProperties } from '@/features/properties/hooks/use-properties';

const roomSchema = z.object({
  name: z.string().min(2, 'Room name is required'),
  roomNumber: z.string().optional(),
  pricePerNight: z.coerce.number().min(1, 'Price is required'),
  numberOfBeds: z.coerce.number().min(1).default(1),
  minStay: z.coerce.number().optional(),
  propertyId: z.string().optional(),
});

type RoomFormData = z.infer<typeof roomSchema>;

export function AddRoomForm() {
  const { createRoom, isCreating } = useRooms();
  const { properties } = useProperties();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema) as any,
    defaultValues: {
      name: '',
      pricePerNight: 350,
      numberOfBeds: 1,
    },
  });

  const onSubmit = async (data: RoomFormData) => {
    try {
      await createRoom({
        ...data,
        roomNumber: data.roomNumber || String(Math.floor(100 + Math.random() * 900)),
        roomType: 'Standard Room',
      });
      reset();
      setImagePreview(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded shadow-2xs p-5">
      <h2 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 mb-4">
        Add Room
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
        {/* Property Selector if multiple properties exist */}
        {properties.length > 0 && (
          <div className="space-y-1">
            <label className="block text-slate-700 font-semibold">Select Hotel</label>
            <select
              {...register('propertyId')}
              className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:border-blue-500"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Room Name * */}
        <div className="space-y-1">
          <label className="block text-slate-700 font-semibold">
            Room Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Room name"
            {...register('name')}
            className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
          />
          {errors.name && (
            <p className="text-[11px] text-rose-500">{errors.name.message}</p>
          )}
        </div>

        {/* Feature Image Upload Matching Figure 3.1 */}
        <div className="space-y-1">
          <label className="block text-slate-700 font-semibold">Feature Image</label>
          <div className="border border-dashed border-slate-200 rounded p-4 text-center bg-slate-50/40">
            <div className="w-16 h-16 mx-auto mb-2 bg-white border border-slate-200 rounded flex items-center justify-center text-slate-300">
              <ImageIcon className="w-8 h-8" />
            </div>
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#00a8ff] hover:bg-[#0097e6] rounded transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
              onClick={() => alert('Feature image selector opened')}
            >
              <Upload className="w-3 h-3" />
              Upload image
            </button>
          </div>
        </div>

        {/* Gallery Select Images Button Matching Figure 3.1 */}
        <div className="space-y-1">
          <label className="block text-slate-700 font-semibold">Gallery</label>
          <div>
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#00b894] hover:bg-[#00a383] rounded transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
              onClick={() => alert('Gallery selector opened')}
            >
              Select images
            </button>
          </div>
        </div>

        {/* Price * & Number of room * Matching Figure 3.1 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-slate-700 font-semibold">
              Price <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              placeholder="Price"
              {...register('pricePerNight')}
              className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
            {errors.pricePerNight && (
              <p className="text-[11px] text-rose-500">{errors.pricePerNight.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-slate-700 font-semibold">
              Number of room <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              placeholder="1"
              min={1}
              {...register('numberOfBeds')}
              className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Minimum day stay requirements Matching Figure 3.1 */}
        <div className="space-y-1">
          <label className="block text-slate-700 font-semibold">
            Minimum day stay requirements
          </label>
          <input
            type="number"
            placeholder="Ex: 2"
            min={1}
            {...register('minStay')}
            className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
          />
          <p className="text-[10px] text-slate-400">
            Leave blank if you dont need to set minimum day stay option
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isCreating}
            className="w-full h-9 px-4 text-xs font-semibold text-white bg-[#00a8ff] hover:bg-[#0097e6] rounded transition-colors shadow-2xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Saving Room...
              </>
            ) : (
              'Save Room'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
