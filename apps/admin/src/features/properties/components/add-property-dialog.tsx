'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Hotel, MapPin, Mail, Phone, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProperties } from '../hooks/use-properties';

const propertySchema = z.object({
  name: z.string().min(2, 'Hotel name is required'),
  address: z.string().min(2, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  starRating: z.coerce.number().min(1).max(5).default(1),
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
      name: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: '',
      starRating: 1,
    },
  });

  const onSubmit = async (data: PropertyFormData) => {
    try {
      await createProperty({
        ...data,
        email: data.email || undefined,
      });
      reset();
      setOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="glow" size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add New Hotel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hotel className="w-5 h-5 text-emerald-400" /> Add New Hotel Property
          </DialogTitle>
          <DialogDescription>
            Register a hotel property directly into the active multi-tenant database.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Hotel Name *</label>
            <Input placeholder="e.g. Grand Palace Dhaka" {...register('name')} />
            {errors.name && <p className="text-[11px] text-rose-400">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">City *</label>
              <Input placeholder="Dhaka" {...register('city')} />
              {errors.city && <p className="text-[11px] text-rose-400">{errors.city.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Country *</label>
              <Input placeholder="Bangladesh" {...register('country')} />
              {errors.country && <p className="text-[11px] text-rose-400">{errors.country.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Street Address *</label>
            <Input placeholder="124 Gulshan Avenue, Dhaka" {...register('address')} />
            {errors.address && <p className="text-[11px] text-rose-400">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Contact Phone</label>
              <Input placeholder="+880 1700-000000" {...register('phone')} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <Input placeholder="hotel@palace.com" {...register('email')} />
              {errors.email && <p className="text-[11px] text-rose-400">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Star Rating (1 - 5)</label>
            <Input type="number" min={1} max={5} {...register('starRating')} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating Property...
                </>
              ) : (
                'Save Property'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
