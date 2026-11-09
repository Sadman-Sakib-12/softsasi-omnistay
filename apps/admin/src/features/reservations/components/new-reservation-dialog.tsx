'use client';
import { BeatLoader } from 'react-spinners';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Calendar, DollarSign, User, Mail, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReservations } from '../hooks/use-reservations';
import { useRooms } from '@/features/rooms/hooks/use-rooms';
import { showAlert } from '@/lib/sweetalert';

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
      totalAmount: 0,
    },
  });

  const onSubmit = async (data: ReservationFormData) => {
    try {
      await createReservation(data);
      reset();
      setOpen(false);
      await showAlert({
        title: 'Success!',
        text: 'New reservation created successfully.',
        icon: 'success',
      });
    } catch (e: any) {
      console.error(e);
      await showAlert({
        title: 'Reservation Error',
        text: e?.message || 'Error creating reservation. Please verify details.',
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
        <Plus className="w-4 h-4" /> New Reservation
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" /> New Guest Reservation
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Register a direct front-desk reservation into the active hotel folio.
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
                <label className="text-xs font-semibold text-slate-700">Guest Full Name *</label>
                <Input placeholder="John Doe" icon={<User className="w-4 h-4" />} {...register('guestName')} />
                {errors.guestName && <p className="text-[11px] text-rose-500 font-medium">{errors.guestName.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Guest Email *</label>
                  <Input placeholder="guest@example.com" icon={<Mail className="w-4 h-4" />} {...register('guestEmail')} />
                  {errors.guestEmail && <p className="text-[11px] text-rose-500 font-medium">{errors.guestEmail.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Phone</label>
                  <Input placeholder="+1 555-0199" icon={<Phone className="w-4 h-4" />} {...register('guestPhone')} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Check-In Date *</label>
                  <Input type="date" {...register('checkInDate')} />
                  {errors.checkInDate && <p className="text-[11px] text-rose-500 font-medium">{errors.checkInDate.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Check-Out Date *</label>
                  <Input type="date" {...register('checkOutDate')} />
                  {errors.checkOutDate && <p className="text-[11px] text-rose-500 font-medium">{errors.checkOutDate.message}</p>}
                </div>
              </div>

              {rooms.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Assign Room Unit</label>
                  <select
                    {...register('roomId')}
                    className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    <option value="">Select an available room</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (Unit #{r.roomNumber || '—'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Total Folio Charge ($) *</label>
                <Input type="number" step="0.01" icon={<DollarSign className="w-4 h-4" />} {...register('totalAmount')} />
                {errors.totalAmount && <p className="text-[11px] text-rose-500 font-medium">{errors.totalAmount.message}</p>}
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
                      <BeatLoader color="currentColor" size={8} speedMultiplier={1.2} className="mr-2" /> Booking Folio...
                    </>
                  ) : (
                    'Create Reservation'
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
