'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/adminStore';
import {
  Building2,
  Plus,
  Search,
  Star,
  MapPin,
  Calendar,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { PropertyDto } from '../../services/api';

export const AllHotelsSection: React.FC = () => {
  const {
    properties,
    fetchProperties,
    createProperty,
    isLoading,
    errorMessage,
    addHotelModalOpen,
    setAddHotelModalOpen,
    setActiveTab,
    setSelectedPropertyId,
  } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [newHotelForm, setNewHotelForm] = useState<PropertyDto>({
    name: '',
    code: '',
    propertyType: 'hotel',
    starRating: 5,
    address: '',
    timezone: 'Asia/Dhaka',
    currency: 'USD',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const filteredProperties = properties.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.address && p.address.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHotelForm.name || !newHotelForm.code) return;

    setSubmitting(true);
    try {
      await createProperty(newHotelForm);
      setNewHotelForm({
        name: '',
        code: '',
        propertyType: 'hotel',
        starRating: 5,
        address: '',
        timezone: 'Asia/Dhaka',
        currency: 'USD',
        checkInTime: '14:00',
        checkOutTime: '11:00',
        status: 'active',
      });
    } catch {
      // Error handled in store
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb matching Figure 4.1 */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Dashboard</span>
        <span>/</span>
        <span>Hotels</span>
        <span>/</span>
        <span className="text-slate-200 font-semibold">All</span>
      </div>

      {/* Header matching Figure 4.1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">All Hotels</h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise property portfolio overview synced with PostgreSQL <code className="text-sky-400">properties</code> table.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchProperties()}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh from Backend"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </button>
          <button
            onClick={() => setAddHotelModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add new hotel</span>
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Backend Gateway Notice: {errorMessage}</span>
        </div>
      )}

      {/* Table Toolbar matching Figure 4.1 */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <select className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none">
            <option>Bulk Actions</option>
            <option>Publish Selected</option>
            <option>Archive Selected</option>
          </select>
          <button className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold transition-colors">
            Apply
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Data Table matching Figure 4.1 */}
      <div className="rounded-2xl glass-panel overflow-hidden border border-slate-800/80 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4 w-10">
                  <input type="checkbox" className="rounded border-slate-700" />
                </th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Property Code</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Operating Hours</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProperties.length > 0 ? (
                filteredProperties.map((hotel) => (
                  <tr key={hotel.id || hotel.code} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <input type="checkbox" className="rounded border-slate-700" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-sky-400" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">{hotel.name}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{hotel.propertyType || 'Hotel'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{hotel.address || 'Address not configured'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-400">
                      {hotel.code}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {hotel.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: hotel.starRating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      In: {hotel.checkInTime || '14:00'} | Out: {hotel.checkOutTime || '11:00'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            if (hotel.id) setSelectedPropertyId(hotel.id);
                            setActiveTab('room-management');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-[11px] font-semibold transition-colors"
                        >
                          Manage Rooms
                        </button>
                        <button
                          onClick={() => {
                            if (hotel.id) setSelectedPropertyId(hotel.id);
                            setActiveTab('tape-chart');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
                        >
                          Tape Chart
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-200">
                        No Hotel Properties Found
                      </p>
                      <p className="text-xs text-slate-400">
                        No property records returned from backend <code className="text-sky-400">GET /api/v1/properties</code> for this tenant organization. Provision your first hotel property to start managing rooms and reservations.
                      </p>
                      <button
                        onClick={() => setAddHotelModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-lg shadow-sky-500/20"
                      >
                        + Provision New Hotel
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Hotel Modal (Real API form connecting to POST /api/v1/properties) */}
      {addHotelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl glass-dropdown border border-sky-500/30 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div>
                <h3 className="text-base font-bold text-white">Add New Hotel Property</h3>
                <p className="text-xs text-slate-400">
                  Provisions a new property record in PostgreSQL <code className="text-sky-400">properties</code> table
                </p>
              </div>
              <button
                onClick={() => setAddHotelModalOpen(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHotel} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hotel Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grand Azure Resort & Spa"
                    value={newHotelForm.name}
                    onChange={(e) => setNewHotelForm({ ...newHotelForm, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Property Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GAZ-01"
                    value={newHotelForm.code}
                    onChange={(e) => setNewHotelForm({ ...newHotelForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Property Type</label>
                  <select
                    value={newHotelForm.propertyType}
                    onChange={(e) => setNewHotelForm({ ...newHotelForm, propertyType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="hotel">Boutique Hotel</option>
                    <option value="resort">Luxury Beach Resort</option>
                    <option value="villa">Private Villa Collection</option>
                    <option value="apartments">Serviced Apartments</option>
                    <option value="chalet">Mountain Chalet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Star Rating (1 - 5)</label>
                  <select
                    value={newHotelForm.starRating}
                    onChange={(e) => setNewHotelForm({ ...newHotelForm, starRating: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value={5}>★★★★★ (5 Stars)</option>
                    <option value={4}>★★★★☆ (4 Stars)</option>
                    <option value={3}>★★★☆☆ (3 Stars)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Address / Geolocation</label>
                <input
                  type="text"
                  placeholder="e.g. Baa Atoll Biosphere Reserve, Maldives"
                  value={newHotelForm.address}
                  onChange={(e) => setNewHotelForm({ ...newHotelForm, address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Standard Check-In Time</label>
                  <input
                    type="time"
                    value={newHotelForm.checkInTime}
                    onChange={(e) => setNewHotelForm({ ...newHotelForm, checkInTime: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Standard Check-Out Time</label>
                  <input
                    type="time"
                    value={newHotelForm.checkOutTime}
                    onChange={(e) => setNewHotelForm({ ...newHotelForm, checkOutTime: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddHotelModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-lg shadow-sky-500/20 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Saving to Backend...' : 'Create Hotel Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
