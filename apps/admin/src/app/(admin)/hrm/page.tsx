'use client';

import React from 'react';
import { UserCheck, Plus, Clock, Award, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/data-table/data-table';
import { useQuery } from '@tanstack/react-query';
import { usersService, User } from '@/features/users/services/users.service';
import { formatDate } from '@/lib/utils';

export default function HrmPage() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['hrmUsers'],
    queryFn: () => usersService.getAll(),
  });

  const columns: Column<User>[] = [
    {
      header: 'Staff Member',
      accessorKey: 'name',
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
            {item.name ? item.name[0].toUpperCase() : 'S'}
          </div>
          <div>
            <div className="font-bold text-slate-900">{item.name || 'Unnamed Employee'}</div>
            <div className="text-[11px] text-slate-500">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Department / Role',
      cell: (item) => (
        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
          {item.role || 'Hospitality Associate'}
        </Badge>
      ),
    },
    {
      header: 'Shift Status',
      cell: () => <Badge variant="success">On Duty</Badge>,
    },
    {
      header: 'Hire Date',
      cell: (item) => <span className="text-slate-500">{formatDate(item.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" /> Human Resources & Shift Rosters
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Staff dossiers, biometric punch clocks, and 24/7 rotational shift rosters (Chapter 10).
          </p>
        </div>
        <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-1" /> Add Staff Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-slate-500">Active Frontline Staff</CardDescription>
            <CardTitle className="text-2xl text-slate-900">{users.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Registered across all departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-slate-500">Clocked In Today</CardDescription>
            <CardTitle className="text-2xl text-emerald-600">{users.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Biometric fingerprint / GPS verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium text-slate-500">On Leave / Rest Day</CardDescription>
            <CardTitle className="text-2xl text-slate-700">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Approved leave requests</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search staff..."
        emptyTitle="No Staff Members Found"
        emptySubtitle="Register staff members to manage shifts and payroll."
      />
    </div>
  );
}
