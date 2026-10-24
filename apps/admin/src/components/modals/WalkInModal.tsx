'use client';

import React, { useState } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { X, UserPlus, Calendar, CreditCard, Building } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export const WalkInModal: React.FC = () => {
  const {
    walkInModalOpen,
    setWalkInModalOpen,
    createBooking,
    properties,
    selectedPropertyId,
  } = useAdminStore();

  const activeProperty = properties.find((p) => p.id === selectedPropertyId) || properties[0];

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [adults, setAdults] = useState(2);
  const [totalAmount, setTotalAmount] = useState(1200);
  const [submitting, setSubmitting] = useState(false);

  if (!walkInModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    setSubmitting(true);
    try {
      await createBooking({
        propertyId: activeProperty?.id || '00000000-0000-0000-0000-000000000001',
        guestName,
        guestEmail,
        checkInDate,
        checkOutDate,
        adults: Number(adults),
        totalAmount: Number(totalAmount),
      });
      setGuestName('');
      setGuestEmail('');
    } catch {
      // Error handled in store
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl glass-dropdown border border-sky-500/30 p-6 shadow-2xl relative">
        <button
          onClick={() => setWalkInModalOpen(false)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white absolute right-4 top-4 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Create New Reservation Booking</h3>
            <p className="text-xs text-slate-400">
              Posts directly to backend <code className="text-sky-400">POST /api/v1/bookings</code> and provisions guest folio
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Guest Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Lord Julian Sterling"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Guest Email</label>
              <input
                type="email"
                placeholder="e.g. guest@luxuryhotel.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Check-In Date *</label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Check-Out Date *</label>
              <input
                type="date"
                required
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Number of Adults</label>
              <input
                type="number"
                min={1}
                max={10}
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Calculated Total Folio Amount ($)</label>
              <input
                type="number"
                min={0}
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Total Folio Charge:</span>
            <span className="text-lg font-mono font-bold text-emerald-400">{formatCurrency(totalAmount)}</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setWalkInModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-lg shadow-sky-500/20 active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Placing Reservation...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
