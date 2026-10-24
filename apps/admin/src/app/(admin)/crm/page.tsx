'use client';

import React from 'react';
import { Briefcase, Plus, Users, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/data-table/data-table';
import { useQuery } from '@tanstack/react-query';
import { crmService, BanquetLead } from '@/features/crm/services/crm.service';
import { formatCurrency } from '@/lib/utils';

export default function CrmPage() {
  const { data: leadsData = [], isLoading } = useQuery({
    queryKey: ['crmLeads'],
    queryFn: () => crmService.getLeads(),
  });

  const columns: Column<BanquetLead>[] = [
    {
      header: 'Client / Corporate Entity',
      accessorKey: 'clientName',
      cell: (item) => (
        <div>
          <div className="font-semibold text-white">{item.clientName}</div>
          <div className="text-[11px] text-slate-400">Budget: {formatCurrency(item.estimatedBudget)}</div>
        </div>
      ),
    },
    {
      header: 'Event Category',
      accessorKey: 'eventType',
      cell: (item) => <Badge variant="outline" className="text-slate-300">{item.eventType}</Badge>,
    },
    {
      header: 'Target Date',
      accessorKey: 'eventDate',
      cell: (item) => <span className="text-slate-300">{item.eventDate}</span>,
    },
    {
      header: 'Headcount (PAX)',
      cell: (item) => <span className="font-semibold text-emerald-400">{item.pax} PAX</span>,
    },
    {
      header: 'Pipeline Stage',
      cell: (item) => <Badge variant="info">{item.stage}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-400" /> CRM & Banquet Event Sales
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time corporate event pipelines, wedding contracts, and inbound inquiries via backend API.
          </p>
        </div>
        <Button variant="glow" size="sm">
          <Plus className="w-4 h-4 mr-1" /> New Banquet Lead
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Active Deals</CardDescription>
            <CardTitle className="text-2xl text-white">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leadsData.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400">Pipeline corporate events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Weighted Pipeline Value</CardDescription>
            <CardTitle className="text-2xl text-emerald-400">
              {isLoading
                ? '...'
                : formatCurrency(leadsData.reduce((acc, l) => acc + (l.estimatedBudget || 0), 0))}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400">Target contract revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Anticipated PAX</CardDescription>
            <CardTitle className="text-2xl text-sky-400">
              {isLoading ? '...' : `${leadsData.reduce((acc, l) => acc + (l.pax || 0), 0)} Guests`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400">Banquet hall capacity booked</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-white">Banquet & Group Sales Pipeline</CardTitle>
          <CardDescription className="text-xs">Live leads retrieved directly from NestJS CRM Domain Service</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={leadsData}
            columns={columns}
            isLoading={isLoading}
            emptyTitle="No active banquet leads found"
            emptySubtitle="Live records from CRM API will appear here."
          />
        </CardContent>
      </Card>
    </div>
  );
}
