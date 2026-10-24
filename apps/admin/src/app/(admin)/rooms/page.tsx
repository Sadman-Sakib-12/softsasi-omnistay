'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AddRoomForm } from '@/features/rooms/components/add-room-form';
import { useRooms } from '@/features/rooms/hooks/use-rooms';
import { useProperties } from '@/features/properties/hooks/use-properties';
import { Room } from '@/features/rooms/services/rooms.service';
import { Calendar, ArrowLeft, Edit, Trash2, X, Save, Loader2 } from 'lucide-react';

export default function RoomManagementPage() {
  const router = useRouter();
  const { rooms, isLoading, deleteRoom, updateRoom, isUpdating } = useRooms();
  const { properties } = useProperties();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('Bulk Actions');
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    pricePerNight: 350,
    numberOfBeds: 1,
  });

  const selectedHotelName = properties[0]?.name || 'Hotel Stanford';

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(rooms.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSaveEdit = async () => {
    if (!editingRoom) return;
    try {
      await updateRoom({
        id: editingRoom.id,
        dto: {
          name: editFormData.name,
          pricePerNight: Number(editFormData.pricePerNight),
          numberOfBeds: Number(editFormData.numberOfBeds),
        },
      });
      setEditingRoom(null);
    } catch (err) {
      console.error(err);
      setEditingRoom(null);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Breadcrumb Matching Figure 3.1 in PDF */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-blue-500 font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-blue-500 font-semibold">Hotels</span>
        <span>/</span>
        <span className="text-blue-500 font-semibold">Hotel: {selectedHotelName}</span>
        <span>/</span>
        <span className="text-slate-400">Room Management</span>
      </div>

      {/* Header Matching Figure 3.1 in PDF */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Room Management
          </h1>
        </div>

        {/* Top Right Action Buttons Matching Figure 3.1 */}
        <div className="flex items-center gap-2">
          {/* Yellow Button: Room Availability */}
          <Link
            href="/rooms/availability"
            className="h-9 px-4 text-xs font-semibold text-slate-900 bg-[#fbc531] hover:bg-[#e1b12c] rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Room Availability</span>
          </Link>

          {/* Cyan/Blue Button: Back to hotel */}
          <Link
            href="/properties"
            className="h-9 px-4 text-xs font-semibold text-white bg-[#00a8ff] hover:bg-[#0097e6] rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to hotel</span>
          </Link>
        </div>
      </div>

      {/* Two-Column Split Architecture Matching Figure 3.1 in PDF */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Add Room Form) */}
        <div className="lg:col-span-5">
          <AddRoomForm />
        </div>

        {/* Right Column (Room Table) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Toolbar Matching Figure 3.1 */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option>Bulk Actions</option>
                <option>Publish</option>
                <option>Draft</option>
                <option>Delete</option>
              </select>
              <button
                type="button"
                className="h-8 px-3 text-xs font-semibold text-white bg-[#00a8ff] hover:bg-[#0097e6] rounded transition-colors shadow-2xs cursor-pointer"
                onClick={() => {
                  if (selectedIds.length === 0) {
                    alert('Please select items first');
                  } else {
                    alert(`${bulkAction} applied to ${selectedIds.length} room(s)`);
                  }
                }}
              >
                Apply
              </button>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Found {rooms.length} item
            </span>
          </div>

          {/* Table Matching Figure 3.1 */}
          <div className="bg-white border border-slate-200 rounded shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-700 font-bold">
                    <th className="py-2.5 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                        onChange={handleSelectAll}
                        checked={rooms.length > 0 && selectedIds.length === rooms.length}
                      />
                    </th>
                    <th className="py-2.5 px-3">Room name</th>
                    <th className="py-2.5 px-3 text-center">Number</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Loading rooms from backend...
                      </td>
                    </tr>
                  ) : rooms.length > 0 ? (
                    rooms.map((room) => {
                      const isChecked = selectedIds.includes(room.id);

                      return (
                        <tr
                          key={room.id}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                              checked={isChecked}
                              onChange={() => handleSelectOne(room.id)}
                            />
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {room.name}
                          </td>
                          <td className="py-3 px-3 text-center text-slate-600">
                            {room.numberOfBeds || 5}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-700">
                            ${room.pricePerNight || room.basePrice || 350}
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold text-white bg-[#2ed573]">
                              Publish
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                className="px-3 py-1 text-xs font-semibold text-white bg-[#00a8ff] hover:bg-[#0097e6] rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                                onClick={() => {
                                  setEditingRoom(room);
                                  setEditFormData({
                                    name: room.name,
                                    pricePerNight: room.pricePerNight || room.basePrice || 350,
                                    numberOfBeds: room.numberOfBeds || 1,
                                  });
                                }}
                              >
                                <Edit className="w-3 h-3" />
                                Edit
                              </button>
                              <button
                                type="button"
                                className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                                onClick={async () => {
                                  if (confirm(`Delete ${room.name}?`)) {
                                    await deleteRoom(room.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <p className="font-semibold text-slate-700">No rooms created</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Use the &quot;Add Room&quot; form on the left to add rooms to this hotel.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Room Dialog Modal */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-[#00a8ff]" /> Edit Room Details
              </h3>
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold">Room Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Price Per Night ($)</label>
                  <input
                    type="number"
                    value={editFormData.pricePerNight}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, pricePerNight: Number(e.target.value) })
                    }
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Number of Beds</label>
                  <input
                    type="number"
                    value={editFormData.numberOfBeds}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, numberOfBeds: Number(e.target.value) })
                    }
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleSaveEdit}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#00a8ff] hover:bg-[#0097e6] rounded transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
