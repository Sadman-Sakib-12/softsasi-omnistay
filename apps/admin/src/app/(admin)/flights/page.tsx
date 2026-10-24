'use client';

import React, { useState } from 'react';
import { Plane, Plus, Search, ArrowRight, Clock, Users, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { travelService, FlightItem } from '@/features/travel/services/travel.service';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function FlightsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newFlightNumber, setNewFlightNumber] = useState('OS-802');
  const [newOrigin, setNewOrigin] = useState('DAC');
  const [newDestination, setNewDestination] = useState('CXB');
  const [newSeatPrice, setNewSeatPrice] = useState('180');

  const { data: flights = [], isLoading, refetch } = useQuery({
    queryKey: ['adminFlights'],
    queryFn: () => travelService.getFlights(),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlightNumber) return;
    try {
      await travelService.createFlight({
        flightNumber: newFlightNumber,
        origin: newOrigin,
        destination: newDestination,
        seatPrice: parseFloat(newSeatPrice) || 150,
        aircraft: 'Twin Otter Seaplane',
      });
      setIsAdding(false);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Error scheduling flight');
    }
  };

  const filtered = flights.filter((f) =>
    f.flightNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Flight Charters</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Plane className="w-6 h-6 text-[#00a8ff]" /> Flight Charters & Seaplane Transfers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Private island seaplanes, helicopter charters, passenger manifests, and route schedules (Chapter 5.6).
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Route</span>
        </button>
      </div>

      {isAdding && (
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Schedule Flight Route</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Flight Number *</label>
              <input
                type="text"
                required
                value={newFlightNumber}
                onChange={(e) => setNewFlightNumber(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Origin (IATA)</label>
              <input
                type="text"
                value={newOrigin}
                onChange={(e) => setNewOrigin(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Destination (IATA)</label>
              <input
                type="text"
                value={newDestination}
                onChange={(e) => setNewDestination(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Seat Price ($)</label>
              <input
                type="number"
                value={newSeatPrice}
                onChange={(e) => setNewSeatPrice(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
              />
            </div>
            <div className="sm:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#00a8ff] hover:bg-[#0097e6] text-white">
                Save Flight
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search flights..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
          />
        </div>
        <span className="text-xs text-slate-500">Found {filtered.length} routes</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Flight</th>
              <th className="py-3 px-4">Aircraft</th>
              <th className="py-3 px-4">Route</th>
              <th className="py-3 px-4">Seat Rate</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#00a8ff]" />
                  Loading flight manifests...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No charter flight routes scheduled yet.
                </td>
              </tr>
            ) : (
              filtered.map((flight) => (
                <tr key={flight.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{flight.flightNumber}</td>
                  <td className="py-3 px-4 text-slate-500">{flight.aircraft || 'Seaplane'}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-1.5">
                    <span>{flight.origin}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span>{flight.destination}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(flight.seatPrice)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Scheduled
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
