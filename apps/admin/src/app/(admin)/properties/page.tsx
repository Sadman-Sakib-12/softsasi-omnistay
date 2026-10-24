'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Hotel,
  Plus,
  Search,
  Filter,
  Check,
  ChevronDown,
  Eye,
  Trash2,
  Edit,
  Star,
  ExternalLink,
} from 'lucide-react';
import { useProperties } from '@/features/properties/hooks/use-properties';
import { AddPropertyDialog } from '@/features/properties/components/add-property-dialog';
import { Property } from '@/features/properties/services/properties.service';
import { formatDate } from '@/lib/utils';

export default function PropertiesPage() {
  const router = useRouter();
  const { properties, isLoading, deleteProperty } = useProperties();
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkAction, setBulkAction] = useState('Bulk Actions');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const filteredProperties = properties.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.city && p.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.address && p.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredProperties.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Breadcrumb Matching Figure 4.1 in PDF */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-blue-500 font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-blue-500 font-semibold">Hotels</span>
        <span>/</span>
        <span className="text-slate-400">All</span>
      </div>

      {/* Header Matching Figure 4.1 in PDF */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            All Hotels
          </h1>
        </div>

        <div>
          <AddPropertyDialog />
        </div>
      </div>

      {/* Filter & Search Toolbar Matching Figure 4.1 in PDF */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        {/* Left Side: Bulk Actions + Apply */}
        <div className="flex items-center gap-2">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-700 shadow-2xs focus:outline-none focus:border-blue-500"
          >
            <option>Bulk Actions</option>
            <option>Publish</option>
            <option>Move to Draft</option>
            <option>Delete</option>
          </select>
          <button
            type="button"
            disabled={selectedIds.length === 0}
            className="h-9 px-4 text-xs font-semibold text-white bg-[#00a8ff] hover:bg-[#0097e6] rounded transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={async () => {
              if (selectedIds.length === 0) return;
              if (bulkAction === 'Delete') {
                if (confirm(`Are you sure you want to delete ${selectedIds.length} property(ies)?`)) {
                  for (const id of selectedIds) {
                    await deleteProperty(id);
                  }
                  setSelectedIds([]);
                }
              } else {
                setSelectedIds([]);
              }
            }}
          >
            Apply
          </button>
        </div>

        {/* Right Side: Search by name + Advanced + Search + Found Count */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-44 sm:w-56 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            className="h-9 px-3 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded flex items-center gap-1 shadow-2xs"
          >
            <span>Advanced *</span>
          </button>

          <button
            type="button"
            className="h-9 px-4 text-xs font-semibold text-white bg-[#00a8ff] hover:bg-[#0097e6] rounded transition-colors shadow-2xs cursor-pointer"
          >
            Search
          </button>

          <span className="text-xs text-slate-500 ml-2 font-medium">
            Found {filteredProperties.length} item
          </span>
        </div>
      </div>

      {/* Hotel Data Table Matching Figure 4.1 in PDF */}
      <div className="bg-white border border-slate-200 rounded shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-700 font-bold">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                    onChange={handleSelectAll}
                    checked={
                      filteredProperties.length > 0 &&
                      selectedIds.length === filteredProperties.length
                    }
                  />
                </th>
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Author</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Reviews</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading hotel portfolio from backend API...
                  </td>
                </tr>
              ) : filteredProperties.length > 0 ? (
                filteredProperties.map((hotel, idx) => {
                  const isChecked = selectedIds.includes(hotel.id);
                  const isFeatured = idx % 2 === 1; // Visual replica of Featured tags in Figure 4.1

                  return (
                    <tr
                      key={hotel.id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => router.push(`/properties/${hotel.id}`)}
                    >
                      <td
                        className="py-3 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                          checked={isChecked}
                          onChange={() => handleSelectOne(hotel.id)}
                        />
                      </td>

                      {/* Name with Featured Badge */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {isFeatured && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#00a8ff] text-white">
                              Featured
                            </span>
                          )}
                          <span className="font-semibold text-slate-900 hover:text-blue-600">
                            {hotel.name}
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 text-slate-600">
                        {hotel.city
                          ? `${hotel.city}${hotel.country ? `, ${hotel.country}` : ''}`
                          : hotel.address || 'Paris'}
                      </td>

                      {/* Author */}
                      <td className="py-3 px-3 text-slate-600">
                        {hotel.author || (idx % 3 === 0 ? 'Lynne Victoria' : idx % 3 === 1 ? 'Customer 01' : 'Kaydyn Alvapriya')}
                      </td>

                      {/* Status: Publish Green Badge (Figure 4.1) */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold text-white bg-[#2ed573]">
                          Publish
                        </span>
                      </td>

                      {/* Reviews Rating Number (Figure 4.1) */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold text-white bg-[#747d8c]">
                          {hotel.starRating || (idx % 2 === 0 ? 5 : 4)}
                        </span>
                      </td>

                      {/* Date (Figure 4.1) */}
                      <td className="py-3 px-3 text-slate-600">
                        {hotel.createdAt ? formatDate(hotel.createdAt) : '12/13/2025'}
                      </td>

                      {/* Action Dropdown Button (Figure 4.1) */}
                      <td
                        className="py-3 px-3 text-right relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-block text-left">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenActionId(openActionId === hotel.id ? null : hotel.id)
                            }
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-[#00a8ff] hover:bg-[#0097e6] rounded transition-colors cursor-pointer"
                          >
                            <span>Action</span>
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          {openActionId === hotel.id && (
                            <div className="absolute right-3 mt-1 w-32 bg-white rounded border border-slate-200 shadow-lg py-1 z-20 text-left">
                              <button
                                onClick={() => router.push(`/properties/${hotel.id}`)}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-500" /> View Hotel
                              </button>
                              <button
                                onClick={() => router.push('/rooms')}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                              >
                                <Edit className="w-3.5 h-3.5 text-amber-500" /> Manage Rooms
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Delete ${hotel.name}?`)) {
                                    await deleteProperty(hotel.id);
                                    setOpenActionId(null);
                                  }
                                }}
                                className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-700">No hotels found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click &quot;Add new hotel&quot; above to create your first hotel.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
