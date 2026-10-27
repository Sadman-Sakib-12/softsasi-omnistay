'use client';

import React, { useState } from 'react';
import { MapPin, Plus, Search, Globe, Building, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LocationItem {
  id: string;
  name: string;
  country: string;
  city: string;
  propertiesCount: number;
  status: string;
}

import { useQuery } from '@tanstack/react-query';
import { propertiesService, Property } from '@/features/properties/services/properties.service';

export default function LocationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [newLoc, setNewLoc] = useState({
    name: '',
    city: '',
    country: 'Bangladesh',
    propertiesCount: 1,
    status: 'Active',
  });

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['properties'],
    queryFn: () => propertiesService.getAll(),
  });

  // Derive dynamic locations purely from database properties
  const derivedLocations: LocationItem[] = React.useMemo(() => {
    const locMap = new Map<string, LocationItem>();
    properties.forEach((p) => {
      const city = p.city || 'Unspecified';
      const country = p.country || 'Bangladesh';
      const key = `${city}-${country}`.toLowerCase();
      if (!locMap.has(key)) {
        locMap.set(key, {
          id: `loc-${key}`,
          name: `${city} Destination`,
          city,
          country,
          propertiesCount: 1,
          status: 'Active',
        });
      } else {
        const item = locMap.get(key)!;
        item.propertiesCount += 1;
      }
    });
    return Array.from(locMap.values());
  }, [properties]);

  const [customLocations, setCustomLocations] = useState<LocationItem[]>([]);

  const locations = [...derivedLocations, ...customLocations];

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoc.name || !newLoc.city) return;
    setCustomLocations((prev) => [
      ...prev,
      { id: `loc-${Date.now()}`, ...newLoc, propertiesCount: 1 },
    ]);
    setIsAddLocationOpen(false);
    setNewLoc({ name: '', city: '', country: 'Bangladesh', propertiesCount: 1, status: 'Active' });
  };

  const filtered = locations.filter((l) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Locations</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#00a8ff]" /> Destinations & Location Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global geographic hierarchies, city coordinates, travel hubs, and destination SEO (Chapter 4.1.1).
          </p>
        </div>

        <button
          onClick={() => setIsAddLocationOpen(true)}
          className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Location</span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search destinations..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
          />
        </div>
        <span className="text-xs text-slate-500">Found {filtered.length} locations</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Destination Name</th>
              <th className="py-3 px-4">City</th>
              <th className="py-3 px-4">Country</th>
              <th className="py-3 px-4">Properties</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((loc) => (
              <tr key={loc.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#00a8ff]" />
                  <span>{loc.name}</span>
                </td>
                <td className="py-3 px-4 text-slate-600">{loc.city}</td>
                <td className="py-3 px-4 text-slate-600">{loc.country}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{loc.propertiesCount} Hotels</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {loc.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Location Modal Dialog */}
      {isAddLocationOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00a8ff]" /> Add Destination Location
              </h3>
              <button
                type="button"
                onClick={() => setIsAddLocationOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddLocation}>
              <div className="p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Destination Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kuakata Coastal Haven"
                    value={newLoc.name}
                    onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Patuakhali"
                      value={newLoc.city}
                      onChange={(e) => setNewLoc({ ...newLoc, city: e.target.value })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Country *</label>
                    <input
                      type="text"
                      required
                      value={newLoc.country}
                      onChange={(e) => setNewLoc({ ...newLoc, country: e.target.value })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Initial Properties</label>
                    <input
                      type="number"
                      value={newLoc.propertiesCount}
                      onChange={(e) => setNewLoc({ ...newLoc, propertiesCount: Number(e.target.value) })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Status</label>
                    <select
                      value={newLoc.status}
                      onChange={(e) => setNewLoc({ ...newLoc, status: e.target.value })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
                    >
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Under Review">Under Review</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLocationOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#00a8ff] hover:bg-[#0097e6] rounded transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
