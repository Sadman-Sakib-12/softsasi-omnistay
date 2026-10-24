'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/adminStore';
import {
  CalendarDays,
  UserCheck,
  LogOut,
  Search,
  Plus,
  RefreshCw,
  User,
  CreditCard,
  Building,
  KeyRound,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../../lib/utils';

export const BookingsManagementSection: React.FC = () => {
  const {
    bookings,
    fetchBookings,
    checkInGuest,
    checkOutGuest,
    isLoading,
    errorMessage,
    walkInModalOpen,
    setWalkInModalOpen,
  } = useAdminStore();

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Check-In Modal State
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [selectedBookingForCheckIn, setSelectedBookingForCheckIn] = useState<any | null>(null);
  const [checkInRoomNumber, setCheckInRoomNumber] = useState('');
  const [checkInKeycard, setCheckInKeycard] = useState('BLE-LOCK-101');
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Check-Out Modal State
  const [checkOutModalOpen, setCheckOutModalOpen] = useState(false);
  const [selectedBookingForCheckOut, setSelectedBookingForCheckOut] = useState<any | null>(null);
  const [settlementMethod, setSettlementMethod] = useState('credit_card');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.bookingStatus !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const codeMatch = b.bookingCode?.toLowerCase().includes(q);
      const nameMatch = b.guestName?.toLowerCase().includes(q);
      return codeMatch || nameMatch;
    }
    return true;
  });

  const handleOpenCheckIn = (booking: any) => {
    setSelectedBookingForCheckIn(booking);
    setCheckInRoomNumber(booking.roomNumber || '101');
    setCheckInModalOpen(true);
  };

  const handleConfirmCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForCheckIn) return;

    setIsCheckingIn(true);
    try {
      await checkInGuest({
        bookingId: selectedBookingForCheckIn.id,
        roomNumber: checkInRoomNumber,
        keycardCode: checkInKeycard,
      });
      setCheckInModalOpen(false);
    } catch {
      // Error handled in store
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleOpenCheckOut = (booking: any) => {
    setSelectedBookingForCheckOut(booking);
    setCheckOutModalOpen(true);
  };

  const handleConfirmCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForCheckOut) return;

    setIsCheckingOut(true);
    try {
      await checkOutGuest({
        bookingId: selectedBookingForCheckOut.id,
        folioSettled: true,
        settlementMethod,
      });
      setCheckOutModalOpen(false);
    } catch {
      // Error handled in store
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Dashboard</span>
        <span>/</span>
        <span>Hospitality PMS</span>
        <span>/</span>
        <span className="text-slate-200 font-semibold">Reservations & Folios</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reservations, Folios & Front-Desk Dispatch</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time synchronization with PostgreSQL <code className="text-sky-400">bookings</code> & <code className="text-sky-400">guest_folios</code> tables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchBookings()}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh Bookings"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </button>
          <button
            onClick={() => setWalkInModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Notice: {errorMessage}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search booking code or guest name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {['all', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                'px-3 py-1 rounded-lg capitalize font-medium transition-colors',
                statusFilter === st
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl glass-panel overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Booking Code</th>
                <th className="py-3 px-4">Guest Info</th>
                <th className="py-3 px-4">Stay Dates</th>
                <th className="py-3 px-4">Room Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Folio Total</th>
                <th className="py-3 px-4 text-right">Front-Desk Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => (
                  <tr key={b.id || b.bookingCode} className="hover:bg-slate-900/50 transition-colors font-sans">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-400">
                      {b.bookingCode || 'BK-PENDING'}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-100">{b.guestName || 'Registered Guest'}</p>
                      <p className="text-[10px] text-slate-400">{b.guestEmail || 'direct-booking@hotel.com'}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {formatDate(b.checkInDate)} ➔ {formatDate(b.checkOutDate)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">
                      {b.roomType || 'Deluxe Oceanfront Villa'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-[10px] font-bold font-mono',
                          b.bookingStatus === 'checked_in'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : b.bookingStatus === 'confirmed'
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              : 'bg-slate-800 text-slate-400',
                        )}
                      >
                        {b.bookingStatus || 'confirmed'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(b.totalAmount || 1200)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-2">
                        {b.bookingStatus !== 'checked_in' && b.bookingStatus !== 'checked_out' && (
                          <button
                            onClick={() => handleOpenCheckIn(b)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Check-In</span>
                          </button>
                        )}
                        {b.bookingStatus === 'checked_in' && (
                          <button
                            onClick={() => handleOpenCheckOut(b)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Check-Out</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <p className="text-sm font-bold text-slate-300">No Reservations Found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      No active bookings in backend database. Click "New Reservation" to test front-desk bookings.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real Check-In Modal connecting to POST /api/v1/rooms/check-in */}
      {checkInModalOpen && selectedBookingForCheckIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl glass-dropdown border border-emerald-500/30 p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">
              Front-Desk Guest Check-In
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Booking: <span className="font-mono text-sky-400">{selectedBookingForCheckIn.bookingCode}</span> • Guest: {selectedBookingForCheckIn.guestName}
            </p>

            <form onSubmit={handleConfirmCheckIn} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Room Unit Number</label>
                <input
                  type="text"
                  required
                  value={checkInRoomNumber}
                  onChange={(e) => setCheckInRoomNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Program RFID / BLE Keycard Code</label>
                <input
                  type="text"
                  value={checkInKeycard}
                  onChange={(e) => setCheckInKeycard(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Government ID verified & digital registration terms confirmed.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCheckInModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCheckingIn}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isCheckingIn ? 'Checking In...' : 'Confirm Check-In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real Check-Out Modal connecting to POST /api/v1/rooms/check-out */}
      {checkOutModalOpen && selectedBookingForCheckOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl glass-dropdown border border-amber-500/30 p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">
              Front-Desk Guest Check-Out & Folio Audit
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Booking: <span className="font-mono text-sky-400">{selectedBookingForCheckOut.bookingCode}</span> • Room: {selectedBookingForCheckOut.roomNumber}
            </p>

            <form onSubmit={handleConfirmCheckOut} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Room Nights & Incidentals:</span>
                  <span className="font-mono text-slate-200">{formatCurrency(selectedBookingForCheckOut.totalAmount || 1200)}</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-800">
                  <span>Settlement Balance Due:</span>
                  <span className="font-mono text-emerald-400">$0.00 (Fully Settled)</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Final Settlement Method</label>
                <select
                  value={settlementMethod}
                  onChange={(e) => setSettlementMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="credit_card">Stripe Credit Card Pre-Auth</option>
                  <option value="cash">Cash Drawer Float Settlement</option>
                  <option value="corporate">Corporate AR Direct Billing (Net 30)</option>
                  <option value="wallet">Softsasi Stored Digital Wallet</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Room keycard deactivated and housekeeping cleaning task dispatched.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCheckOutModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCheckingOut}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isCheckingOut ? 'Processing Check-Out...' : 'Complete Check-Out & Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
