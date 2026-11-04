'use client';
import { BeatLoader } from 'react-spinners';

import React, { useState } from 'react';
import { Plane, Plus, Search, ArrowRight, Clock, Users, Loader2, Edit, Trash2, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { travelService, FlightItem } from '@/features/travel/services/travel.service';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function FlightsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingFlight, setEditingFlight] = useState<FlightItem | null>(null);

  const [newFlightNumber, setNewFlightNumber] = useState('');
  const [newOrigin, setNewOrigin] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newSeatPrice, setNewSeatPrice] = useState('');
  const [newAircraft, setNewAircraft] = useState('DHC-6 Twin Otter Seaplane');

  const { data: flights = [], isLoading, refetch } = useQuery({
    queryKey: ['adminFlights'],
    queryFn: () => travelService.getFlights(),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlightNumber) return;
    try {
      await travelService.createFlight({
        flightNumber: newFlightNumber.toUpperCase().trim(),
        origin: newOrigin.toUpperCase().trim() || 'DAC',
        destination: newDestination.toUpperCase().trim() || 'CXB',
        seatPrice: parseFloat(newSeatPrice) || 0,
        aircraft: newAircraft || 'DHC-6 Twin Otter Seaplane',
      });
      setIsAdding(false);
      setNewFlightNumber('');
      setNewOrigin('');
      setNewDestination('');
      setNewSeatPrice('');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Error scheduling flight');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlight) return;
    try {
      await travelService.updateFlight(editingFlight.id, {
        flightNumber: editingFlight.flightNumber.toUpperCase(),
        origin: editingFlight.origin.toUpperCase(),
        destination: editingFlight.destination.toUpperCase(),
        aircraft: editingFlight.aircraft,
        seatPrice: Number(editingFlight.seatPrice),
      });
      setEditingFlight(null);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Error updating flight route');
    }
  };

  const handleDelete = async (id: string, flightNumber: string) => {
    if (confirm(`Are you sure you want to cancel flight route "${flightNumber}"?`)) {
      try {
        await travelService.deleteFlight(id);
        refetch();
      } catch (err: any) {
        alert(err.message || 'Error deleting flight route');
      }
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
                placeholder="e.g. OS-802"
                value={newFlightNumber}
                onChange={(e) => setNewFlightNumber(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 uppercase focus:outline-none focus:border-[#00a8ff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Origin (IATA / City)</label>
              <input
                type="text"
                placeholder="e.g. DAC (Dhaka)"
                value={newOrigin}
                onChange={(e) => setNewOrigin(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Destination (IATA / City)</label>
              <input
                type="text"
                placeholder="e.g. CXB (Cox's Bazar)"
                value={newDestination}
                onChange={(e) => setNewDestination(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Seat Fare ($)</label>
              <input
                type="number"
                placeholder="0.00"
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
                Save Route
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
        <span className="text-xs text-slate-500">Found {filtered.length} scheduled routes</span>
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
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  <div className="py-2"><BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} /></div>
                  Loading flight manifests...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
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
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingFlight(flight)}
                        className="p-1 text-slate-500 hover:text-[#00a8ff] transition-colors rounded hover:bg-slate-100"
                        title="Edit Flight"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(flight.id, flight.flightNumber)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded hover:bg-rose-50"
                        title="Delete Flight"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Flight Modal */}
      {editingFlight && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plane className="w-4 h-4 text-[#00a8ff]" /> Edit Flight Route Profile
              </h3>
              <button
                type="button"
                onClick={() => setEditingFlight(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Flight Number *</label>
                  <input
                    type="text"
                    required
                    value={editingFlight.flightNumber}
                    onChange={(e) => setEditingFlight({ ...editingFlight, flightNumber: e.target.value.toUpperCase() })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 uppercase font-mono font-bold focus:outline-none focus:border-[#00a8ff]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Origin</label>
                    <input
                      type="text"
                      required
                      value={editingFlight.origin}
                      onChange={(e) => setEditingFlight({ ...editingFlight, origin: e.target.value.toUpperCase() })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Destination</label>
                    <input
                      type="text"
                      required
                      value={editingFlight.destination}
                      onChange={(e) => setEditingFlight({ ...editingFlight, destination: e.target.value.toUpperCase() })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Aircraft Type</label>
                    <input
                      type="text"
                      value={editingFlight.aircraft || 'Seaplane'}
                      onChange={(e) => setEditingFlight({ ...editingFlight, aircraft: e.target.value })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Seat Fare ($)</label>
                    <input
                      type="number"
                      required
                      value={editingFlight.seatPrice}
                      onChange={(e) => setEditingFlight({ ...editingFlight, seatPrice: Number(e.target.value) })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFlight(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#00a8ff] hover:bg-[#0097e6] rounded transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
