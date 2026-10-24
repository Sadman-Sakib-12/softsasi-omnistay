'use client';

import React, { useState } from 'react';
import { useAdminStore } from '../../store/adminStore';
import {
  BedDouble,
  Plus,
  Trash2,
  Edit,
  DollarSign,
  Layers,
  Sparkles,
  CheckCircle2,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export const RoomManagementSection: React.FC = () => {
  const { properties, selectedPropertyId } = useAdminStore();

  const selectedHotel = properties.find((p) => p.id === selectedPropertyId) || properties[0];

  const [roomsList, setRoomsList] = useState([
    { id: '1', name: 'Deluxe Oceanfront Villa', number: '101', price: 650, beds: '1 King Bed', minStay: 1, maxStay: 30, status: 'Publish' },
    { id: '2', name: 'Deluxe Oceanfront Villa', number: '102', price: 650, beds: '1 King Bed', minStay: 1, maxStay: 30, status: 'Publish' },
    { id: '3', name: 'Overwater Sunset Bungalow', number: '103', price: 850, beds: '1 King Bed + Sun Deck', minStay: 2, maxStay: 14, status: 'Publish' },
    { id: '4', name: 'Presidential Royal Suite', number: '201', price: 2400, beds: '2 King Beds + Private Plunge Pool', minStay: 3, maxStay: 30, status: 'Publish' },
  ]);

  const [form, setForm] = useState({
    name: '',
    number: '',
    price: 500,
    beds: '1 King Size Bed (76x80 in)',
    minStay: 1,
    maxStay: 14,
  });

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.number) return;

    setRoomsList([
      ...roomsList,
      {
        id: String(Date.now()),
        name: form.name,
        number: form.number,
        price: Number(form.price),
        beds: form.beds,
        minStay: Number(form.minStay),
        maxStay: Number(form.maxStay),
        status: 'Publish',
      },
    ]);

    setForm({
      name: '',
      number: '',
      price: 500,
      beds: '1 King Size Bed (76x80 in)',
      minStay: 1,
      maxStay: 14,
    });
  };

  const handleDeleteRoom = (id: string) => {
    setRoomsList(roomsList.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb matching Figure 3.1 in PDF */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Dashboard</span>
        <span>/</span>
        <span>Hotels</span>
        <span>/</span>
        <span>{selectedHotel?.name || 'Grand Azure Resort'}</span>
        <span>/</span>
        <span className="text-slate-200 font-semibold">Room Management</span>
      </div>

      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Room Management & Inventory Hierarchy</h1>
          <p className="text-xs text-slate-400 mt-1">
            Replicating Figure 3.1: Room Bed Configuration, Inventory Capacity, and Physical Room Number Mapping.
          </p>
        </div>
      </div>

      {/* Two-Column Layout matching Figure 3.1: Form on Left, Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Add Room */}
        <div className="lg:col-span-5 p-5 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <BedDouble className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Add New Room Unit</h3>
          </div>

          <form onSubmit={handleAddRoom} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Room Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Deluxe Ocean Suite"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Room Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 105"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Base Price / Night ($) *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bed Configuration Matrix</label>
              <select
                value={form.beds}
                onChange={(e) => setForm({ ...form, beds: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
              >
                <option value="1 King Size Bed (76x80 in)">1 King Size Bed (76x80 in)</option>
                <option value="1 Queen Size Bed (60x80 in)">1 Queen Size Bed (60x80 in)</option>
                <option value="2 Twin Single Beds (38x75 in)">2 Twin Single Beds (38x75 in)</option>
                <option value="2 Double Beds + Sofa Bed">2 Double Beds + Sofa Bed</option>
                <option value="Bunk Beds (Family Unit)">Bunk Beds (Family Unit)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Minimum Day Stay</label>
                <input
                  type="number"
                  min={1}
                  value={form.minStay}
                  onChange={(e) => setForm({ ...form, minStay: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Maximum Day Stay</label>
                <input
                  type="number"
                  min={1}
                  value={form.maxStay}
                  onChange={(e) => setForm({ ...form, maxStay: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-all shadow-md shadow-sky-500/20 active:scale-95"
              >
                + Save Room Unit
              </button>
            </div>
          </form>
        </div>

        {/* Right Table: Active Rooms Table matching Figure 3.1 */}
        <div className="lg:col-span-7 rounded-2xl glass-panel overflow-hidden border border-slate-800">
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Configured Room Units ({roomsList.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Room Name</th>
                  <th className="py-2.5 px-3">Number</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {roomsList.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-100">{room.name}</p>
                      <p className="text-[10px] text-slate-400">{room.beds}</p>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-sky-400">
                      #{room.number}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-emerald-400">
                      {formatCurrency(room.price)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {room.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                        title="Delete Room"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
