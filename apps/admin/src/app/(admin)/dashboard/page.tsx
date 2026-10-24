'use client';

import React from 'react';
import Link from 'next/link';
import {
  Hotel,
  BedDouble,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Activity,
  Plus,
} from 'lucide-react';
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard';
import { useReservations } from '@/features/reservations/hooks/use-reservations';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AddPropertyDialog } from '@/features/properties/components/add-property-dialog';
import { NewReservationDialog } from '@/features/reservations/components/new-reservation-dialog';

export default function DashboardPage() {
  const { metrics, isLoading } = useDashboard();
  const { reservations } = useReservations();

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Executive Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-tenant property overview, occupancy, and guest reservation analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddPropertyDialog />
          <NewReservationDialog />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-0">
            <CardDescription className="text-xs font-medium text-slate-500">Hotel Properties</CardDescription>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Hotel className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-slate-900">
              {isLoading ? '...' : metrics.totalProperties}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-blue-600 font-semibold">Active</span> portfolio properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-0">
            <CardDescription className="text-xs font-medium text-slate-500">Room Inventory</CardDescription>
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <BedDouble className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-slate-900">
              {isLoading ? '...' : metrics.totalRooms}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Live units in PMS ledger
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-0">
            <CardDescription className="text-xs font-medium text-slate-500">Guest Reservations</CardDescription>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
              <CalendarDays className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-slate-900">
              {isLoading ? '...' : metrics.totalReservations}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Recorded folio bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-0">
            <CardDescription className="text-xs font-medium text-slate-500">Ledger Revenue</CardDescription>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-emerald-600">
              {isLoading ? '...' : formatCurrency(metrics.totalRevenue)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Night audit posted revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Launch & Live Bookings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Launch */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" /> Operational Hub
            </CardTitle>
            <CardDescription>Direct navigation to core PMS microservices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/properties" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors">
                <div className="flex items-center gap-3">
                  <Hotel className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-800">Properties (Figure 4.1)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </Link>

            <Link href="/rooms" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors">
                <div className="flex items-center gap-3">
                  <BedDouble className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-semibold text-slate-800">Room Units (Figure 3.1)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </Link>

            <Link href="/front-desk" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors">
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-semibold text-slate-800">Availability Grid (Figure 4.3)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </Link>

            <Link href="/finance" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold text-slate-800">Night Audit & Accounting</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </Link>

            <Link href="/settings" className="block">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-slate-800">Global Config Hub (Figure 2.1)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Reservations Live Feed */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" /> Live Guest Bookings
              </CardTitle>
              <CardDescription>Recently registered reservations from backend API</CardDescription>
            </div>
            <Link href="/reservations">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {reservations.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <p className="text-xs text-slate-500">No active bookings recorded in the database yet.</p>
                <NewReservationDialog />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reservations.slice(0, 5).map((res) => (
                  <div key={res.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{res.guestName}</p>
                      <p className="text-[11px] text-slate-500">
                        {formatDate(res.checkInDate)} - {formatDate(res.checkOutDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-xs text-emerald-600">
                        {formatCurrency(res.totalAmount)}
                      </span>
                      <Badge variant="info">{res.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
