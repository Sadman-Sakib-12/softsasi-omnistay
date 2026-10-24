'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Users, UserPlus, Eye, ShieldCheck, Mail } from 'lucide-react';
import { usersService, User } from '@/features/users/services/users.service';
import { DataTable, Column } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { useTenantStore } from '@/stores/tenant-store';

export default function UsersPage() {
  const router = useRouter();
  const { currentTenantId } = useTenantStore();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', currentTenantId],
    queryFn: () => usersService.getAll(),
  });

  const columns: Column<User>[] = [
    {
      header: 'Staff Name',
      accessorKey: 'name',
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
            {item.name ? item.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="font-bold text-slate-900">{item.name || 'Unnamed User'}</div>
            <div className="text-[11px] text-slate-500">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'System Role',
      cell: (item) => (
        <Badge variant={item.role === 'SUPER_ADMIN' ? 'success' : 'secondary'}>
          {item.role || 'HOTEL_STAFF'}
        </Badge>
      ),
    },
    {
      header: 'Assigned Tenant ID',
      cell: (item) => <span className="font-mono text-[11px] text-slate-500">{item.tenantId || currentTenantId || '—'}</span>,
    },
    {
      header: 'Status',
      cell: (item) => (
        <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
          {item.status || 'ACTIVE'}
        </Badge>
      ),
    },
    {
      header: 'Date Added',
      cell: (item) => <span className="text-slate-500">{formatDate(item.createdAt)}</span>,
    },
    {
      header: 'Actions',
      cell: (item) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/users/${item.id}`)}
          className="hover:text-blue-600 hover:bg-blue-50 text-slate-500"
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Users & Operators Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise user management, authentication credentials, and multi-tenant scoping (Chapter 3.2).
          </p>
        </div>
        <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          <UserPlus className="w-4 h-4 mr-1" /> Add New User
        </Button>
      </div>

      {/* Real Data Table */}
      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search by name or email..."
        emptyTitle="No Users Found in Partition"
        emptySubtitle="Register staff members to grant access to the PMS console."
        onRowClick={(item) => router.push(`/users/${item.id}`)}
      />
    </div>
  );
}
