'use client';

import React from 'react';
import { BarChart3, Download, TrendingUp, Calendar, DollarSign, BedDouble } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard';
import { formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const { metrics } = useDashboard();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" /> Analytical Reports & BI
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time RevPAR, ADR, occupancy percentages, and financial export ledgers (Chapter 7.8).
          </p>
        </div>
        <Button variant="outline" size="sm" className="bg-white">
          <Download className="w-3.5 h-3.5 mr-2" /> Export Financial PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardDescription className="text-slate-500">ADR (Average Daily Rate)</CardDescription>
            <CardTitle className="text-2xl text-slate-900 font-bold">
              {metrics.totalReservations > 0
                ? formatCurrency(metrics.totalRevenue / metrics.totalReservations)
                : '$0.00'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Yield per booked guest room</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription className="text-slate-500">RevPAR (Revenue Per Available Room)</CardDescription>
            <CardTitle className="text-2xl text-blue-600 font-bold">
              {metrics.totalRooms > 0
                ? formatCurrency(metrics.totalRevenue / metrics.totalRooms)
                : '$0.00'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Weighted inventory performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription className="text-slate-500">Occupancy Percentage</CardDescription>
            <CardTitle className="text-2xl text-emerald-600 font-bold">
              {metrics.totalRooms > 0
                ? `${Math.round((metrics.totalReservations / metrics.totalRooms) * 100)}%`
                : '0%'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Active rooms occupancy ratio</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
