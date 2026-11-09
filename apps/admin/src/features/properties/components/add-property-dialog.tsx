'use client';
import { BeatLoader } from 'react-spinners';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Hotel, MapPin, Mail, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProperties } from '../hooks/use-properties';
import { showAlert } from '@/lib/sweetalert';

const propertySchema = z.object({
  name: z.string().min(2, 'Hotel name is required'),
  address: z.string().min(2, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  starRating: z.coerce.number().min(1).max(5).default(4),
  phone: z.string().optional(),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export function AddPropertyDialog() {
  const [open, setOpen] = useState(false);
  const { createProperty, isCreating } = useProperties();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: {
      country: 'Bangladesh',
      starRating: 4,
    },
  });

  const onSubmit = async (data: PropertyFormData) => {
    try {
      await createProperty({
        ...data,
        code: (data.name || 'HTL').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() + Math.floor(100 + Math.random() * 900),
        email: data.email || undefined,
      });
      reset();
      setOpen(false);
      await showAlert({
        title: 'Success!',
        text: 'Hotel property added successfully.',
        icon: 'success',
      });
    } catch (e: any) {
      console.error(e);
      await showAlert({
        title: 'Registration Error',
        text: e?.message || 'Error registering property. Please try again.',
        icon: 'error',
      });
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 h-8 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
      >
        <Plus className="w-4 h-4" /> Add New Hotel
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-blue-400" /> Add New Hotel Property
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Register a hotel property directly into the active multi-tenant database.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Hotel Name *</label>
                <Input placeholder="e.g. Grand Palace Dhaka" {...register('name')} />
                {errors.name && <p className="text-[11px] text-rose-500 font-medium">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">City *</label>
                  <Input placeholder="Dhaka" {...register('city')} />
                  {errors.city && <p className="text-[11px] text-rose-500 font-medium">{errors.city.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Country *</label>
                  <Input placeholder="Bangladesh" {...register('country')} />
                  {errors.country && <p className="text-[11px] text-rose-500 font-medium">{errors.country.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Street Address *</label>
                <Input placeholder="124 Gulshan Avenue, Dhaka" {...register('address')} />
                {errors.address && <p className="text-[11px] text-rose-500 font-medium">{errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Contact Phone</label>
                  <Input placeholder="+880 1700-000000" {...register('phone')} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Email Address</label>
                  <Input placeholder="hotel@palace.com" {...register('email')} />
                  {errors.email && <p className="text-[11px] text-rose-500 font-medium">{errors.email.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Star Rating (1 - 5)</label>
                <Input type="number" min={1} max={5} {...register('starRating')} />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  {isCreating ? (
                    <>
                      <BeatLoader color="currentColor" size={8} speedMultiplier={1.2} className="mr-2" /> Creating Property...
                    </>
                  ) : (
                    'Save Property'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
