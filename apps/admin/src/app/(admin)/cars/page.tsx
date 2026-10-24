'use client';

import React, { useState } from 'react';
import { Car, Plus, Search, Fuel, Settings2, Users, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { travelService, CarItem } from '@/features/travel/services/travel.service';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function CarsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newModel, setNewModel] = useState('');
  const [newCategory, setNewCategory] = useState('Executive SUV');
  const [newDailyRate, setNewDailyRate] = useState('120');

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
        category: newCategory,
        dailyRate: parseFloat(newDailyRate) || 80,
        seats: 5,
        transmission: 'Automatic',
        fuelType: 'Hybrid',
      });
      setIsAdding(false);
      setNewModel('');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Error creating vehicle');
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
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
              >
                <option>Executive SUV</option>
                <option>Luxury Sedan</option>
                <option>Passenger Van (12-Seater)</option>
                <option>Electric EV</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Daily Rate ($)</label>
              <input
                type="number"
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
            placeholder="Search vehicle fleet..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
          />
        </div>
        <span className="text-xs text-slate-500">Found {filtered.length} vehicles</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Vehicle Model</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Specs</th>
              <th className="py-3 px-4">Daily Rate</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#00a8ff]" />
                  Loading fleet data...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
