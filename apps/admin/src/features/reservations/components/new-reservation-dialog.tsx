'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Calendar, DollarSign, User, Mail, Phone, Loader2 } from 'lucide-react';
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
import { useReservations } from '../hooks/use-reservations';
import { useRooms } from '@/features/rooms/hooks/use-rooms';

const reservationSchema = z.object({
  guestName: z.string().min(2, 'Guest full name is required'),
  guestEmail: z.string().email('Valid email address is required'),
  guestPhone: z.string().optional(),
  checkInDate: z.string().min(1, 'Check-in date is required'),
  checkOutDate: z.string().min(1, 'Check-out date is required'),
  totalAmount: z.coerce.number().min(1, 'Total booking amount is required'),
  roomId: z.string().optional(),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

export function NewReservationDialog() {
  const [open, setOpen] = useState(false);
  const { createReservation, isCreating } = useReservations();
  const { rooms } = useRooms();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema) as any,
    defaultValues: {
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      totalAmount: 200,
    },
  });

  const onSubmit = async (data: ReservationFormData) => {
    try {
      await createReservation(data);
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
          <Plus className="w-4 h-4 mr-1" /> New Reservation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" /> New Guest Reservation
          </DialogTitle>
          <DialogDescription>
            Register a direct front-desk reservation into the active hotel folio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Guest Full Name *</label>
            <Input placeholder="John Doe" icon={<User className="w-4 h-4" />} {...register('guestName')} />
            {errors.guestName && <p className="text-[11px] text-rose-400">{errors.guestName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Guest Email *</label>
              <Input placeholder="guest@example.com" icon={<Mail className="w-4 h-4" />} {...register('guestEmail')} />
              {errors.guestEmail && <p className="text-[11px] text-rose-400">{errors.guestEmail.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Phone</label>
              <Input placeholder="+1 555-0199" icon={<Phone className="w-4 h-4" />} {...register('guestPhone')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Check-In Date *</label>
              <Input type="date" {...register('checkInDate')} />
              {errors.checkInDate && <p className="text-[11px] text-rose-400">{errors.checkInDate.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Check-Out Date *</label>
              <Input type="date" {...register('checkOutDate')} />
              {errors.checkOutDate && <p className="text-[11px] text-rose-400">{errors.checkOutDate.message}</p>}
            </div>
          </div>

          {rooms.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Assign Room Unit</label>
              <select
                {...register('roomId')}
                className="w-full h-10 rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/80"
              >
                <option value="">Select an available room</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                    {r.name} (Unit #{r.roomNumber || '—'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Total Folio Charge ($) *</label>
            <Input type="number" step="0.01" icon={<DollarSign className="w-4 h-4" />} {...register('totalAmount')} />
            {errors.totalAmount && <p className="text-[11px] text-rose-400">{errors.totalAmount.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Booking Folio...
                </>
              ) : (
                'Create Reservation'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
