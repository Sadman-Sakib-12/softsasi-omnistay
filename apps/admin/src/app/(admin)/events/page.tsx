'use client';
import { BeatLoader } from 'react-spinners';

import React, { useState } from 'react';
import { CalendarCheck, Plus, Search, Ticket, MapPin, Users, Loader2, Edit, Trash2, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { travelService, EventItem } from '@/features/travel/services/travel.service';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newVenue, setNewVenue] = useState('Grand Ballroom');
  const [newPrice, setNewPrice] = useState('');
  const [newTotalTickets, setNewTotalTickets] = useState('200');

  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ['adminEvents'],
    queryFn: () => travelService.getEvents(),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    try {
      await travelService.createEvent({
        title: newTitle,
        venue: newVenue || 'Grand Ballroom',
        ticketPrice: parseFloat(newPrice) || 0,
        totalTickets: parseInt(newTotalTickets) || 200,
        eventType: 'Gala Banquet',
      });
      setIsAdding(false);
      setNewTitle('');
      setNewVenue('Grand Ballroom');
      setNewPrice('');
      setNewTotalTickets('200');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Error creating event');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      await travelService.updateEvent(editingEvent.id, {
        title: editingEvent.title,
        venue: editingEvent.venue,
        ticketPrice: Number(editingEvent.ticketPrice),
        totalTickets: Number(editingEvent.totalTickets || 200),
        eventType: editingEvent.eventType || 'Gala Banquet',
      });
      setEditingEvent(null);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Error updating event');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to cancel event "${title}"?`)) {
      try {
        await travelService.deleteEvent(id);
        refetch();
      } catch (err: any) {
        alert(err.message || 'Error deleting event');
      }
    }
  };

  const filtered = events.filter((ev) =>
    ev.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Event Ticketing</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-[#00a8ff]" /> Event Ticketing & Conferences
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gala banquets, summits, QR code gate pass verification, and tiered ticket sales (Chapter 5.5).
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Event</span>
        </button>
      </div>

      {isAdding && (
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">New Event Profile</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-slate-700">Event Title *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Annual Hospitality Tech Summit 2026"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Venue</label>
              <input
                type="text"
                placeholder="e.g. Grand Ballroom"
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Ticket Price ($)</label>
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
                Save Event
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
            placeholder="Search events..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
          />
        </div>
        <span className="text-xs text-slate-500">Found {filtered.length} events</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Event Title</th>
              <th className="py-3 px-4">Venue</th>
              <th className="py-3 px-4">Ticket Price</th>
              <th className="py-3 px-4">Capacity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  <div className="py-2"><BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} /></div>
                  Loading events...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No ticketed events created yet.
                </td>
              </tr>
            ) : (
              filtered.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{event.title}</td>
                  <td className="py-3 px-4 text-slate-500">{event.venue || 'Hotel Main Hall'}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(event.ticketPrice)}</td>
                  <td className="py-3 px-4 text-slate-500">{event.totalTickets || 200} Passes</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      On Sale
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingEvent(event)}
                        className="p-1 text-slate-500 hover:text-[#00a8ff] transition-colors rounded hover:bg-slate-100"
                        title="Edit Event"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id, event.title)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded hover:bg-rose-50"
                        title="Delete Event"
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

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#00a8ff]" /> Edit Event Ticketing
              </h3>
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Venue / Location</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.venue || 'Grand Ballroom'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Ticket Price ($)</label>
                    <input
                      type="number"
                      required
                      value={editingEvent.ticketPrice}
                      onChange={(e) => setEditingEvent({ ...editingEvent, ticketPrice: Number(e.target.value) })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Capacity (Passes)</label>
                    <input
                      type="number"
                      value={editingEvent.totalTickets || 200}
                      onChange={(e) => setEditingEvent({ ...editingEvent, totalTickets: Number(e.target.value) })}
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
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
