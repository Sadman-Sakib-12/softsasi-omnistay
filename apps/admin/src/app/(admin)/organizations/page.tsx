'use client';

import React from 'react';
import { Building2, Check, ArrowRight, ShieldCheck, Globe, Plus, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { organizationsService, Organization } from '@/features/organizations/services/organizations.service';
import { useTenantStore } from '@/stores/tenant-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function OrganizationsPage() {
  const { currentTenantId, setTenantId } = useTenantStore();

  const { data: organizations = [], isLoading } = useQuery<Organization[]>({
    queryKey: ['organizationsList'],
    queryFn: () => organizationsService.getAll(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" /> Multi-Tenant Organizations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Isolated tenant partitions retrieved directly from NestJS Organization API (`/api/v1/organizations`).
          </p>
        </div>
        <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-1" /> New Organization
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Loading tenant partitions from database...
        </div>
      ) : organizations.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm font-semibold text-slate-700">No organizations registered</p>
          <p className="text-xs text-slate-500 mt-1">Use the registration portal to provision new tenant instances.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {organizations.map((tenant) => {
            const isActive = tenant.id === currentTenantId;

            return (
              <Card
                key={tenant.id}
                className={`transition-all bg-white border ${
                  isActive
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <CardHeader className="flex flex-row items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <CardTitle className="text-base text-slate-900 flex items-center gap-2 font-bold">
                      {tenant.name}
                      {isActive && (
                        <Badge variant="success" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          Active Context
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono mt-1 text-slate-500">
                      UUID: {tenant.id}
                    </CardDescription>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <Building2 className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">Domain Mapping</span>
                      <p className="font-medium text-slate-800 mt-0.5">{tenant.domain || `${tenant.slug}.omnistay.com`}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">SaaS Tier</span>
                      <p className="font-medium text-blue-600 capitalize mt-0.5">{tenant.planId || 'Professional'}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> PostgreSQL RLS Partitioned
                    </span>
                    <Button
                      variant={isActive ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => setTenantId(tenant.id)}
                      className={isActive ? 'border-slate-300 text-slate-700' : 'bg-blue-600 hover:bg-blue-700 text-white text-xs'}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Active Context
                        </>
                      ) : (
                        <>
                          Switch Context <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
