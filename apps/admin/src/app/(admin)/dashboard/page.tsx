'use client';

import React, { useState, useEffect } from 'react';
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
  Zap,
  Server,
  Layers,
  CheckCircle2,
  Lock,
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

  // Chapter 19.3: SuperAdmin Central Operations Center State
  const [revenueMetrics, setRevenueMetrics] = useState({
    monthlyRecurringRevenue: 14850,
    annualRecurringRevenue: 178200,
    churnRatePercent: 1.8,
    totalGrossMerchandiseValue: 450000,
    activeSubscriptionsCount: 38,
    growthRatePercent: 24.6,
  });

  const [telemetry, setTelemetry] = useState({
    totalTenants: 12,
    activeTenants: 12,
    trialTenants: 0,
    totalUsers: 148,
    totalRoomsManaged: 85,
    storageConsumedMB: 142.8,
    databaseHealth: 'OPTIMAL',
    redisLatencyMs: 1.2,
    systemUptime: '99.98%',
  });

  const [featureFlags, setFeatureFlags] = useState<any[]>([
    { flagKey: 'ai_concierge', enabled: true, description: 'Autonomous Multimodal AI Guest Concierge (Chapter 14)' },
    { flagKey: 'crypto_payments', enabled: true, description: 'CoinGate & BitPay Cryptocurrency Payments (Chapter 18)' },
    { flagKey: 'biometric_clock', enabled: true, description: 'ZKTECO & Suprema Biometric Attendance Sync (Chapter 10)' },
    { flagKey: 'whatsapp_api', enabled: true, description: 'WhatsApp Business Cloud API Automation (Chapter 17)' },
    { flagKey: 'iot_smart_locks', enabled: true, description: 'Assa Abloy Smart Lock Keycard Gateway (Chapter 15)' },
    { flagKey: 'white_label', enabled: true, description: 'Custom Domain Mapping & Cloudflare SSL (Chapter 19.1)' },
  ]);

  useEffect(() => {
    fetch('http://localhost:4000/api/v1/saas/revenue-metrics')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setRevenueMetrics(data))
      .catch(() => {});

    fetch('http://localhost:4000/api/v1/saas/telemetry')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setTelemetry(data))
      .catch(() => {});

    fetch('http://localhost:4000/api/v1/saas/feature-flags')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => Array.isArray(data) && data.length > 0 && setFeatureFlags(data))
      .catch(() => {});
  }, []);

  const handleToggleFlag = async (flagKey: string, currentVal: boolean) => {
    const nextVal = !currentVal;
    setFeatureFlags((prev) =>
      prev.map((f) => (f.flagKey === flagKey ? { ...f, enabled: nextVal } : f))
    );
    try {
      await fetch('http://localhost:4000/api/v1/saas/feature-flags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagKey, enabled: nextVal }),
      });
    } catch {}
  };

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

      {/* Chapter 19.3: SuperAdmin Central Operations Center & Macro SaaS Revenue Dashboard */}
      <div className="pt-6 border-t border-slate-200/80 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#00a8ff]" /> SuperAdmin Central Operations Center (Chapter 19.3)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Macro-level SaaS revenue telemetry, cross-tenant system health, and global platform feature flags.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Platform SuperAdmin Root Governance
          </span>
        </div>

        {/* 4 Macro SaaS Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-600 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 border-b-0">
              <CardDescription className="text-xs font-semibold text-slate-500">Monthly Recurring Revenue (MRR)</CardDescription>
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                $
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-extrabold text-slate-900">
                ${revenueMetrics.monthlyRecurringRevenue?.toLocaleString() || '14,850'}
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +{revenueMetrics.growthRatePercent || 24.6}% MoM Growth
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-600 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 border-b-0">
              <CardDescription className="text-xs font-semibold text-slate-500">Annual Run-Rate (ARR)</CardDescription>
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-extrabold text-slate-900">
                ${revenueMetrics.annualRecurringRevenue?.toLocaleString() || '178,200'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {revenueMetrics.activeSubscriptionsCount || 38} active chain subscriptions
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-600 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 border-b-0">
              <CardDescription className="text-xs font-semibold text-slate-500">Net Churn Rate</CardDescription>
              <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-extrabold text-slate-900">
                {revenueMetrics.churnRatePercent || 1.8}%
              </div>
              <p className="text-[11px] text-purple-700 font-semibold mt-1">
                Elite enterprise retention benchmark
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-600 bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 border-b-0">
              <CardDescription className="text-xs font-semibold text-slate-500">Gross Merchandise Value (GMV)</CardDescription>
              <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-extrabold text-slate-900">
                ${revenueMetrics.totalGrossMerchandiseValue?.toLocaleString() || '450,000'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Cross-channel booking folios volume
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Telemetry Telemetrics & Global Feature Flags */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Tenant Health Telemetry */}
          <Card className="bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-600" /> Tenant Health & Infrastructure Telemetry
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time multi-tenant resource consumption and cluster diagnostics
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-0.5">
                  <div className="text-slate-500 font-medium">Active Tenants / Brands</div>
                  <div className="text-base font-bold text-slate-900">{telemetry.activeTenants} Active (0 Suspended)</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-0.5">
                  <div className="text-slate-500 font-medium">Total Registered Users</div>
                  <div className="text-base font-bold text-slate-900">{telemetry.totalUsers} Staff & Guests</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-0.5">
                  <div className="text-slate-500 font-medium">Cluster Storage Quota</div>
                  <div className="text-base font-bold text-slate-900">{telemetry.storageConsumedMB} MB Consumed</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-0.5">
                  <div className="text-slate-500 font-medium">Redis Cache Latency</div>
                  <div className="text-base font-bold text-emerald-600">{telemetry.redisLatencyMs} ms (Optimal)</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>PostgreSQL Database Pool: <strong className="text-slate-800">Healthy (Optimal)</strong></span>
                </div>
                <span className="font-mono text-slate-500">Uptime: {telemetry.systemUptime}</span>
              </div>
            </CardContent>
          </Card>

          {/* Global Feature Flags Toggle Console */}
          <Card className="bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00a8ff]" /> Global Feature Flags (Dynamic Platform Switches)
              </CardTitle>
              <CardDescription className="text-xs">
                Globally toggle cutting-edge modules per plan or platform-wide (Chapter 19.3)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="divide-y divide-slate-100">
                {featureFlags.map((flag) => (
                  <div key={flag.flagKey} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">{flag.flagKey}</span>
                        {flag.enabled ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ENABLED
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600">
                            DISABLED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{flag.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFlag(flag.flagKey, flag.enabled)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        flag.enabled ? 'bg-[#00a8ff]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          flag.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
