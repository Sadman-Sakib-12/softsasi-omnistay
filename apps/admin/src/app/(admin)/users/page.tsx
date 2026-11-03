'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, Eye, Edit, Trash2, ShieldCheck, Mail, X, Loader2, Key, Check, Copy, EyeOff } from 'lucide-react';
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
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'HOTEL_STAFF',
    password: 'OmniStay@2026',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    pass: string;
    role: string;
  } | null>(null);

  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', currentTenantId],
    queryFn: () => usersService.getAll(currentTenantId),
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    setIsSubmitting(true);
    try {
      const plainPass = newUser.password?.trim() || 'OmniStay@2026';
      await usersService.invite({
        ...newUser,
        password: plainPass,
        organizationId: currentTenantId && currentTenantId !== 'all' ? currentTenantId : undefined,
      });
      setIsAddUserOpen(false);
      setCreatedCredentials({
        name: newUser.name,
        email: newUser.email,
        pass: plainPass,
        role: newUser.role,
      });
      setNewUser({ name: '', email: '', role: 'HOTEL_STAFF', password: 'OmniStay@2026' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err: any) {
      alert(err.message || 'Failed to invite user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      await usersService.update(editingUser.id, {
        name: editingUser.name,
        role: editingUser.role,
        status: editingUser.status,
        ...(editPassword && editPassword.trim().length >= 6 ? { password: editPassword.trim() } : {}),
      } as any);
      setEditingUser(null);
      setEditPassword('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      alert('User profile and credentials updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to deactivate or remove user "${name}"?`)) {
      try {
        await usersService.delete(id);
        queryClient.invalidateQueries({ queryKey: ['users'] });
      } catch (err: any) {
        alert(err.message || 'Failed to delete user');
      }
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
      cell: (item) => {
        const isSuper = Boolean((item as any).isSuperAdmin || item.role?.toLowerCase().includes('superadmin') || item.email === 'sadmansakib8530@gmail.com');
        const displayRole = isSuper ? 'Platform SuperAdmin' : (item.role || 'Staff');
        return (
          <Badge variant={isSuper ? 'success' : 'secondary'} className={isSuper ? 'bg-emerald-100 text-emerald-800 font-bold border-emerald-300' : ''}>
            {displayRole}
          </Badge>
        );
      },
    },
    {
      header: 'Assigned Tenant ID',
      cell: (item) => {
        const isSuper = Boolean((item as any).isSuperAdmin || item.role?.toLowerCase().includes('superadmin') || item.email === 'sadmansakib8530@gmail.com');
        return (
          <span className="font-mono text-[11px] text-slate-500">
            {isSuper ? 'OmniStay Global HQ (Root)' : (item.tenantId || currentTenantId || '—')}
          </span>
        );
      },
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
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/users/${item.id || (item as any).userId}`)}
            className="hover:text-blue-600 hover:bg-blue-50 text-slate-500 h-7 px-2"
            title="View user details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <button
            onClick={() => setEditingUser(item)}
            className="p-1 text-slate-500 hover:text-[#00a8ff] transition-colors rounded hover:bg-slate-100"
            title="Edit user"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeleteUser(item.id || (item as any).userId, item.name)}
            className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded hover:bg-rose-50"
            title="Delete user"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
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
        onRowClick={(item) => router.push(`/users/${item.id || (item as any).userId}`)}
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
                    placeholder="john@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 font-semibold">Initial Login Password *</label>
                    <button
                      type="button"
                      onClick={() => setNewUser({ ...newUser, password: 'OmniStay@2026' })}
                      className="text-[10px] text-blue-600 hover:underline cursor-pointer font-medium"
                    >
                      Reset Default (OmniStay@2026)
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="e.g. OmniStay@2026"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full h-8 pl-2.5 pr-8 text-xs bg-white border border-slate-200 rounded text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    💡 This password will be given to the staff member so they can log in at <code className="text-blue-600 font-semibold">/login</code>. Default: <span className="font-mono font-bold text-slate-700">OmniStay@2026</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Assign System Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="HOTEL_STAFF">HOTEL_STAFF</option>
                    <option value="FRONT_DESK_AGENT">FRONT_DESK_AGENT</option>
                    <option value="COMPANY_OWNER_GM">COMPANY_OWNER_GM</option>
                    <option value="CFO_ACCOUNTANT">CFO_ACCOUNTANT</option>
                    <option value="HOUSEKEEPING_SUPERVISOR">HOUSEKEEPING_SUPERVISOR</option>
                    <option value="POS_CASHIER">POS_CASHIER</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
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
                  {isSubmitting ? 'Registering...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Newly Created User Credentials Success Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-emerald-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">User Registered Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Provide these login credentials to the user so they can access their assigned dashboard.
              </p>

              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Name:</span>
                  <span className="font-bold text-slate-800">{createdCredentials.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-bold text-slate-800 select-all">{createdCredentials.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Role:</span>
                  <span className="font-bold text-blue-600">{createdCredentials.role}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-sans font-semibold">Initial Password:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 select-all">
                    {createdCredentials.pass}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2">
                <Button
                  onClick={() => {
                    const credsText = `OmniStay Login Credentials\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.pass}\nRole: ${createdCredentials.role}\nLogin URL: http://localhost:3000/login`;
                    navigator.clipboard.writeText(credsText);
                    setCopiedPass(true);
                    setTimeout(() => setCopiedPass(false), 2000);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8"
                >
                  {copiedPass ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copiedPass ? 'Copied to Clipboard!' : 'Copy Credentials'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCreatedCredentials(null)}
                  className="text-xs h-8"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal Dialog */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-blue-600" /> Edit User Profile & Role
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser}>
              <div className="p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Email Address (Read-Only)</label>
                  <input
                    type="email"
                    disabled
                    value={editingUser.email}
                    className="w-full h-8 px-2.5 text-xs bg-slate-100 border border-slate-200 rounded text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">System Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="HOTEL_STAFF">HOTEL_STAFF</option>
                    <option value="FRONT_DESK_AGENT">FRONT_DESK_AGENT</option>
                    <option value="COMPANY_OWNER_GM">COMPANY_OWNER_GM</option>
                    <option value="CFO_ACCOUNTANT">CFO_ACCOUNTANT</option>
                    <option value="HOUSEKEEPING_SUPERVISOR">HOUSEKEEPING_SUPERVISOR</option>
                    <option value="POS_CASHIER">POS_CASHIER</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Account Status</label>
                  <select
                    value={editingUser.status || 'ACTIVE'}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="INVITED">INVITED</option>
                  </select>
                </div>

                {/* Reset Password Field */}
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <label className="block text-slate-700 font-semibold">Reset / Set New Password (Optional)</label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      placeholder="Leave blank to keep current password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full h-8 pl-2.5 pr-8 text-xs bg-white border border-slate-200 rounded text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    If this user forgot their password, enter a new one here (min 6 chars) and save.
                  </p>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
