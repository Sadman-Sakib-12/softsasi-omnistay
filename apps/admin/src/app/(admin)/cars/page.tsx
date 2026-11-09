'use client';
import { BeatLoader } from 'react-spinners';

import React, { useState } from 'react';
import { Car, Plus, Search, Fuel, Settings2, Users, Loader2, Edit, Trash2, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { travelService, CarItem } from '@/features/travel/services/travel.service';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { showConfirm, showAlert } from '@/lib/sweetalert';

export default function CarsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingCar, setEditingCar] = useState<CarItem | null>(null);

  const [newModel, setNewModel] = useState('');
  const [newCategory, setNewCategory] = useState('Executive SUV');
  const [newDailyRate, setNewDailyRate] = useState('');

  const { data: cars = [], isLoading, refetch } = useQuery({
    queryKey: ['adminCars'],
    queryFn: () => travelService.getCars(),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel) return;
    try {
      await travelService.createCar({
        model: newModel,
        category: newCategory || 'Executive SUV',
        dailyRate: parseFloat(newDailyRate) || 0,
        seats: 5,
        transmission: 'Automatic',
        fuelType: 'Hybrid',
      });
      setIsAdding(false);
      setNewModel('');
      setNewDailyRate('');
      setNewCategory('Executive SUV');
      refetch();
    } catch (err: any) {
      showAlert({ title: 'Error', text: err.message || 'Error creating vehicle', icon: 'error' });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCar) return;
    try {
      await travelService.updateCar(editingCar.id, {
        model: editingCar.model,
        category: editingCar.category,
        dailyRate: Number(editingCar.dailyRate),
        seats: Number(editingCar.seats),
        transmission: editingCar.transmission,
        fuelType: editingCar.fuelType,
      });
      setEditingCar(null);
      refetch();
    } catch (err: any) {
      showAlert({ title: 'Error', text: err.message || 'Error updating vehicle', icon: 'error' });
    }
  };

  const handleDelete = async (id: string, model: string) => {
    const confirmed = await showConfirm({
      title: 'Remove Vehicle?',
      text: `Are you sure you want to remove "${model}" from the vehicle fleet?`,
      confirmButtonText: 'Yes, Remove',
      icon: 'warning',
    });
    if (confirmed) {
      try {
        await travelService.deleteCar(id);
        refetch();
        showAlert({ title: 'Removed', text: `Vehicle "${model}" has been deleted.`, icon: 'success' });
      } catch (err: any) {
        showAlert({ title: 'Error', text: err.message || 'Error deleting vehicle', icon: 'error' });
      }
    }
  };

  const filtered = cars.filter((c) =>
    c.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Car Rental Fleet</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Car className="w-6 h-6 text-[#00a8ff]" /> Car Rental & Fleet Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chauffeur-driven luxury transfers, self-drive rentals, mileage policies, and insurance waivers (Chapter 5.3).
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {isAdding && (
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Add Vehicle to Fleet</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Vehicle Model *</label>
              <input
                type="text"
                required
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                placeholder="e.g. Mercedes-Benz E-Class / Range Rover Sport"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Category</label>
              <select
                required
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
              >
                <option value="Executive SUV">Executive SUV</option>
                <option value="Luxury Sedan">Luxury Sedan</option>
                <option value="Passenger Van (12-Seater)">Passenger Van (12-Seater)</option>
                <option value="Electric EV">Electric EV</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Daily Rate ($)</label>
              <input
                type="number"
                placeholder="0.00"
                value={newDailyRate}
                onChange={(e) => setNewDailyRate(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#00a8ff] hover:bg-[#0097e6] text-white">
                Save Vehicle
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
            placeholder="Search vehicles..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
          />
        </div>
        <span className="text-xs text-slate-500">Found {filtered.length} vehicles</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Model</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Specifications</th>
              <th className="py-3 px-4">Daily Rate</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  <div className="py-2"><BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} /></div>
                  Loading fleet data...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No vehicles registered in fleet yet.
                </td>
              </tr>
            ) : (
              filtered.map((car) => (
                <tr key={car.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{car.model}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-[10px]">
                      {car.category || 'SUV'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {car.seats || 5} Seats · {car.transmission || 'Auto'} · {car.fuelType || 'Hybrid'}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(car.dailyRate)}/day</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Available
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingCar(car)}
                        className="p-1 text-slate-500 hover:text-[#00a8ff] transition-colors rounded hover:bg-slate-100"
                        title="Edit Vehicle"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(car.id, car.model)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded hover:bg-rose-50"
                        title="Delete Vehicle"
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

      {/* Edit Vehicle Modal */}
      {editingCar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Car className="w-4 h-4 text-[#00a8ff]" /> Edit Vehicle Fleet Profile
              </h3>
              <button
                type="button"
                onClick={() => setEditingCar(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Model Name *</label>
                  <input
                    type="text"
                    required
                    value={editingCar.model}
                    onChange={(e) => setEditingCar({ ...editingCar, model: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Category</label>
                    <select
                      value={editingCar.category || 'Executive SUV'}
                      onChange={(e) => setEditingCar({ ...editingCar, category: e.target.value })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    >
                      <option value="Executive SUV">Executive SUV</option>
                      <option value="Luxury Sedan">Luxury Sedan</option>
                      <option value="Passenger Van (12-Seater)">Passenger Van (12-Seater)</option>
                      <option value="Electric EV">Electric EV</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Daily Rate ($)</label>
                    <input
                      type="number"
                      required
                      value={editingCar.dailyRate}
                      onChange={(e) => setEditingCar({ ...editingCar, dailyRate: Number(e.target.value) })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Seats</label>
                    <input
                      type="number"
                      value={editingCar.seats || 5}
                      onChange={(e) => setEditingCar({ ...editingCar, seats: Number(e.target.value) })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Gear</label>
                    <select
                      value={editingCar.transmission || 'Automatic'}
                      onChange={(e) => setEditingCar({ ...editingCar, transmission: e.target.value })}
                      className="w-full h-8 px-2 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    >
                      <option value="Automatic">Auto</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Fuel</label>
                    <select
                      value={editingCar.fuelType || 'Hybrid'}
                      onChange={(e) => setEditingCar({ ...editingCar, fuelType: e.target.value })}
                      className="w-full h-8 px-2 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    >
                      <option value="Hybrid">Hybrid</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Electric">Electric</option>
                      <option value="Diesel">Diesel</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCar(null)}
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
