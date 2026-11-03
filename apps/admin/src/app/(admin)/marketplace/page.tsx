'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FileText,
  ExternalLink,
  Clock,
  Loader2,
  Award,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/data-table/data-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  marketplaceService,
  Vendor,
  KycSubmission,
} from '@/features/marketplace/services/marketplace.service';
import { formatDate } from '@/lib/utils';

const channels = [
  { name: 'Booking.com', rateModel: '2-way XML ARI Sync', status: 'Connected', ping: '12ms' },
  { name: 'Expedia Partner Central', rateModel: 'Channex / OTA Sync', status: 'Connected', ping: '24ms' },
  { name: 'Airbnb Host API', rateModel: 'iCal / Instant Booking', status: 'Active', ping: '38ms' },
  { name: 'Google Hotel Ads / Free Links', rateModel: 'Google Hotel Center API', status: 'Synchronized', ping: '9ms' },
];

export default function MarketplacePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'kyc' | 'vendors'>('kyc');

  const { data: vendors = [], isLoading: isVendorsLoading } = useQuery({
    queryKey: ['marketplaceVendors'],
    queryFn: () => marketplaceService.getVendors(),
  });

  const { data: kycSubmissions = [], isLoading: isKycLoading } = useQuery({
    queryKey: ['kycSubmissions'],
    queryFn: () => marketplaceService.getKycSubmissions(),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'verified' | 'rejected' }) =>
      marketplaceService.reviewKyc(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kycSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['marketplaceVendors'] });
    },
  });

  const handleReview = async (id: string, status: 'verified' | 'rejected') => {
    await reviewMutation.mutateAsync({ id, status });
  };

  const vendorColumns: Column<Vendor>[] = [
    {
      header: 'Host / Partner Name',
      accessorKey: 'name',
      cell: (item) => (
        <div>
          <div className="font-semibold text-white flex items-center gap-1.5">
            {item.name}
            {item.kycStatus === 'VERIFIED' && (
              <span title="Verified Host Badge">
                <ShieldCheck className="w-4 h-4 text-emerald-400 inline" />
              </span>
            )}
          </div>
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
        <Badge
          variant={
            item.kycStatus === 'VERIFIED'
              ? 'success'
              : item.kycStatus === 'REJECTED'
              ? 'destructive'
              : 'warning'
          }
        >
          {item.kycStatus}
        </Badge>
      ),
    },
    {
      header: 'Commission Margin',
      cell: (item) => <span className="font-semibold text-emerald-400">{item.commissionRate ?? 15}% Net</span>,
    },
    {
      header: 'Joined Date',
      cell: (item) => <span className="text-slate-400">{formatDate(item.createdAt)}</span>,
    },
  ];

  const kycColumns: Column<KycSubmission>[] = [
    {
      header: 'Host / Vendor',
      accessorKey: 'vendorName',
      cell: (item) => (
        <div>
          <div className="font-semibold text-white">{item.vendorName}</div>
          <div className="text-[11px] text-slate-400">ID: {item.vendorId.slice(0, 8)}...</div>
        </div>
      ),
    },
    {
      header: 'Document Type',
      accessorKey: 'documentType',
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-slate-200">
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          <span>{item.documentType}</span>
        </div>
      ),
    },
    {
      header: 'Document File / Evidence',
      cell: (item) => (
        <a
          href={item.documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[#00a8ff] hover:underline"
        >
          <span>View Document</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      ),
    },
    {
      header: 'Submission Status',
      cell: (item) => (
        <Badge
          variant={
            item.status === 'verified'
              ? 'success'
              : item.status === 'rejected'
              ? 'destructive'
              : 'warning'
          }
          className="uppercase text-[10px]"
        >
          {item.status}
        </Badge>
      ),
    },
    {
      header: 'Submitted At',
      cell: (item) => <span className="text-slate-400 text-xs">{formatDate(item.createdAt)}</span>,
    },
    {
      header: 'SuperAdmin Actions',
      cell: (item) => {
        const isPending = item.status === 'pending';
        return (
          <div className="flex items-center gap-2">
            {isPending ? (
              <>
                <Button
                  size="sm"
                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                  disabled={reviewMutation.isPending}
                  onClick={() => handleReview(item.id, 'verified')}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
                  disabled={reviewMutation.isPending}
                  onClick={() => handleReview(item.id, 'rejected')}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                </Button>
              </>
            ) : (
              <span className="text-xs text-slate-500 italic">Reviewed</span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-400" /> Multi-Vendor Marketplace & Host KYC Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Two-way ARI distribution, third-party host onboarding, and KYC verification (Chapter 12.1 & 18.2).
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

      {/* Tabs Switcher */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('kyc')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'kyc'
              ? 'bg-[#00a8ff] text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Host KYC Verification Queue</span>
          {kycSubmissions.filter((k) => k.status === 'pending').length > 0 && (
            <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
              {kycSubmissions.filter((k) => k.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('vendors')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'vendors'
              ? 'bg-[#00a8ff] text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Registered Hosts Directory ({vendors.length})</span>
        </button>
      </div>

      {/* Tab 1: KYC Queue */}
      {activeTab === 'kyc' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base text-white">Automated KYC Document Verification Queue</CardTitle>
              <CardDescription className="text-xs">
                Inspect passport IDs, hospitality operating licenses, and deeds before granting verified host badges (Chapter 12.1).
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-blue-500/30 text-[#00a8ff]">
              {kycSubmissions.length} Total Submissions
            </Badge>
          </CardHeader>
          <CardContent>
            <DataTable
              data={kycSubmissions}
              columns={kycColumns}
              isLoading={isKycLoading}
              emptyTitle="No pending host KYC submissions"
              emptySubtitle="When property hosts upload government IDs or hotel operating licenses, they will appear here for review."
            />
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Vendors Directory */}
      {activeTab === 'vendors' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base text-white">Third-Party Hosts & Operators</CardTitle>
              <CardDescription className="text-xs">
                All registered travel hosts, vacation rental operators, and tour providers.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
              {vendors.length} Registered Partners
            </Badge>
          </CardHeader>
          <CardContent>
            <DataTable
              data={vendors}
              columns={vendorColumns}
              isLoading={isVendorsLoading}
              emptyTitle="No third-party hosts registered"
              emptySubtitle="Hosts registering on the travel marketplace portal will appear here."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
