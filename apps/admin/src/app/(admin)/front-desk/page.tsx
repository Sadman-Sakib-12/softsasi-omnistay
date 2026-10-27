'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  BedDouble,
  DollarSign,
  Clock,
  ConciergeBell,
} from 'lucide-react';
import { reservationsService } from '@/features/reservations/services/reservations.service';
import { useRooms } from '@/features/rooms/hooks/use-rooms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { NewReservationDialog } from '@/features/reservations/components/new-reservation-dialog';

export default function FrontDeskPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { rooms } = useRooms();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  const { data: tapeChartData, isLoading } = useQuery({
    queryKey: ['tapeChart', startDate, endDate],
    queryFn: () => reservationsService.getTapeChart(startDate, endDate),
  });

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ConciergeBell className="w-6 h-6 text-blue-600" /> Front Desk Availability Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tape chart, occupancy grid, and daily dynamic yield rates (PDF Figure 4.3).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NewReservationDialog />
        </div>
      </div>

      {/* Month Navigation Card */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span className="text-base font-bold text-slate-900">
              {monthName} {year}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevMonth} className="bg-white">
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              className="bg-white"
            >
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth} className="bg-white">
              Next Month <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Availability Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Day Header Row */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-600 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: new Date(year, month, 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-24 rounded-lg bg-slate-50 border border-dashed border-slate-200" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const isToday =
                    new Date().getDate() === dayNum &&
                    new Date().getMonth() === month &&
                    new Date().getFullYear() === year;

                  return (
                    <div
                      key={dayNum}
                      className={`h-24 rounded-lg p-2.5 flex flex-col justify-between border transition-all ${
                        isToday
                          ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isToday ? 'text-blue-700' : 'text-slate-800'
                          }`}
                        >
                          {dayNum}
                        </span>
                        {isToday && (
                          <span className="text-[9px] uppercase font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                            Today
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-blue-600 flex items-center justify-between">
                          <span>Avg Rate</span>
                          <span>{rooms.length > 0 && rooms[0]?.pricePerNight ? `$${rooms[0].pricePerNight}/d` : '-'}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between font-medium">
                          <span>Avail</span>
                          <span>{rooms.length > 0 ? `${rooms.length} Units` : '0 Units'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
