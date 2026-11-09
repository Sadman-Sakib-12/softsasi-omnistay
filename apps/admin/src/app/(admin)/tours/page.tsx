'use client';

import React, { useState } from 'react';
import { Compass, Plus, Search, MapPin, Users, Clock, DollarSign, CheckCircle2, Loader2, Edit, Trash2, X } from 'lucide-react';
import { BeatLoader } from 'react-spinners';
import { useQuery } from '@tanstack/react-query';
import { travelService, TourItem } from '@/features/travel/services/travel.service';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { showConfirm, showAlert } from '@/lib/sweetalert';

export default function ToursPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTour, setEditingTour] = useState<TourItem | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDuration, setNewDuration] = useState('Full Day');
  const [newCategory, setNewCategory] = useState('Adventure');

  const { data: tours = [], isLoading, refetch } = useQuery({
    queryKey: ['adminTours'],
    queryFn: () => travelService.getTours(),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    try {
      await travelService.createTour({
        title: newTitle,
        price: parseFloat(newPrice) || 0,
        duration: newDuration || 'Full Day',
        category: newCategory || 'Adventure',
        minPax: 2,
        maxPax: 12,
      });
      setIsAdding(false);
      setNewTitle('');
      setNewPrice('');
      setNewCategory('Adventure');
      setNewDuration('Full Day');
      refetch();
    } catch (err: any) {
      showAlert({ title: 'Error', text: err.message || 'Error creating tour package', icon: 'error' });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTour) return;
    try {
      await travelService.updateTour(editingTour.id, {
        title: editingTour.title,
        price: Number(editingTour.price),
        duration: editingTour.duration,
        category: editingTour.category,
        minPax: Number(editingTour.minPax || 2),
        maxPax: Number(editingTour.maxPax || 12),
      });
      setEditingTour(null);
      refetch();
    } catch (err: any) {
      showAlert({ title: 'Error', text: err.message || 'Error updating tour package', icon: 'error' });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await showConfirm({
      title: 'Remove Tour Package?',
      text: `Are you sure you want to remove tour package "${title}"?`,
      confirmButtonText: 'Yes, Remove',
      icon: 'warning',
    });
    if (confirmed) {
      try {
        await travelService.deleteTour(id);
        refetch();
        showAlert({ title: 'Removed', text: `Tour "${title}" has been deleted.`, icon: 'success' });
      } catch (err: any) {
        showAlert({ title: 'Error', text: err.message || 'Error deleting tour package', icon: 'error' });
      }
    }
  };

  const filtered = tours.filter((t) =>
    t.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Tours & Activities</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#00a8ff]" /> Tours & Guided Excursions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Day-by-day itineraries, age-tier pricing, tour guides, and vehicle dispatch (Chapter 5.2).
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tour Package</span>
        </button>
      </div>

      {/* Add Tour Form (Collapsible) */}
      {isAdding && (
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Add Tour Package</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-slate-700">Tour Title *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Sundarbans Mangrove Wildlife Safari (3D/2N)"
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
                <option value="Adventure">Adventure</option>
                <option value="Cultural & Heritage">Cultural & Heritage</option>
                <option value="Island Cruise">Island Cruise</option>
                <option value="Culinary Trail">Culinary Trail</option>
                <option value="Nature Trek">Nature Trek</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Price per Person ($)</label>
              <input
                type="number"
                placeholder="0.00"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
              />
            </div>
            <div className="sm:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#00a8ff] hover:bg-[#0097e6] text-white">
                Save Package
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tours..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
          />
        </div>
        <span className="text-xs text-slate-500">Found {filtered.length} tours</span>
      </div>

      {/* Tours Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Tour Title</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Capacity (Pax)</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
                    <span className="text-xs font-semibold text-slate-400 animate-pulse">Loading tours from backend...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No tour packages created yet. Click "Add Tour Package" to create the first package.
                </td>
              </tr>
            ) : (
              filtered.map((tour) => (
                <tr key={tour.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{tour.title}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-[10px]">
                      {tour.category || 'Adventure'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{tour.duration || 'Full Day'}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {tour.minPax || 2} - {tour.maxPax || 12} Persons
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(tour.price)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Publish
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingTour(tour)}
                        className="p-1 text-slate-500 hover:text-[#00a8ff] transition-colors rounded hover:bg-slate-100"
                        title="Edit Package"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tour.id, tour.title)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded hover:bg-rose-50"
                        title="Delete Package"
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

      {/* Edit Tour Modal Dialog */}
      {editingTour && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#00a8ff]" /> Edit Tour Package
              </h3>
              <button
                type="button"
                onClick={() => setEditingTour(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Tour Title *</label>
                  <input
                    type="text"
                    required
                    value={editingTour.title}
                    onChange={(e) => setEditingTour({ ...editingTour, title: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Category</label>
                    <select
                      value={editingTour.category || 'Adventure'}
                      onChange={(e) => setEditingTour({ ...editingTour, category: e.target.value })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    >
                      <option value="Adventure">Adventure</option>
                      <option value="Cultural & Heritage">Cultural & Heritage</option>
                      <option value="Island Cruise">Island Cruise</option>
                      <option value="Culinary Trail">Culinary Trail</option>
                      <option value="Nature Trek">Nature Trek</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Price per Pax ($)</label>
                    <input
                      type="number"
                      required
                      value={editingTour.price}
                      onChange={(e) => setEditingTour({ ...editingTour, price: Number(e.target.value) })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Duration</label>
                    <input
                      type="text"
                      value={editingTour.duration || 'Full Day'}
                      onChange={(e) => setEditingTour({ ...editingTour, duration: e.target.value })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Max Guests</label>
                    <input
                      type="number"
                      value={editingTour.maxPax || 12}
                      onChange={(e) => setEditingTour({ ...editingTour, maxPax: Number(e.target.value) })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTour(null)}
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
