'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Users, ArrowLeft, Mail, ShieldCheck, Building2, Calendar } from 'lucide-react';
import { usersService } from '@/features/users/services/users.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', resolvedParams.id],
    queryFn: () => usersService.getById(resolvedParams.id),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading user profile...</div>;
  }

  if (error || !user) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-xs text-rose-400">Failed to load user profile.</p>
        <Button variant="outline" size="sm" onClick={() => router.push('/users')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/users')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {user.name || user.email}
            <Badge variant="success">{user.role}</Badge>
          </h1>
          <p className="text-xs text-slate-400 mt-1">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>User Profile & Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500">Email Address</span>
                <p className="font-semibold text-slate-200 mt-0.5">{user.email}</p>
              </div>
              <div>
                <span className="text-slate-500">Assigned Role</span>
                <p className="font-semibold text-emerald-400 mt-0.5">{user.role}</p>
              </div>
              <div>
                <span className="text-slate-500">Tenant / Org ID</span>
                <p className="font-mono text-slate-200 mt-0.5">{user.tenantId}</p>
              </div>
              <div>
                <span className="text-slate-500">Account Created</span>
                <p className="font-semibold text-slate-200 mt-0.5">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
