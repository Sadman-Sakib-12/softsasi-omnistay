'use client';

import React from 'react';
import { ShieldCheck, Lock, UserCheck, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Role, Permission } from '@/lib/auth/permissions';

const rolesList = [
  {
    name: 'SUPER_ADMIN',
    title: 'Platform SuperAdmin',
    description: 'Full unrestricted root access to multi-tenant clusters, SaaS billing, and system parameters (Chapter 19.3).',
    badge: 'Root Access',
    permissions: ['All System Permissions (*)', 'Tenant Provisioning', 'API Gateway Controls'],
  },
  {
    name: 'COMPANY_OWNER_GM',
    title: 'Company Owner / General Manager',
    description: 'Autonomous control over all hotel properties, financial night audits, and staff under the tenant organization.',
    badge: 'Tenant Admin',
    permissions: ['properties:manage', 'accounting:night-audit', 'users:manage', 'settings:manage'],
  },
  {
    name: 'FRONT_DESK_AGENT',
    title: 'Front Desk Operator',
    description: 'Guest check-in, check-out, room key assignments, and live availability tape chart viewing.',
    badge: 'Front Office',
    permissions: ['reservations:view', 'reservations:check-in', 'reservations:check-out', 'rooms:view'],
  },
  {
    name: 'CFO_ACCOUNTANT',
    title: 'CFO / Financial Accountant',
    description: 'Posting daily room revenue, managing accounts receivable, and executing trial balances.',
    badge: 'Financial',
    permissions: ['accounting:night-audit', 'accounting:view', 'accounting:ledger'],
  },
  {
    name: 'HOUSEKEEPING_SUPERVISOR',
    title: 'Housekeeping Supervisor',
    description: 'Room cleanliness state transitions, maid shift rosters, and turndown inspections.',
    badge: 'Housekeeping',
    permissions: ['housekeeping:dispatch', 'rooms:cleanliness:update'],
  },
  {
    name: 'POS_CASHIER',
    title: 'F&B / POS Cashier',
    description: 'Multi-outlet dining registers, table maps, and guest room folio direct charges.',
    badge: 'Point of Sale',
    permissions: ['pos:orders:create', 'pos:room-charge:post'],
  },
];

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-600" /> Roles & Permissions (RBAC)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Granular role-based access control protecting all backend microservice routes (Chapter 19.4).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rolesList.map((r) => (
          <Card key={r.name} className="flex flex-col justify-between">
            <div>
              <CardHeader className="flex flex-row items-start justify-between pb-2 border-b border-slate-100">
                <div>
                  <CardTitle className="text-base text-slate-900 font-bold">{r.title}</CardTitle>
                  <CardDescription className="text-xs font-mono mt-0.5 text-slate-500">{r.name}</CardDescription>
                </div>
                <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-[10px]">
                  {r.badge}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Assigned Capabilities
                  </span>
                  <div className="space-y-1">
                    {r.permissions.map((p) => (
                      <div key={p} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-mono text-[11px]">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
