'use client';
import { BeatLoader } from 'react-spinners';

import React, { useState } from 'react';
import { Home, Plus, Search, Users, Maximize, Clock, Loader2, Edit, Trash2, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { travelService, SpaceItem } from '@/features/travel/services/travel.service';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { showConfirm, showAlert } from '@/lib/sweetalert';

export default function SpacesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingSpace, setEditingSpace] = useState<SpaceItem | null>(null);

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Meeting Room');
  const [newCapacity, setNewCapacity] = useState('');
  const [newHourlyRate, setNewHourlyRate] = useState('');

  const { data: spaces = [], isLoading, refetch } = useQuery({
    queryKey: ['adminSpaces'],
    queryFn: () => travelService.getSpaces(),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    try {
      await travelService.createSpace({
        name: newName,
        category: newCategory || 'Meeting Room',
        capacity: parseInt(newCapacity) || 1,
        hourlyRate: parseFloat(newHourlyRate) || 0,
      });
      setIsAdding(false);
      setNewName('');
      setNewCategory('Meeting Room');
      setNewCapacity('');
      setNewHourlyRate('');
      refetch();
    } catch (err: any) {
      showAlert({ title: 'Error', text: err.message || 'Error creating venue space', icon: 'error' });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpace) return;
    try {
      await travelService.updateSpace(editingSpace.id, {
        name: editingSpace.name,
        category: editingSpace.category,
        capacity: Number(editingSpace.capacity),
        hourlyRate: Number(editingSpace.hourlyRate),
        dailyRate: Number(editingSpace.dailyRate || 0),
      });
      setEditingSpace(null);
      refetch();
    } catch (err: any) {
      showAlert({ title: 'Error', text: err.message || 'Error updating space', icon: 'error' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await showConfirm({
      title: 'Remove Space?',
      text: `Are you sure you want to remove "${name}" from venue listings?`,
      confirmButtonText: 'Yes, Remove',
      icon: 'warning',
    });
    if (confirmed) {
      try {
        await travelService.deleteSpace(id);
        refetch();
        showAlert({ title: 'Removed', text: `Space "${name}" has been deleted.`, icon: 'success' });
      } catch (err: any) {
        showAlert({ title: 'Error', text: err.message || 'Error deleting space', icon: 'error' });
      }
    }
  };

  const filtered = spaces.filter((s) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Spaces & Coworking</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Home className="w-6 h-6 text-[#00a8ff]" /> Coworking Spaces & Venue Rentals
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Banquet halls, private meeting rooms, hot-desks, and hourly slot reservations (Chapter 5.1).
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Space</span>
        </button>
      </div>

      {isAdding && (
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">New Space / Venue Profile</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-slate-700">Space Name *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Royal Crystal Ballroom"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
              >
                <option value="Meeting Room">Meeting Room</option>
                <option value="Banquet Hall">Banquet Hall</option>
                <option value="Conference Auditorium">Conference Auditorium</option>
                <option value="Private Office">Private Office</option>
                <option value="Hot-Desk Co-Working">Hot-Desk Co-Working</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Hourly Rate ($)</label>
              <input
                type="number"
                placeholder="0.00"
                value={newHourlyRate}
                onChange={(e) => setNewHourlyRate(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
              />
            </div>
            <div className="sm:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#00a8ff] hover:bg-[#0097e6] text-white">
                Save Venue
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
            placeholder="Search venue spaces..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
          />
        </div>
        <span className="text-xs text-slate-500">Found {filtered.length} spaces</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Venue Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Capacity</th>
              <th className="py-3 px-4">Hourly Rate</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  <div className="py-2"><BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} /></div>
                  Loading venue spaces...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No coworking or venue spaces created yet.
                </td>
              </tr>
            ) : (
              filtered.map((space) => (
                <tr key={space.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{space.name}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-[10px]">
                      {space.category || 'Meeting Room'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{space.capacity || 10} Persons</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(space.hourlyRate)}/hr</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Publish
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingSpace(space)}
                        className="p-1 text-slate-500 hover:text-[#00a8ff] transition-colors rounded hover:bg-slate-100"
                        title="Edit Space"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(space.id, space.name)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded hover:bg-rose-50"
                        title="Delete Space"
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

      {/* Edit Space Modal */}
      {editingSpace && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Home className="w-4 h-4 text-[#00a8ff]" /> Edit Venue Space Profile
              </h3>
              <button
                type="button"
                onClick={() => setEditingSpace(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Space / Venue Name *</label>
                  <input
                    type="text"
                    required
                    value={editingSpace.name}
                    onChange={(e) => setEditingSpace({ ...editingSpace, name: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Category</label>
                    <select
                      value={editingSpace.category || 'Meeting Room'}
                      onChange={(e) => setEditingSpace({ ...editingSpace, category: e.target.value })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    >
                      <option value="Meeting Room">Meeting Room</option>
                      <option value="Banquet Hall">Banquet Hall</option>
                      <option value="Conference Auditorium">Conference Auditorium</option>
                      <option value="Private Office">Private Office</option>
                      <option value="Hot-Desk Co-Working">Hot-Desk Co-Working</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Hourly Rate ($)</label>
                    <input
                      type="number"
                      required
                      value={editingSpace.hourlyRate}
                      onChange={(e) => setEditingSpace({ ...editingSpace, hourlyRate: Number(e.target.value) })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Capacity (Guests)</label>
                    <input
                      type="number"
                      value={editingSpace.capacity || 10}
                      onChange={(e) => setEditingSpace({ ...editingSpace, capacity: Number(e.target.value) })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Daily Rate ($)</label>
                    <input
                      type="number"
                      value={editingSpace.dailyRate || 0}
                      onChange={(e) => setEditingSpace({ ...editingSpace, dailyRate: Number(e.target.value) })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSpace(null)}
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
