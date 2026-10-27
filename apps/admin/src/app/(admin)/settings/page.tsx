'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Settings,
  Upload,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Save,
  Globe,
  CreditCard,
  Calendar,
  Users,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

interface LanguageTab {
  id: string;
  label: string;
  flag: string;
}

const languageTabs: LanguageTab[] = [
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { id: 'eg', label: 'Egyptian', flag: '🇪🇬' },
];

interface MainSettingItem {
  id: string;
  label: string;
  isPro?: boolean;
}

const mainSettingsList: MainSettingItem[] = [
  { id: 'general', label: 'General Settings' },
  { id: 'hotel', label: 'Hotel Settings' },
  { id: 'space', label: 'Space Settings' },
  { id: 'car', label: 'Car Settings' },
  { id: 'event', label: 'Event Settings' },
  { id: 'tour', label: 'Tour Settings' },
  { id: 'flight', label: 'Flight Settings' },
  { id: 'boat', label: 'Boat Settings' },
  { id: 'news', label: 'News Settings' },
  { id: 'booking', label: 'Booking Settings' },
  { id: 'inquiry', label: 'Inquiry Settings' },
  { id: 'user', label: 'User Settings' },
  { id: 'wallet', label: 'Wallet Settings', isPro: true },
  { id: 'vendor', label: 'Vendor Settings' },
  { id: 'user-plans', label: 'User Plans Settings' },
  { id: 'payment', label: 'Payment Settings' },
  { id: 'style', label: 'Style Settings' },
  { id: 'advanced', label: 'Advanced Settings' },
];

export default function HotelSettingsPage() {
  const [activeTab, setActiveTab] = useState<string>('hotel');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Form State for Hotel Settings (Figure 2.1)
  const [titlePage, setTitlePage] = useState('');
  const [layoutSearch, setLayoutSearch] = useState('Normal Layout');
  const [locationSearchStyle, setLocationSearchStyle] = useState('Normal');
  const [limitItemPerPage, setLimitItemPerPage] = useState('');
  const [layoutItemHotel, setLayoutItemHotel] = useState('List Item');
  const [attributeToShow, setAttributeToShow] = useState('Facilities');
  const [layoutMapOption, setLayoutMapOption] = useState('Map Left');
  const [mapLatDefault, setMapLatDefault] = useState('');
  const [mapLngDefault, setMapLngDefault] = useState('');
  const [mapZoomDefault, setMapZoomDefault] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  const currentActiveSetting = mainSettingsList.find((s) => s.id === activeTab);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Breadcrumb Matching Figure 2.1 in PDF */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-500">{currentActiveSetting?.label || 'Hotel Settings'}</span>
      </div>

      {/* Page Title Matching Figure 2.1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {currentActiveSetting?.label || 'Hotel Settings'}
        </h1>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Main Settings Architecture Matching Figure 2.1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Main Settings Subnav (Figure 2.1) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-2xs">
            {/* Header: Gear Icon + Main Settings */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
              <Settings className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-800 tracking-wide">Main Settings</span>
            </div>

            {/* List of 18 Settings Tabs */}
            <div className="p-1.5 space-y-0.5">
              {mainSettingsList.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium rounded transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#00a8ff] text-white font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.isPro && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-[#fbc531] text-slate-900 leading-none">
                        PRO
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Setting Panel (Figure 2.1 Hotel Settings) */}
        <div className="lg:col-span-9 space-y-4">
          {/* Language Selector Tabs Matching Figure 2.1 */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            {languageTabs.map((lang) => {
              const isLangSelected = selectedLanguage === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLanguage(lang.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                    isLangSelected
                      ? 'bg-white border border-slate-300 text-slate-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-sm">{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content: Figure 2.1 Hotel Settings */}
          {activeTab === 'hotel' ? (
            <div className="bg-white rounded border border-slate-200 p-6 shadow-2xs">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Left Sub-Column: Page Search Info */}
                  <div className="md:col-span-4 space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">Page Search</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Config page search of your website
                    </p>
                  </div>

                  {/* Right Sub-Column: General Options Form */}
                  <div className="md:col-span-8 space-y-5">
                    <div className="border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-bold text-slate-800">General Options</h4>
                    </div>

                    {/* Field 1: Title Page */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">Title Page</label>
                      <input
                        type="text"
                        value={titlePage}
                        onChange={(e) => setTitlePage(e.target.value)}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff] shadow-2xs"
                        placeholder="Search for hotel"
                      />
                    </div>

                    {/* Field 2: Banner Page (With Preview & Upload) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">Banner Page</label>
                      <div className="space-y-2">
                        <div className="relative w-full max-w-sm h-32 rounded border border-slate-200 overflow-hidden bg-slate-50 shadow-2xs">
                          <Image
                            src="/images/hotel-banner.jpg"
                            alt="Hotel Banner Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded cursor-pointer transition-colors shadow-2xs">
                            <Upload className="w-3.5 h-3.5 text-slate-500" />
                            <span>Upload image</span>
                            <input type="file" className="hidden" accept="image/*" />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Field 3: Layout Search */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">Layout Search</label>
                      <select
                        value={layoutSearch}
                        onChange={(e) => setLayoutSearch(e.target.value)}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff] shadow-2xs"
                      >
                        <option>Normal Layout</option>
                        <option>Grid Layout</option>
                        <option>Full Width Layout</option>
                      </select>
                    </div>

                    {/* Field 4 & 5: Location Search Style & Limit item per Page */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          Location Search Style
                        </label>
                        <select
                          value={locationSearchStyle}
                          onChange={(e) => setLocationSearchStyle(e.target.value)}
                          className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff] shadow-2xs"
                        >
                          <option>Normal</option>
                          <option>Autocomplete</option>
                          <option>Dropdown</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          Limit item per Page
                        </label>
                        <input
                          type="number"
                          value={limitItemPerPage}
                          onChange={(e) => setLimitItemPerPage(e.target.value)}
                          className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff] shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Field 6 & 7: Layout Item Hotel & Attribute to show */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          Layout Item Hotel in Page Search
                        </label>
                        <select
                          value={layoutItemHotel}
                          onChange={(e) => setLayoutItemHotel(e.target.value)}
                          className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff] shadow-2xs"
                        >
                          <option>List Item</option>
                          <option>Grid Item</option>
                          <option>Card Item</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                          Which attribute show in listing page?
                        </label>
                        <select
                          value={attributeToShow}
                          onChange={(e) => setAttributeToShow(e.target.value)}
                          className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff] shadow-2xs"
                        >
                          <option>Facilities</option>
                          <option>Amenities</option>
                          <option>Services</option>
                          <option>Policies</option>
                        </select>
                      </div>
                    </div>

                    {/* Field 8: Layout Map Option */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">Layout Map Option</label>
                      <select
                        value={layoutMapOption}
                        onChange={(e) => setLayoutMapOption(e.target.value)}
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff] shadow-2xs"
                      >
                        <option>Map Left</option>
                        <option>Map Right</option>
                        <option>Map Top</option>
                        <option>No Map</option>
                      </select>
                    </div>

                    {/* Field 9, 10, 11: Map Coordinates & Zoom */}
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-700">
                            Map Lat Default
                          </label>
                          <input
                            type="text"
                            value={mapLatDefault}
                            onChange={(e) => setMapLatDefault(e.target.value)}
                            className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff] shadow-2xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-700">
                            Map Lng Default
                          </label>
                          <input
                            type="text"
                            value={mapLngDefault}
                            onChange={(e) => setMapLngDefault(e.target.value)}
                            className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff] shadow-2xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-700">
                            Map Zoom Default
                          </label>
                          <input
                            type="text"
                            value={mapZoomDefault}
                            onChange={(e) => setMapZoomDefault(e.target.value)}
                            className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff] shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Helper link matching Figure 2.1 */}
                      <p className="text-[11px] text-slate-500 pt-1">
                        Get lat - lng in here{' '}
                        <a
                          href="https://www.latlong.net"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#00a8ff] hover:underline"
                        >
                          https://www.latlong.net
                        </a>
                      </p>
                    </div>

                    {/* Field 12: Icon Marker in Map */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">
                        Icon Marker in Map
                      </label>
                      <div className="w-24 h-24 rounded border border-dashed border-slate-300 flex flex-col items-center justify-center p-2 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                        <MapPin className="w-6 h-6 text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500 font-medium">Select Icon</span>
                      </div>
                    </div>

                    {/* Save Changes Button Matching Figure 2.1 */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        type="submit"
                        className="h-9 px-6 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          ) : activeTab === 'general' ? (
            /* General Settings Panel */
            <div className="bg-white rounded border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-800">Site Identity & Localization</h4>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Site Title</label>
                  <input
                    type="text"
                    placeholder="e.g. OmniStay"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Site Description</label>
                  <input
                    type="text"
                    placeholder="Enter platform meta description"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Admin Email</label>
                    <input
                      type="email"
                      placeholder="admin@example.com"
                      className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Default Currency</label>
                    <input
                      type="text"
                      placeholder="e.g. USD ($)"
                      className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="h-9 px-6 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'payment' ? (
            /* Payment Settings Panel */
            <div className="bg-white rounded border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-800">Enterprise Payment Processors</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'Stripe Connect', status: 'Active', desc: 'Credit / Debit Cards, Apple Pay' },
                  { name: 'bKash Merchant', status: 'Active', desc: 'Automated Tokenized Checkout' },
                  { name: 'Nagad Gateway', status: 'Active', desc: 'Direct Merchant Settlement' },
                  { name: 'SSLCommerz', status: 'Active', desc: 'Multi-Gateway Aggregator' },
                  { name: 'PayPal Commerce', status: 'Active', desc: 'International Guest Payments' },
                  { name: 'Adyen Hospitality', status: 'Active', desc: 'Front Desk POS Terminal' },
                ].map((p) => (
                  <div key={p.name} className="p-3.5 rounded border border-slate-200 bg-slate-50/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{p.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{p.desc}</p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSave}
                  className="h-9 px-6 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          ) : (
            /* Generic Settings Panel for other tabs */
            <div className="bg-white rounded border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-800">
                  {currentActiveSetting?.label} Options
                </h4>
              </div>
              <div className="py-8 text-center text-slate-500 space-y-2">
                <Settings className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs">
                  Configuration parameters for {currentActiveSetting?.label} are managed by OmniStay enterprise engine.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleSave}
                  className="h-9 px-6 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
