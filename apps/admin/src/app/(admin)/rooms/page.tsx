'use client';

import React from 'react';
import { BedDouble, DollarSign, Trash2, Calendar, Hotel, CheckCircle } from 'lucide-react';
import { AddRoomForm } from '@/features/rooms/components/add-room-form';
import { useRooms } from '@/features/rooms/hooks/use-rooms';
import { DataTable, Column } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Room } from '@/features/rooms/services/rooms.service';

export default function RoomsPage() {
  const { rooms, isLoading, deleteRoom } = useRooms();

  const columns: Column<Room>[] = [
    {
      header: 'Room Unit',
      accessorKey: 'name',
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 font-bold">
            <BedDouble className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">{item.name}</div>
            <div className="text-[11px] text-slate-500">Unit #{item.roomNumber || '—'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (item) => <span className="text-slate-700 font-medium">{item.roomType || 'Deluxe Room'}</span>,
    },
    {
      header: 'Price / Night',
      cell: (item) => (
        <span className="font-bold text-blue-600">
          {formatCurrency(item.pricePerNight || item.basePrice || 0)}
        </span>
      ),
    },
    {
      header: 'Beds & Capacity',
      cell: (item) => (
        <span className="text-slate-700 font-medium">
          {item.numberOfBeds || 1} Bed(s)
        </span>
      ),
    },
    {
      header: 'Min/Max Stay',
      cell: (item) => (
        <span className="text-slate-500">
          {item.minStay || 1} - {item.maxStay || 30} Nights
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (item) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            if (confirm(`Delete room ${item.name}?`)) {
              await deleteRoom(item.id);
            }
          }}
          className="hover:text-rose-600 hover:bg-rose-50 text-slate-400"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header (PDF Figure 3.1 "Room Management") */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-blue-600" /> Room & Bed Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Physical room units, inventory capacity, and base rate pricing hierarchy (PDF Figure 3.1).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Add Room Form Card */}
        <div className="lg:col-span-1">
          <AddRoomForm />
        </div>

        {/* Room Table */}
        <div className="lg:col-span-2">
          <DataTable
            data={rooms}
            columns={columns}
            isLoading={isLoading}
            searchKey="name"
            searchPlaceholder="Search rooms..."
            emptyTitle="No Rooms Added Yet"
            emptySubtitle="Fill out the 'Add Room' form to register your first accommodation unit."
          />
        </div>
      </div>
    </div>
  );
}
