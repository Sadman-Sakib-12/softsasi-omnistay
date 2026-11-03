'use client';

import React, { useState } from 'react';
import { Tag, Plus, CheckCircle2, Edit, Trash2, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PropertyAttribute {
  id: string;
  name: string;
  category: string;
  itemsCount: number;
  status: string;
}

const INITIAL_ATTRIBUTES: PropertyAttribute[] = [
  { id: '1', name: 'Infinity Swimming Pool', category: 'Facilities', itemsCount: 12, status: 'Active' },
  { id: '2', name: 'Private Beach Access', category: 'Location Features', itemsCount: 6, status: 'Active' },
  { id: '3', name: '24/7 Fine Dining Restaurant', category: 'Dining', itemsCount: 18, status: 'Active' },
  { id: '4', name: 'Luxury Spa & Sauna', category: 'Wellness', itemsCount: 9, status: 'Active' },
  { id: '5', name: 'Helipad & Seaplane Dock', category: 'Transport', itemsCount: 3, status: 'Active' },
];

export default function PropertyAttributesPage() {
  const [attributes, setAttributes] = useState<PropertyAttribute[]>(INITIAL_ATTRIBUTES);
  const [searchTerm, setSearchTerm] = useState('');

  // Create Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Facilities');

  // Edit Modal
  const [editingAttr, setEditingAttr] = useState<PropertyAttribute | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Facilities');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created: PropertyAttribute = {
      id: `attr-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      itemsCount: 0,
      status: 'Active',
    };

    setAttributes((prev) => [...prev, created]);
    setIsAddOpen(false);
    setNewName('');
    setNewCategory('Facilities');
  };

  const openEditModal = (att: PropertyAttribute) => {
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
    if (confirm(`Delete attribute "${name}"?`)) {
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
        <span className="text-slate-400">Hotels / Attributes</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#00a8ff]" /> Property Attributes & Facilities
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global amenity catalog, property badges, and listing filter tags (Chapter 4.1.1).
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Attribute</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Filter attributes by name or category..."
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
              <th className="py-3 px-4">Attribute Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Properties Tagged</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((att) => (
              <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-900">{att.name}</td>
                <td className="py-3 px-4 text-slate-600">{att.category}</td>
                <td className="py-3 px-4 text-slate-600 font-bold">{att.itemsCount} properties</td>
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
                      title="Edit attribute"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(att.id, att.name)}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50 cursor-pointer"
                      title="Delete attribute"
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
              <h3 className="font-bold text-slate-900 text-sm">Add Property Attribute</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Attribute Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heated Rooftop Pool"
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
                  <option value="Facilities">Facilities</option>
                  <option value="Location Features">Location Features</option>
                  <option value="Dining">Dining</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Transport">Transport</option>
                  <option value="Business">Business</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs">
                  Add Attribute
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
              <h3 className="font-bold text-slate-900 text-sm">Edit Attribute</h3>
              <button onClick={() => setEditingAttr(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Attribute Name *</label>
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
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs outline-none bg-white focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Facilities">Facilities</option>
                  <option value="Location Features">Location Features</option>
                  <option value="Dining">Dining</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Transport">Transport</option>
                  <option value="Business">Business</option>
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
