'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  UserCheck,
  LogOut,
  LogIn,
  Eye,
  CreditCard,
  Calendar,
} from 'lucide-react';
import { useReservations } from '@/features/reservations/hooks/use-reservations';
import { NewReservationDialog } from '@/features/reservations/components/new-reservation-dialog';
import { DataTable, Column } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Reservation } from '@/features/reservations/services/reservations.service';

export default function ReservationsPage() {
  const router = useRouter();
  const { reservations, isLoading, checkIn, isCheckingIn, checkOut, isCheckingOut } =
    useReservations();

  const columns: Column<Reservation>[] = [
    {
      header: 'Reservation Code',
      accessorKey: 'confirmationCode',
      cell: (item) => (
        <span className="font-mono text-blue-600 font-bold">
          {item.confirmationCode || item.id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Guest Name',
      accessorKey: 'guestName',
      cell: (item) => (
        <div>
          <div className="font-bold text-slate-900">{item.guestName}</div>
          <div className="text-[11px] text-slate-500">{item.guestEmail || '—'}</div>
        </div>
      ),
    },
    {
      header: 'Check-In',
      cell: (item) => <span className="text-slate-700">{formatDate(item.checkInDate)}</span>,
    },
    {
      header: 'Check-Out',
      cell: (item) => <span className="text-slate-700">{formatDate(item.checkOutDate)}</span>,
    },
    {
      header: 'Folio Total',
      cell: (item) => (
        <span className="font-bold text-emerald-600">
          {formatCurrency(item.totalAmount)}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (item) => {
        const variantMap: Record<string, 'success' | 'warning' | 'info' | 'destructive'> = {
          CONFIRMED: 'info',
          CHECKED_IN: 'success',
          CHECKED_OUT: 'secondary' as any,
          CANCELLED: 'destructive',
          PENDING: 'warning',
        };
        return (
          <Badge variant={variantMap[item.status] || 'default'}>
            {item.status || 'CONFIRMED'}
          </Badge>
        );
      },
    },
    {
      header: 'Actions',
      cell: (item) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {item.status !== 'CHECKED_IN' && item.status !== 'CHECKED_OUT' && (
            <Button
              variant="outline"
              size="sm"
              disabled={isCheckingIn}
              onClick={async () => {
                await checkIn(item.id);
              }}
              className="text-emerald-700 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs py-1 h-7 font-semibold"
            >
              <LogIn className="w-3 h-3 mr-1" /> Check In
            </Button>
          )}

          {item.status === 'CHECKED_IN' && (
            <Button
              variant="outline"
              size="sm"
              disabled={isCheckingOut}
              onClick={async () => {
                await checkOut(item.id);
              }}
              className="text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs py-1 h-7 font-semibold"
            >
              <LogOut className="w-3 h-3 mr-1" /> Check Out
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/reservations/${item.id}`)}
            className="hover:text-blue-600 hover:bg-blue-50 text-slate-500"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-600" /> Reservations & Folios
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage incoming arrivals, departures, room assignments, and front-desk check-in status (Chapter 4.1.5).
          </p>
        </div>
        <NewReservationDialog />
      </div>

      {/* Real Data Table */}
      <DataTable
        data={reservations}
        columns={columns}
        isLoading={isLoading}
        searchKey="guestName"
        searchPlaceholder="Search by guest name..."
        emptyTitle="No Guest Reservations Found"
        emptySubtitle="Click 'New Reservation' above to create a booking directly in the PMS database."
        onRowClick={(item) => router.push(`/reservations/${item.id}`)}
      />
    </div>
  );
}
