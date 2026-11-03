'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  TrendingUp,
  Calendar,
  DollarSign,
  BedDouble,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard';
import { formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const { metrics } = useDashboard();
  const [period, setPeriod] = useState<'today' | '7d' | 'mtd' | 'ytd'>('mtd');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const adr =
    metrics.totalReservations > 0
      ? metrics.totalRevenue / metrics.totalReservations
      : 0;

  const revPar =
    metrics.totalRooms > 0
      ? metrics.totalRevenue / metrics.totalRooms
      : 0;

  const occupancy =
    metrics.totalRooms > 0
      ? Math.min(100, Math.round((metrics.totalReservations / metrics.totalRooms) * 100))
      : 0;

  const handlePrintPdf = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const csvRows = [
      ['Metric', 'Value', 'Calculation Note'],
      ['Total Rooms', metrics.totalRooms, 'Total physical inventory'],
      ['Total Reservations', metrics.totalReservations, 'Confirmed guest folios'],
      ['Total Revenue', metrics.totalRevenue, 'Gross room revenue'],
      ['ADR (Average Daily Rate)', adr.toFixed(2), 'Revenue / Reservations'],
      ['RevPAR', revPar.toFixed(2), 'Revenue / Total Rooms'],
      ['Occupancy Rate', `${occupancy}%`, 'Reservations / Rooms ratio'],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OmniStay_Financial_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('Financial CSV exported successfully!');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="bg-white text-xs border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Export CSV
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handlePrintPdf}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / Export PDF
          </Button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Period Selector */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 w-fit text-xs">
        <button
          onClick={() => setPeriod('today')}
          className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
            period === 'today' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setPeriod('7d')}
          className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
            period === '7d' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Trailing 7 Days
        </button>
        <button
          onClick={() => setPeriod('mtd')}
          className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
            period === 'mtd' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Month to Date
        </button>
        <button
          onClick={() => setPeriod('ytd')}
          className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
            period === 'ytd' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Year to Date
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardDescription className="text-slate-500 font-medium">ADR (Average Daily Rate)</CardDescription>
            <CardTitle className="text-2xl text-slate-900 font-bold">
              {formatCurrency(adr)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Yield per booked guest room folio</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardDescription className="text-slate-500 font-medium">RevPAR (Revenue Per Available Room)</CardDescription>
            <CardTitle className="text-2xl text-blue-600 font-bold">
              {formatCurrency(revPar)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Weighted physical inventory performance</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardDescription className="text-slate-500 font-medium">Occupancy Percentage</CardDescription>
            <CardTitle className="text-2xl text-emerald-600 font-bold">
              {occupancy}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Active rooms occupancy ratio</p>
          </CardContent>
        </Card>
      </div>

      {/* Departmental Revenue Breakdown Table */}
      <Card className="bg-white border-slate-200 overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-sm font-bold text-slate-900">
            Hospitality Operating Department Breakdown (USALI 11th Edition)
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Revenue and gross operating profit contribution across business divisions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Department / Division</th>
                  <th className="py-3 px-4">Gross Revenue</th>
                  <th className="py-3 px-4">Direct Departmental Expense</th>
                  <th className="py-3 px-4">Net GOP Contribution</th>
                  <th className="py-3 px-4 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900">Rooms Division (PMS Rack & CRS)</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(metrics.totalRevenue || 198000)}</td>
                  <td className="py-3 px-4 text-slate-600">{formatCurrency((metrics.totalRevenue || 198000) * 0.22)}</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">{formatCurrency((metrics.totalRevenue || 198000) * 0.78)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">78.0%</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900">Food & Beverage (Outlets & In-Room Dining)</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(78500)}</td>
                  <td className="py-3 px-4 text-slate-600">{formatCurrency(42390)}</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">{formatCurrency(36110)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">46.0%</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900">Travel, Tours, Boats & Experiences</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(34200)}</td>
                  <td className="py-3 px-4 text-slate-600">{formatCurrency(12312)}</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">{formatCurrency(21888)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">64.0%</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900">Banquets & Conference Catering</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(45000)}</td>
                  <td className="py-3 px-4 text-slate-600">{formatCurrency(19800)}</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">{formatCurrency(25200)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">56.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
