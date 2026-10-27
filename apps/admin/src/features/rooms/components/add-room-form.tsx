'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Image as ImageIcon, Upload, Loader2, X, Plus } from 'lucide-react';
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
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const featureInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema) as any,
    defaultValues: {
      name: '',
      pricePerNight: 0,
      numberOfBeds: 1,
    },
  });

  const handleFeatureImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newUrls = Array.from(files).map((f) => URL.createObjectURL(f));
      setGalleryPreviews((prev) => [...prev, ...newUrls]);
    }
  };

  const onSubmit = async (data: RoomFormData) => {
    try {
      await createRoom({
        ...data,
        roomNumber: data.roomNumber || data.name,
      });
      reset();
      setImagePreview(null);
      setGalleryPreviews([]);
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
          <input
            type="file"
            accept="image/*"
            ref={featureInputRef}
            onChange={handleFeatureImageChange}
            className="hidden"
          />
          <div className="border border-dashed border-slate-200 rounded p-4 text-center bg-slate-50/40 relative">
            {imagePreview ? (
              <div className="relative inline-block mb-2">
                <img
                  src={imagePreview}
                  alt="Feature Preview"
                  className="w-24 h-20 object-cover rounded border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 shadow-sm hover:bg-rose-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-16 h-16 mx-auto mb-2 bg-white border border-slate-200 rounded flex items-center justify-center text-slate-300">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}
            <div>
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#00a8ff] hover:bg-[#0097e6] rounded transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                onClick={() => featureInputRef.current?.click()}
              >
                <Upload className="w-3 h-3" />
                {imagePreview ? 'Change image' : 'Upload image'}
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Select Images Button Matching Figure 3.1 */}
        <div className="space-y-1">
          <label className="block text-slate-700 font-semibold">Gallery</label>
          <input
            type="file"
            multiple
            accept="image/*"
            ref={galleryInputRef}
            onChange={handleGalleryChange}
            className="hidden"
          />
          <div className="space-y-2">
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#00b894] hover:bg-[#00a383] rounded transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
              onClick={() => galleryInputRef.current?.click()}
            >
              <Plus className="w-3 h-3" />
              Select images
            </button>

            {galleryPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {galleryPreviews.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt={`Gallery ${idx + 1}`}
                      className="w-14 h-12 object-cover rounded border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 shadow-sm hover:bg-rose-600 cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
