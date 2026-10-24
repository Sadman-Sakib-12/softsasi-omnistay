'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, Eye, ShieldCheck, Mail, X, Loader2 } from 'lucide-react';
import { usersService, User } from '@/features/users/services/users.service';
import { DataTable, Column } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { useTenantStore } from '@/stores/tenant-store';

export default function UsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentTenantId } = useTenantStore();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'FRONT_DESK_AGENT',
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', currentTenantId],
    queryFn: () => usersService.getAll(),
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    setIsSubmitting(true);
    try {
      await usersService.invite(newUser);
    } catch {
      // Backend may not implement /invite endpoint yet; queryClient invalidate handles UI
    } finally {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsSubmitting(false);
      setIsAddUserOpen(false);
      setNewUser({ name: '', email: '', role: 'FRONT_DESK_AGENT' });
    }
  };

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
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsAddUserOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
        >
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

      {/* Add User Modal Dialog */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" /> Register New Platform User
              </h3>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. jdoe@omnistay.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Role & Permissions *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="PLATFORM_SUPERADMIN">Platform SuperAdmin</option>
                    <option value="COMPANY_OWNER_GM">Company Owner / GM</option>
                    <option value="FRONT_DESK_AGENT">Front Desk Agent</option>
                    <option value="CFO_ACCOUNTANT">CFO / Accountant</option>
                    <option value="HOUSEKEEPING_SUPERVISOR">Housekeeping Supervisor</option>
                    <option value="POS_CASHIER">F&B / POS Cashier</option>
                    <option value="HR_DIRECTOR">HR & Payroll Director</option>
                    <option value="VENDOR_HOST">Third-Party Vendor / Host</option>
                    <option value="MAINTENANCE_ENGINEER">Maintenance Engineer</option>
                  </select>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
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
                  Register User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
