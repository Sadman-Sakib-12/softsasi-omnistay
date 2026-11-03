'use client';

import React, { useState } from 'react';
import { BedDouble, Plus, Edit, Trash2, X, Search, Wifi, Tv, Wind, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RoomAttribute {
  id: string;
  name: string;
  category: string;
  roomsCount: number;
  status: string;
}

const INITIAL_ROOM_ATTRIBUTES: RoomAttribute[] = [
  { id: '1', name: 'High-Speed Wi-Fi 6', category: 'Technology', roomsCount: 38, status: 'Active' },
  { id: '2', name: 'Smart Digital Climate Control / HVAC', category: 'Comfort', roomsCount: 38, status: 'Active' },
  { id: '3', name: '65-inch 4K Smart TV with AirPlay', category: 'Technology', roomsCount: 24, status: 'Active' },
  { id: '4', name: 'Nespresso Gourmet Coffee Machine', category: 'Refreshment', roomsCount: 16, status: 'Active' },
  { id: '5', name: 'Marble Deep Soaking Bathtub', category: 'Bathroom & Wellness', roomsCount: 8, status: 'Active' },
];

export default function RoomAttributesPage() {
  const [attributes, setAttributes] = useState<RoomAttribute[]>(INITIAL_ROOM_ATTRIBUTES);
  const [searchTerm, setSearchTerm] = useState('');

  // Create Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Technology');

  // Edit Modal
  const [editingAttr, setEditingAttr] = useState<RoomAttribute | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Technology');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created: RoomAttribute = {
      id: `room-attr-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      roomsCount: 0,
      status: 'Active',
    };

    setAttributes((prev) => [...prev, created]);
    setIsAddOpen(false);
    setNewName('');
    setNewCategory('Technology');
  };

  const openEditModal = (att: RoomAttribute) => {
    setEditingAttr(att);
    setEditName(att.name);
    setEditCategory(att.category);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttr || !editName.trim()) return;

    setAttributes((prev) =>
      prev.map((a) =>
        a.id === editingAttr.id
          ? { ...a, name: editName.trim(), category: editCategory }
          : a
      )
    );
    setEditingAttr(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete room amenity "${name}"?`)) {
      setAttributes((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const filtered = attributes.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Hotels / Room Attributes</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-[#00a8ff]" /> Room Amenities & Bed Attributes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            In-room technology, bed classifications, and wellness amenities taxonomy (Chapter 4.1.2.4).
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room Attribute</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Filter room amenities by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder-slate-400"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">
            Clear
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Amenity Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Rooms Equipped</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((att) => (
              <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-900">{att.name}</td>
                <td className="py-3 px-4 text-slate-600">{att.category}</td>
                <td className="py-3 px-4 text-slate-600 font-bold">{att.roomsCount} units</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => openEditModal(att)}
                      className="p-1 rounded text-blue-600 hover:bg-blue-50 cursor-pointer"
                      title="Edit amenity"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(att.id, att.name)}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50 cursor-pointer"
                      title="Delete amenity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Add Room Amenity</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Amenity Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ergonomic Workstation & Chair"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs outline-none bg-white focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Technology">Technology</option>
                  <option value="Comfort">Comfort</option>
                  <option value="Refreshment">Refreshment</option>
                  <option value="Bathroom & Wellness">Bathroom & Wellness</option>
                  <option value="Bedding">Bedding</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs">
                  Add Amenity
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingAttr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Edit Amenity</h3>
              <button onClick={() => setEditingAttr(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Amenity Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs outline-none bg-white focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Technology">Technology</option>
                  <option value="Comfort">Comfort</option>
                  <option value="Refreshment">Refreshment</option>
                  <option value="Bathroom & Wellness">Bathroom & Wellness</option>
                  <option value="Bedding">Bedding</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingAttr(null)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
