'use client';

import React from 'react';
import { ShoppingBag, RefreshCw, CheckCircle2, Globe, Share2, ShieldCheck, UserCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/data-table/data-table';
import { useQuery } from '@tanstack/react-query';
import { marketplaceService, Vendor } from '@/features/marketplace/services/marketplace.service';
import { formatCurrency, formatDate } from '@/lib/utils';

const channels = [
  { name: 'Booking.com', rateModel: '2-way XML ARI Sync', status: 'Connected', ping: '12ms' },
  { name: 'Expedia Partner Central', rateModel: 'Channex / OTA Sync', status: 'Connected', ping: '24ms' },
  { name: 'Airbnb Host API', rateModel: 'iCal / Instant Booking', status: 'Active', ping: '38ms' },
  { name: 'Google Hotel Ads / Free Links', rateModel: 'Google Hotel Center API', status: 'Synchronized', ping: '9ms' },
];

export default function MarketplacePage() {
  const { data: vendors = [], isLoading: isVendorsLoading } = useQuery({
    queryKey: ['marketplaceVendors'],
    queryFn: () => marketplaceService.getVendors(),
  });

  const columns: Column<Vendor>[] = [
    {
      header: 'Host / Partner Name',
      accessorKey: 'name',
      cell: (item) => (
        <div>
          <div className="font-semibold text-white">{item.name}</div>
          <div className="text-[11px] text-slate-400">{item.email}</div>
        </div>
      ),
    },
    {
      header: 'Business Entity',
      accessorKey: 'businessEntity',
      cell: (item) => <span className="text-slate-300">{item.businessEntity}</span>,
    },
    {
      header: 'KYC Status (Chapter 12.1)',
      cell: (item) => (
        <Badge variant={item.kycStatus === 'VERIFIED' ? 'success' : item.kycStatus === 'REJECTED' ? 'destructive' : 'warning'}>
          {item.kycStatus}
        </Badge>
      ),
    },
    {
      header: 'Commission Margin',
      cell: (item) => <span className="font-semibold text-emerald-400">{item.commissionRate ?? 0}% Net</span>,
    },
    {
      header: 'Joined Date',
      cell: (item) => <span className="text-slate-400">{formatDate(item.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-400" /> Multi-Vendor Marketplace & OTA Channels
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Two-way ARI distribution, third-party host onboarding, and KYC verification (Chapters 12 & 18).
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-3.5 h-3.5 mr-2" /> Sync All Feeds
        </Button>
      </div>

      {/* OTA Distribution Grid */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Live Global Distribution Channels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {channels.map((ch) => (
            <Card key={ch.name}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-sm text-white">{ch.name}</CardTitle>
                  <CardDescription className="text-[11px] mt-0.5">{ch.rateModel}</CardDescription>
                </div>
                <Badge variant="success" className="text-[10px]">
                  {ch.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>Latency</span>
                  <span className="font-mono text-emerald-400">{ch.ping}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Host / Vendor KYC Table from Backend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base text-white">Third-Party Hosts & Operators (KYC Queue)</CardTitle>
            <CardDescription className="text-xs">
              Directly queried from NestJS Marketplace Domain Service (`/api/v1/marketplace/vendors`)
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
            {vendors.length} Registered Partners
          </Badge>
        </CardHeader>
        <CardContent>
          <DataTable
            data={vendors}
            columns={columns}
            isLoading={isVendorsLoading}
            emptyTitle="No third-party host applications"
            emptySubtitle="Vendors submitting KYC through the marketplace portal will appear here."
          />
        </CardContent>
      </Card>
    </div>
  );
}
