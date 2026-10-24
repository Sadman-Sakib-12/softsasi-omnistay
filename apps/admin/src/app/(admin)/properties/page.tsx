'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Hotel, MapPin, Star, MoreVertical, Trash2, Eye, ExternalLink } from 'lucide-react';
import { useProperties } from '@/features/properties/hooks/use-properties';
import { AddPropertyDialog } from '@/features/properties/components/add-property-dialog';
import { DataTable, Column } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Property } from '@/features/properties/services/properties.service';

export default function PropertiesPage() {
  const router = useRouter();
  const { properties, isLoading, deleteProperty } = useProperties();

  const columns: Column<Property>[] = [
    {
      header: 'Hotel Name',
      accessorKey: 'name',
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
            <Hotel className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">{item.name}</div>
            <div className="text-[11px] text-slate-500">{item.email || 'No email specified'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{item.city ? `${item.city}, ${item.country}` : item.address || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Author / Created By',
      cell: (item) => <span className="text-slate-500">{item.author || 'Super Admin'}</span>,
    },
    {
      header: 'Status',
      cell: (item) => (
        <Badge variant={item.status === 'INACTIVE' ? 'destructive' : 'success'}>
          {item.status || 'Active'}
        </Badge>
      ),
    },
    {
      header: 'Rating',
      cell: (item) => (
        <div className="flex items-center gap-1 text-amber-500 font-semibold">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{item.starRating || 5}.0</span>
        </div>
      ),
    },
    {
      header: 'Date Created',
      cell: (item) => <span className="text-slate-500">{formatDate(item.createdAt)}</span>,
    },
    {
      header: 'Actions',
      cell: (item) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/properties/${item.id}`)}
            className="hover:text-blue-600 hover:bg-blue-50 text-slate-500"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                await deleteProperty(item.id);
              }
            }}
            className="hover:text-rose-600 hover:bg-rose-50 text-slate-400"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header (PDF Figure 4.1 "All Hotels") */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Hotel className="w-6 h-6 text-blue-600" /> All Hotels
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global portfolio of enterprise properties, multi-unit hotels and resorts (PDF Figure 4.1).
          </p>
        </div>
        <AddPropertyDialog />
      </div>

      {/* Real Data Table */}
      <DataTable
        data={properties}
        columns={columns}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search hotel names..."
        emptyTitle="No Hotel Properties Registered"
        emptySubtitle="Click 'Add New Hotel' above to register the first hotel property in the database."
        onRowClick={(item) => router.push(`/properties/${item.id}`)}
      />
    </div>
  );
}
