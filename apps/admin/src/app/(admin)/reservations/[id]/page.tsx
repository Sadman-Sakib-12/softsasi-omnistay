'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ArrowLeft, User, DollarSign, BedDouble, CheckCircle2 } from 'lucide-react';
import { reservationsService } from '@/features/reservations/services/reservations.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const { data: reservation, isLoading, error } = useQuery({
    queryKey: ['reservation', resolvedParams.id],
    queryFn: () => reservationsService.getById(resolvedParams.id),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading reservation details...</div>;
  }

  if (error || !reservation) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-xs text-rose-400">Failed to load reservation details.</p>
        <Button variant="outline" size="sm" onClick={() => router.push('/reservations')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Reservations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/reservations')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Folio #{reservation.confirmationCode || reservation.id.slice(0, 8).toUpperCase()}
            <Badge variant="info">{reservation.status}</Badge>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered Guest: <span className="text-white font-medium">{reservation.guestName}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Stay & Folio Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500">Check-In Arrival</span>
                <p className="font-semibold text-slate-200 mt-0.5">{formatDate(reservation.checkInDate)}</p>
              </div>
              <div>
                <span className="text-slate-500">Check-Out Departure</span>
                <p className="font-semibold text-slate-200 mt-0.5">{formatDate(reservation.checkOutDate)}</p>
              </div>
              <div>
                <span className="text-slate-500">Guest Contact Email</span>
                <p className="font-semibold text-slate-200 mt-0.5">{reservation.guestEmail || '—'}</p>
              </div>
              <div>
                <span className="text-slate-500">Guest Contact Phone</span>
                <p className="font-semibold text-slate-200 mt-0.5">{reservation.guestPhone || '—'}</p>
              </div>
              <div>
                <span className="text-slate-500">Total Billed Folio</span>
                <p className="font-bold text-emerald-400 text-sm mt-0.5">
                  {formatCurrency(reservation.totalAmount)}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Creation Timestamp</span>
                <p className="font-semibold text-slate-200 mt-0.5">{formatDate(reservation.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Folio Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Direct reservation synchronized with PMS central ledger.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
