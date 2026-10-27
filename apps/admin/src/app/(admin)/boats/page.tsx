'use client';

import React, { useState } from 'react';
import { Ship, Plus, Search, Anchor, Users, Compass, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { travelService, BoatItem } from '@/features/travel/services/travel.service';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function BoatsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newVesselType, setNewVesselType] = useState('');
  const [newHourlyRate, setNewHourlyRate] = useState('');

  const { data: boats = [], isLoading, refetch } = useQuery({
    queryKey: ['adminBoats'],
    queryFn: () => travelService.getBoats(),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    try {
      await travelService.createBoat({
        name: newName,
        vesselType: newVesselType || 'Luxury Motor Yacht',
        hourlyRate: parseFloat(newHourlyRate) || 0,
        capacity: 12,
        lengthFt: 52,
      });
      setIsAdding(false);
      setNewName('');
      setNewHourlyRate('');
      setNewVesselType('');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Error registering vessel');
    }
  };

  const filtered = boats.filter((b) =>
    b.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Boat & Yacht Charters</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Ship className="w-6 h-6 text-[#00a8ff]" /> Boat & Yacht Charter Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Luxury motor yachts, sailing catamarans, island transfers, and skippered charters (Chapter 5.4).
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vessel</span>
        </button>
      </div>

      {isAdding && (
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Add Vessel / Charter Fleet</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Vessel Name *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Ocean Pearl 60ft Motor Yacht"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Vessel Type</label>
              <select
                required
                value={newVesselType}
                onChange={(e) => setNewVesselType(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
              >
                <option value="" disabled>Select Vessel Type...</option>
                <option value="Luxury Motor Yacht">Luxury Motor Yacht</option>
                <option value="Sailing Catamaran">Sailing Catamaran</option>
                <option value="High-Speed Ferry">High-Speed Ferry</option>
                <option value="Jet Ski Fleet">Jet Ski Fleet</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Charter Rate ($/hr)</label>
              <input
                type="number"
                placeholder="0.00"
                value={newHourlyRate}
                onChange={(e) => setNewHourlyRate(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#00a8ff] hover:bg-[#0097e6] text-white">
                Save Vessel
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
            placeholder="Search vessels..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
          />
        </div>
        <span className="text-xs text-slate-500">Found {filtered.length} vessels</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Vessel Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Capacity</th>
              <th className="py-3 px-4">Length</th>
              <th className="py-3 px-4">Charter Rate</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#00a8ff]" />
                  Loading maritime fleet...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No boats or yachts registered in fleet yet.
                </td>
              </tr>
            ) : (
              filtered.map((boat) => (
                <tr key={boat.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{boat.name}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-[10px]">
                      {boat.vesselType || 'Motor Yacht'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{boat.capacity || 10} Cruising Pax</td>
                  <td className="py-3 px-4 text-slate-500">{boat.lengthFt || 48} ft</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(boat.hourlyRate)}/hr</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Docked & Ready
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
