'use client';

import React from 'react';
import { Sparkles, CheckCircle2, Clock, AlertTriangle, User, BedDouble } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRooms } from '@/features/rooms/hooks/use-rooms';

export default function HousekeepingPage() {
  const { rooms, isLoading } = useRooms();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" /> Housekeeping & Maid Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time room cleanliness statuses, turn-down assignments, and inspection logs (Chapter 4.1.6).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Clean Rooms */}
        <Card>
          <CardHeader className="pb-3 border-b border-emerald-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Ready & Clean
              </CardTitle>
              <Badge variant="success">{rooms.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
            {rooms.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No clean rooms registered</p>
            ) : (
              rooms.map((room) => (
                <div key={room.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{room.name}</p>
                    <p className="text-[10px] text-slate-500">Unit #{room.roomNumber || '—'}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700 bg-emerald-50">
                    Inspected
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Cleaning In Progress */}
        <Card>
          <CardHeader className="pb-3 border-b border-amber-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-amber-700 flex items-center gap-2">
                <Clock className="w-4 h-4" /> In Progress
              </CardTitle>
              <Badge variant="warning">0</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
            <p className="text-xs text-slate-500 py-4 text-center">No rooms currently undergoing cleaning</p>
          </CardContent>
        </Card>

        {/* Dirty / Awaiting Turnover */}
        <Card>
          <CardHeader className="pb-3 border-b border-rose-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Awaiting Turnover
              </CardTitle>
              <Badge variant="destructive">0</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
            <p className="text-xs text-slate-500 py-4 text-center">No pending checkout turnover requests</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
