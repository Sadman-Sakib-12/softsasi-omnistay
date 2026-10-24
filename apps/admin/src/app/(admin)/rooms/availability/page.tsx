'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useRooms } from '@/features/rooms/hooks/use-rooms';
import { useProperties } from '@/features/properties/hooks/use-properties';

export default function AvailabilityCalendarPage() {
  const { rooms } = useRooms();
  const { properties } = useProperties();
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
  const [currentMonthYear, setCurrentMonthYear] = useState('October 2026');

  const selectedHotelName = properties[0]?.name || 'Hotel Stanford';

  const defaultRoomsList = rooms.length > 0
    ? rooms.map((r, i) => ({
        id: r.id,
        label: `#${rooms.length - i} - ${r.name}`,
        price: r.pricePerNight || r.basePrice || 350,
        inventory: r.numberOfBeds || 5,
      }))
    : [
        { id: '4', label: '#4 - Standard Double Room', price: 350, inventory: 5 },
        { id: '3', label: '#3 - Double Room With Town View', price: 350, inventory: 5 },
        { id: '2', label: '#2 - Room Sheraton Hotel', price: 350, inventory: 5 },
        { id: '1', label: '#1 - Room Kerama Islands', price: 350, inventory: 5 },
      ];

  const currentRoom = defaultRoomsList[selectedRoomIndex] || defaultRoomsList[0];

  // Calendar dates matrix for October 2026 matching Figure 4.3 (Starts Thursday Oct 1)
  const calendarCells = [
    // Week 1 (Sept 28 - Oct 4)
    { date: 28, isPrevMonth: true, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 29, isPrevMonth: true, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 30, isPrevMonth: true, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 1, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 2, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 3, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 4, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    // Week 2 (Oct 5 - Oct 11)
    { date: 5, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 6, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 7, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 8, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 9, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 10, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 11, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    // Week 3 (Oct 12 - Oct 18)
    { date: 12, isPrevMonth: false, isHighlighted: true, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 13, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 14, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 15, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 16, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 17, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 18, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    // Week 4 (Oct 19 - Oct 25)
    { date: 19, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 20, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 21, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 22, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 23, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 24, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 25, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    // Week 5 (Oct 26 - Nov 1)
    { date: 26, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 27, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 28, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 29, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 30, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 31, isPrevMonth: false, price: currentRoom.price, qty: currentRoom.inventory },
    { date: 1, isNextMonth: true, price: currentRoom.price, qty: currentRoom.inventory },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Breadcrumb Matching Figure 4.3 in PDF */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-blue-500 font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-blue-500 font-semibold">Hotels</span>
        <span>/</span>
        <span className="text-blue-500 font-semibold">Hotel: {selectedHotelName}</span>
        <span>/</span>
        <span className="text-slate-400">Availability</span>
      </div>

      {/* Header Matching Figure 4.3 in PDF */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Room Availability Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing 1 - {defaultRoomsList.length} of {defaultRoomsList.length} rooms
          </p>
        </div>

        <div>
          <Link
            href="/rooms"
            className="h-9 px-4 text-xs font-semibold text-white bg-[#00a8ff] hover:bg-[#0097e6] rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Room Management</span>
          </Link>
        </div>
      </div>

      {/* Grid Layout Matching Figure 4.3 in PDF */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Room Availability List */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/70">
            <h2 className="text-xs font-bold text-slate-700">Availability</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {defaultRoomsList.map((roomItem, idx) => {
              const isSelected = selectedRoomIndex === idx;

              return (
                <button
                  key={roomItem.id}
                  type="button"
                  onClick={() => setSelectedRoomIndex(idx)}
                  className={`w-full text-left p-3.5 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/80 font-bold text-blue-600 border-l-4 border-blue-500'
                      : 'text-blue-500 hover:bg-slate-50/80 font-medium'
                  }`}
                >
                  <span>{roomItem.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Month Calendar Matrix Grid */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded shadow-2xs p-5">
          {/* Calendar Controls Matching Figure 4.3 */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
            <h3 className="text-base font-bold text-slate-900">
              {currentMonthYear}
            </h3>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="h-8 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded shadow-2xs cursor-pointer"
                onClick={() => setCurrentMonthYear('October 2026')}
              >
                Today
              </button>
              <button
                type="button"
                className="h-8 w-8 flex items-center justify-center text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded shadow-2xs cursor-pointer"
                onClick={() => setCurrentMonthYear('September 2026')}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="h-8 w-8 flex items-center justify-center text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded shadow-2xs cursor-pointer"
                onClick={() => setCurrentMonthYear('November 2026')}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border border-slate-200 bg-slate-50/70 text-center text-xs font-bold text-slate-700">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="py-2.5 border-r last:border-r-0 border-slate-200">
                {day}
              </div>
            ))}
          </div>

          {/* Day Cells Matrix */}
          <div className="grid grid-cols-7 border-l border-b border-slate-200">
            {calendarCells.map((cell, cIdx) => (
              <div
                key={cIdx}
                className={`min-h-[80px] p-2 border-r border-t border-slate-200 text-xs flex flex-col justify-between transition-colors ${
                  cell.isHighlighted
                    ? 'bg-amber-50/60'
                    : cell.isPrevMonth || cell.isNextMonth
                    ? 'bg-slate-50/40 text-slate-400'
                    : 'bg-white hover:bg-slate-50/60 text-slate-800'
                }`}
              >
                <div className="text-right text-[11px] font-semibold">
                  {cell.date}
                </div>

                <div className="mt-2 text-center">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold text-white bg-[#00a8ff] shadow-2xs">
                    ${cell.price} x {cell.qty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
