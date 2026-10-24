'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Hotel, MapPin, ArrowLeft, Calendar, DollarSign, BedDouble, Phone, Mail } from 'lucide-react';
import { propertiesService } from '@/features/properties/services/properties.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', resolvedParams.id],
    queryFn: () => propertiesService.getById(resolvedParams.id),
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Loading property details from backend...
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-xs text-rose-400">Failed to load property details or property not found.</p>
        <Button variant="outline" size="sm" onClick={() => router.push('/properties')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Properties
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/properties')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {property.name}
            <Badge variant="success">Active</Badge>
          </h1>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            {property.address}, {property.city}, {property.country}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Property Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500">Contact Phone</span>
                <p className="font-semibold text-slate-200 mt-0.5">{property.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-500">Official Email</span>
                <p className="font-semibold text-slate-200 mt-0.5">{property.email || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-500">Star Classification</span>
                <p className="font-semibold text-amber-400 mt-0.5">{property.starRating || 5} Stars</p>
              </div>
              <div>
                <span className="text-slate-500">Registered On</span>
                <p className="font-semibold text-slate-200 mt-0.5">{formatDate(property.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PMS Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => router.push('/rooms')}
            >
              <BedDouble className="w-4 h-4 mr-2 text-emerald-400" /> Manage Room Units
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => router.push('/reservations')}
            >
              <Calendar className="w-4 h-4 mr-2 text-sky-400" /> Property Reservations
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => router.push('/front-desk')}
            >
              <DollarSign className="w-4 h-4 mr-2 text-amber-400" /> Front Desk Tape Chart
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
