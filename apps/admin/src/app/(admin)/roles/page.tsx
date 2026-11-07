'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  CheckCircle2,
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  Check,
  Layers,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RoleDefinition {
  name: string;
  title: string;
  description: string;
  badge: string;
  permissions: string[];
  isCustom?: boolean;
}

const ALL_SYSTEM_PERMISSIONS = [
  'properties:manage',
  'rooms:view',
  'rooms:manage',
  'reservations:view',
  'reservations:check-in',
  'reservations:check-out',
  'reservations:manage',
  'accounting:night-audit',
  'accounting:view',
  'accounting:ledger',
  'housekeeping:dispatch',
  'rooms:cleanliness:update',
  'pos:orders:create',
  'pos:room-charge:post',
  'inventory:manage',
  'crm:leads:manage',
  'users:manage',
  'settings:manage',
  'ai:configure',
  'iot:locks:control',
];

const INITIAL_ROLES: RoleDefinition[] = [
  {
    name: 'SUPER_ADMIN',
    title: 'Platform SuperAdmin',
    description: 'Full unrestricted root access to multi-tenant clusters, SaaS billing, and system parameters (Chapter 19.3).',
    badge: 'Root Access',
    permissions: ['All System Permissions (*)', 'Tenant Provisioning', 'API Gateway Controls'],
    isCustom: false,
  },
  {
    name: 'COMPANY_OWNER_GM',
    title: 'Company Owner / General Manager',
    description: 'Autonomous control over all hotel properties, financial night audits, and staff under the tenant organization.',
    badge: 'Tenant Admin',
    permissions: ['properties:manage', 'accounting:night-audit', 'users:manage', 'settings:manage'],
    isCustom: false,
  },
  {
    name: 'CFO_ACCOUNTANT',
    title: 'CFO / Financial Accountant',
    description: 'Posting daily room revenue, managing accounts receivable, and executing trial balances.',
    badge: 'Financial',
    permissions: ['accounting:night-audit', 'accounting:view', 'accounting:ledger'],
    isCustom: false,
  },
  {
    name: 'FRONT_DESK_AGENT',
    title: 'Front Desk Operator',
    description: 'Guest check-in, check-out, room key assignments, and live availability tape chart viewing.',
    badge: 'Front Office',
    permissions: ['reservations:view', 'reservations:check-in', 'reservations:check-out', 'rooms:view'],
    isCustom: false,
  },
  {
    name: 'HOUSEKEEPING_SUPERVISOR',
    title: 'Housekeeping Supervisor',
    description: 'Room cleanliness state transitions, maid shift rosters, and turndown inspections.',
    badge: 'Housekeeping',
    permissions: ['housekeeping:dispatch', 'rooms:cleanliness:update'],
    isCustom: false,
  },
  {
    name: 'POS_CASHIER',
    title: 'F&B / POS Cashier',
    description: 'Multi-outlet dining registers, table maps, and guest room folio direct charges.',
    badge: 'Point of Sale',
    permissions: ['pos:orders:create', 'pos:room-charge:post'],
    isCustom: false,
  },
  {
    name: 'HR_DIRECTOR',
    title: 'HR & Payroll Director',
    description: 'Human capital lifecycle management, multi-tier staff shifts, biometric clock-in, and monthly payroll disbursement.',
    badge: 'Workforce HRM',
    permissions: ['staff:manage', 'payroll:run', 'users:manage', 'reports:view'],
    isCustom: false,
  },
  {
    name: 'THIRD_PARTY_VENDOR',
    title: 'Third-Party Marketplace Host / Operator',
    description: 'Self-service vendor dashboard, managing proprietary hotel/villa listings, bookings, and payout splits.',
    badge: 'Marketplace Vendor',
    permissions: ['properties:manage', 'reservations:view', 'reports:view'],
    isCustom: false,
  },
  {
    name: 'GUEST_TRAVELER',
    title: 'Guest / Registered Traveler',
    description: 'Direct booking folio viewing, digital room keycard access, in-chat payments, and personal profile security.',
    badge: 'Guest Traveler',
    permissions: ['reservations:view', 'profile:manage'],
    isCustom: false,
  },
  {
    name: 'MAINTENANCE_ENGINEER',
    title: 'Maintenance Engineer & Facilities Lead',
    description: 'Asset inspection, preventive work orders, IoT smart locks gateway monitoring, and equipment repair logs.',
    badge: 'Engineering & IoT',
    permissions: ['inventory:manage', 'rooms:cleanliness:update', 'iot:locks:control'],
    isCustom: false,
  },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>(INITIAL_ROLES);
  const [searchTerm, setSearchTerm] = useState('');

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newBadge, setNewBadge] = useState('Custom Role');
  const [newDesc, setNewDesc] = useState('');
  const [newPerms, setNewPerms] = useState<string[]>([]);

  // Edit Modal State
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editPerms, setEditPerms] = useState<string[]>([]);

  const handleTitleChange = (val: string) => {
    setNewTitle(val);
    if (!newCode || newCode === newTitle.toUpperCase().replace(/[^A-Z0-9]/g, '_')) {
      setNewCode(val.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_'));
    }
  };

  const toggleNewPerm = (perm: string) => {
    setNewPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const toggleEditPerm = (perm: string) => {
    setEditPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) return;

    const created: RoleDefinition = {
      name: newCode.trim(),
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom operational role configured for tenant staff.',
      badge: newBadge.trim() || 'Custom Role',
      permissions: newPerms.length > 0 ? newPerms : ['reservations:view', 'rooms:view'],
      isCustom: true,
    };

    setRoles((prev) => [...prev, created]);
    setIsCreateOpen(false);
    setNewTitle('');
    setNewCode('');
    setNewBadge('Custom Role');
    setNewDesc('');
    setNewPerms([]);
  };

  const openEditModal = (r: RoleDefinition) => {
    setEditingRole(r);
    setEditDesc(r.description);
    setEditPerms([...r.permissions]);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    setRoles((prev) =>
      prev.map((r) =>
        r.name === editingRole.name
          ? {
              ...r,
              description: editDesc,
              permissions: editPerms,
            }
          : r
      )
    );
    setEditingRole(null);
  };

  const handleDeleteRole = (name: string) => {
    if (confirm(`Delete custom role ${name}?`)) {
      setRoles((prev) => prev.filter((r) => r.name !== name));
    }
  };

  const filteredRoles = roles.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" /> Roles & Permissions (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Granular role-based access control protecting all backend microservice routes (Chapter 19.4).
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          variant="default"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1" /> Create Custom Role
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search roles by title, code, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder-slate-400"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600 text-xs">
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((r) => (
          <Card key={r.name} className="flex flex-col justify-between bg-white border border-slate-200 shadow-sm">
            <div>
              <CardHeader className="flex flex-row items-start justify-between pb-2 border-b border-slate-100">
                <div>
                  <CardTitle className="text-base text-slate-900 font-bold">{r.title}</CardTitle>
                  <CardDescription className="text-xs font-mono mt-0.5 text-slate-500">{r.name}</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-[10px]">
                    {r.badge}
                  </Badge>
                  {r.isCustom && (
                    <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      Custom Role
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">{r.description}</p>
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Assigned Capabilities ({r.permissions.length})
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {r.permissions.map((p) => (
                      <div key={p} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-mono text-[11px] truncate">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditModal(r)}
                className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 mr-1 text-blue-600" /> Edit Permissions
              </Button>
              {r.isCustom && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteRole(r.name)}
                  className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 h-8 px-2 cursor-pointer"
                  title="Delete role"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Create Custom Role Modal Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Create Custom Operational Role</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Role Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Concierge Supervisor"
                    value={newTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">System Code (RBAC identifier) *</label>
                  <input
                    type="text"
                    required
                    placeholder="CONCIERGE_SUPERVISOR"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Department / Badge</label>
                <input
                  type="text"
                  placeholder="e.g. Front Office / VIP Concierge"
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Role Description</label>
                <textarea
                  rows={2}
                  placeholder="Operational responsibilities and scope of access..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Select Granular Capabilities ({newPerms.length} selected)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded bg-slate-50">
                  {ALL_SYSTEM_PERMISSIONS.map((perm) => {
                    const checked = newPerms.includes(perm);
                    return (
                      <label
                        key={perm}
                        className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-[11px] font-mono select-none ${
                          checked ? 'bg-blue-100/70 text-blue-900 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleNewPerm(perm)}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span className="truncate">{perm}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  Create Role
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal Dialog */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Edit Role: {editingRole.title} ({editingRole.name})
                </h3>
              </div>
              <button
                onClick={() => setEditingRole(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Role Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Configured Capabilities ({editPerms.length} assigned)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 border border-slate-200 rounded bg-slate-50">
                  {ALL_SYSTEM_PERMISSIONS.map((perm) => {
                    const checked = editPerms.includes(perm);
                    return (
                      <label
                        key={perm}
                        className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-[11px] font-mono select-none ${
                          checked ? 'bg-blue-100/70 text-blue-900 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleEditPerm(perm)}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span className="truncate">{perm}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingRole(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
