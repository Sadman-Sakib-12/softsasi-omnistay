'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building,
  BedDouble,
  Compass,
  Car,
  Ship,
  Calendar,
  Plane,
  CreditCard,
  Mail,
  ShieldCheck,
  Save,
  Globe,
  Sliders,
  MapPin,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const GlobalConfigHubSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('hotel');
  const [siteTitle, setSiteTitle] = useState('Softsasi OmniStay 360 Enterprise');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [defaultTimezone, setDefaultTimezone] = useState('Asia/Dhaka');
  const [defaultLat, setDefaultLat] = useState('5.1500');
  const [defaultLng, setDefaultLng] = useState('73.0167');
  const [saved, setSaved] = useState(false);

  const categories = [
    { id: 'hotel', label: 'Hotel Settings', icon: Building },
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'room', label: 'Room Settings', icon: BedDouble },
    { id: 'space', label: 'Space Settings', icon: Compass },
    { id: 'car', label: 'Car Settings', icon: Car },
    { id: 'boat', label: 'Boat Settings', icon: Ship },
    { id: 'tour', label: 'Tour Settings', icon: Compass },
    { id: 'event', label: 'Event Settings', icon: Calendar },
    { id: 'flight', label: 'Flight Settings', icon: Plane },
    { id: 'payment', label: 'Payment Settings', icon: CreditCard },
    { id: 'sender', label: 'Sender / Email Settings', icon: Mail },
    { id: 'admin', label: 'User Admin & RBAC', icon: ShieldCheck },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Dashboard</span>
        <span>/</span>
        <span>Settings</span>
        <span>/</span>
        <span className="text-slate-200 font-semibold">Global Configuration Hub</span>
      </div>

      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Unified Platform Centralized Administration Engine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Replicating Figure 2.1: Unified Platform Centralized Administration Engine & Global Configuration Hub.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{saved ? '✓ Settings Saved' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* Two-Column Layout matching Figure 2.1: Settings Categories Left, Form Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sub-Menu matching Figure 2.1 */}
        <div className="lg:col-span-4 p-4 rounded-2xl glass-panel space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Configuration Modules
          </p>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors text-left',
                  isSelected
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40',
                )}
              >
                <Icon className={cn('w-4 h-4', isSelected ? 'text-sky-400' : 'text-slate-500')} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Form Options matching Figure 2.1 */}
        <div className="lg:col-span-8 p-6 rounded-2xl glass-panel space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white capitalize">
              {selectedCategory} Configuration & Parameters
            </h3>
            <p className="text-xs text-slate-400">
              System variables and regional settings for current tenant organization
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Platform Brand Title</label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Accounting Base Currency</label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  <option value="USD">USD ($ - United States Dollar)</option>
                  <option value="BDT">BDT (৳ - Bangladeshi Taka)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Property Standard Timezone</label>
                <select
                  value={defaultTimezone}
                  onChange={(e) => setDefaultTimezone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                >
                  <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                  <option value="Indian/Maldives">Indian/Maldives (GMT+5)</option>
                  <option value="Europe/London">Europe/London (GMT+0)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Map Latitude Default</label>
                <input
                  type="text"
                  value={defaultLat}
                  onChange={(e) => setDefaultLat(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Map Longitude Default</label>
                <input
                  type="text"
                  value={defaultLng}
                  onChange={(e) => setDefaultLng(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-200">Page Search & Search Box Layout</span>
              <p className="text-[11px] text-slate-400">
                Configure search filter styles (Normal, Modern Hero Banner, Dropdown Drawer) across public booking portal.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
