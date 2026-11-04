'use client';
import { BeatLoader } from 'react-spinners';

import React, { useState, useEffect } from 'react';
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
  Palette,
  ShieldCheck,
  Camera,
  RefreshCw,
  Loader2,
  Plus,
  Trash2,
  Lock,
  Sun,
  Moon,
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

  // Chapter 4.1.1.4: Brand Customization & White-Labeling State
  const [brandLogoUrl, setBrandLogoUrl] = useState('/images/omnistay-logo.png');
  const [brandLogoDarkUrl, setBrandLogoDarkUrl] = useState('/images/omnistay-logo-dark.png');
  const [brandFaviconUrl, setBrandFaviconUrl] = useState('/favicon.ico');
  const [brandHeaderBannerUrl, setBrandHeaderBannerUrl] = useState('/images/hotel-banner.jpg');
  const [brandPrimaryColor, setBrandPrimaryColor] = useState('#00a8ff');
  const [brandAccentColor, setBrandAccentColor] = useState('#0097e6');
  const [brandCustomDomain, setBrandCustomDomain] = useState('grandresort.softsasi.com');
  const [brandSubdomain, setBrandSubdomain] = useState('grandresort');
  const [brandSslStatus, setBrandSslStatus] = useState('active');
  const [brandSslIssuer, setBrandSslIssuer] = useState("Cloudflare for SaaS / Let's Encrypt Authority X3");
  const [brandGallery, setBrandGallery] = useState<any[]>([
    { id: 'gal-1', title: 'Grand Resort Façade & Entrance', category: 'Exterior', url: '/images/gallery/exterior-1.jpg', width: 1920, height: 1080 },
    { id: 'gal-2', title: 'Atrium Grand Chandelier Lobby', category: 'Lobby', url: '/images/gallery/lobby-1.jpg', width: 1920, height: 1080 },
    { id: 'gal-3', title: 'Presidential Oceanfront Penthouse Suite', category: 'Suite', url: '/images/gallery/suite-1.jpg', width: 1920, height: 1080 },
    { id: 'gal-4', title: 'Infinity Heated Horizon Pool', category: 'Pool', url: '/images/gallery/pool-1.jpg', width: 1920, height: 1080 },
    { id: 'gal-5', title: 'Michelin Star Fine Dining Restaurant', category: 'Restaurant', url: '/images/gallery/restaurant-1.jpg', width: 1920, height: 1080 },
    { id: 'gal-6', title: 'Himalayan Salt Sauna & Ayurvedic Spa', category: 'Spa', url: '/images/gallery/spa-1.jpg', width: 1920, height: 1080 },
  ]);
  const [galleryFilter, setGalleryFilter] = useState('all');
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);
  const [domainVerifyNotice, setDomainVerifyNotice] = useState<string | null>(null);
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  // Load branding from backend
  useEffect(() => {
    fetch('http://localhost:4000/api/v1/organizations/55c3849e-0fa3-4b52-9c2d-b4cbe23e9525/branding')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.logoUrl) setBrandLogoUrl(data.logoUrl);
          if (data.logoDarkUrl) setBrandLogoDarkUrl(data.logoDarkUrl);
          if (data.faviconUrl) setBrandFaviconUrl(data.faviconUrl);
          if (data.headerBannerUrl) setBrandHeaderBannerUrl(data.headerBannerUrl);
          if (data.primaryColor) setBrandPrimaryColor(data.primaryColor);
          if (data.accentColor) setBrandAccentColor(data.accentColor);
          if (data.customDomain) setBrandCustomDomain(data.customDomain);
          if (data.subdomain) setBrandSubdomain(data.subdomain);
          if (data.sslStatus) setBrandSslStatus(data.sslStatus);
          if (data.sslIssuer) setBrandSslIssuer(data.sslIssuer);
          if (data.gallery && data.gallery.length > 0) setBrandGallery(data.gallery);
        }
      })
      .catch((err) => console.error('Failed to load branding:', err));
  }, []);

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBranding(true);
    try {
      const res = await fetch(
        'http://localhost:4000/api/v1/organizations/55c3849e-0fa3-4b52-9c2d-b4cbe23e9525/branding',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            logoUrl: brandLogoUrl,
            logoDarkUrl: brandLogoDarkUrl,
            faviconUrl: brandFaviconUrl,
            headerBannerUrl: brandHeaderBannerUrl,
            primaryColor: brandPrimaryColor,
            accentColor: brandAccentColor,
            customDomain: brandCustomDomain,
            subdomain: brandSubdomain,
            gallery: brandGallery,
          }),
        }
      );
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Failed to save branding:', err);
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleVerifyDomain = async () => {
    setIsVerifyingDomain(true);
    setDomainVerifyNotice(null);
    try {
      const res = await fetch(
        'http://localhost:4000/api/v1/organizations/55c3849e-0fa3-4b52-9c2d-b4cbe23e9525/verify-domain',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customDomain: brandCustomDomain }),
        }
      );
      const data = await res.json();
      if (data.verified) {
        setBrandSslStatus('active');
        setDomainVerifyNotice(`Success: ${data.message}`);
      } else {
        setDomainVerifyNotice(`Notice: ${data.message}`);
      }
    } catch (err) {
      console.error('Domain verification failed:', err);
      setDomainVerifyNotice('Domain verification failed. Ensure CNAME points to cname.omnistay.com');
    } finally {
      setIsVerifyingDomain(false);
    }
  };

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
            /* Payment Settings Panel (Chapter 18: Global Payment Gateway Orchestration) */
            <div className="bg-white rounded border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Global Payment Gateway Orchestration Catalog (Chapter 18)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure API keys, webhooks, currency routing, and split-settlement for all 36 global payment processors.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  36 Gateways Supported
                </span>
              </div>

              {/* 36 Gateways Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  // Global Tier 1
                  { name: 'Stripe Connect', region: 'Global', type: 'Credit Cards, Apple Pay, Google Pay', status: 'Enabled', currency: 'USD, EUR, GBP, AUD' },
                  { name: 'PayPal Commerce', region: 'Global', type: 'Express Checkout & Digital Wallet', status: 'Enabled', currency: 'USD, EUR, GBP, JPY' },
                  { name: 'Adyen Hospitality', region: 'Global', type: 'Omnichannel & Hotel Front-Desk POS', status: 'Enabled', currency: 'Multi-Currency 150+' },
                  { name: 'Worldpay / FIS', region: 'Global', type: 'Enterprise Merchant Acquiring', status: 'Standby', currency: 'USD, EUR, GBP' },
                  { name: 'Square Payments', region: 'Global', type: 'Terminal POS & In-Person Cards', status: 'Standby', currency: 'USD, CAD, GBP, AUD' },
                  { name: 'Authorize.Net', region: 'Global', type: 'SIM / DPM Card Payment Gateway', status: 'Standby', currency: 'USD, CAD, EUR' },
                  { name: '2Checkout / Verifone', region: 'Global', type: 'Global Merchant Processing', status: 'Standby', currency: 'Multi-Currency 100+' },

                  // Indian Subcontinent
                  { name: 'bKash Merchant', region: 'Bangladesh', type: 'Automated Tokenized Checkout & PIN', status: 'Enabled', currency: 'BDT' },
                  { name: 'Nagad Gateway', region: 'Bangladesh', type: 'Direct Merchant Settlement API', status: 'Enabled', currency: 'BDT' },
                  { name: 'SSLCommerz', region: 'Bangladesh', type: 'Multi-Bank Gateway Aggregator', status: 'Enabled', currency: 'BDT, USD' },
                  { name: 'AamarPay', region: 'Bangladesh', type: 'Credit Card & Mobile Financial Services', status: 'Standby', currency: 'BDT' },
                  { name: 'Razorpay PGW', region: 'India', type: 'UPI, Netbanking & RuPay Cards', status: 'Enabled', currency: 'INR, USD' },
                  { name: 'Paytm Payments Bank', region: 'India', type: 'UPI QR & Paytm Wallet', status: 'Standby', currency: 'INR' },
                  { name: 'CCAvenue', region: 'India', type: 'Multi-Currency Indian Netbanking', status: 'Standby', currency: 'INR, USD, AED' },

                  // Europe & UK
                  { name: 'Mollie Payments', region: 'Europe', type: 'iDEAL, Bancontact, Sofort & SEPA', status: 'Standby', currency: 'EUR, GBP' },
                  { name: 'Klarna BNPL', region: 'Europe/US', type: 'Buy Now Pay Later (Slice in 3/4)', status: 'Standby', currency: 'EUR, USD, GBP' },
                  { name: 'Afterpay / Clearpay', region: 'Europe/US', type: 'BNPL 4-Biweekly Installments', status: 'Standby', currency: 'USD, GBP, AUD' },
                  { name: 'Skrill Digital Wallet', region: 'Europe', type: 'Multi-Currency E-Wallet', status: 'Standby', currency: 'EUR, USD, GBP' },

                  // Southeast Asia
                  { name: 'Midtrans SNAP', region: 'Indonesia', type: 'GoPay, ShopeePay, Mandiri & QRIS', status: 'Standby', currency: 'IDR' },
                  { name: 'Xendit Gateway', region: 'SE Asia', type: 'OVO, DANA, Virtual Accounts & QRIS', status: 'Standby', currency: 'IDR, PHP' },
                  { name: 'PromptPay QR', region: 'Thailand', type: 'Bank of Thailand National QR Standard', status: 'Standby', currency: 'THB' },
                  { name: 'PayNow FAST', region: 'Singapore', type: 'SGQR Instant National Clearing', status: 'Standby', currency: 'SGD' },

                  // Africa
                  { name: 'Paystack Africa', region: 'Africa', type: 'Cards, Mobile Money & Bank Transfer', status: 'Standby', currency: 'NGN, GHS, ZAR, KES' },
                  { name: 'Flutterwave', region: 'Africa', type: 'Cross-Border African Settlement', status: 'Standby', currency: 'NGN, KES, ZAR, USD' },
                  { name: 'FawryPay', region: 'Egypt & MENA', type: 'Cash Ingestion Kiosks & Digital Wallet', status: 'Standby', currency: 'EGP' },

                  // Latin America
                  { name: 'MercadoPago', region: 'Latin America', type: 'PIX Instant, Boleto & Credit Cards', status: 'Standby', currency: 'BRL, ARS, MXN' },
                  { name: 'PagSeguro / PagBank', region: 'Brazil', type: 'PIX Direct QR & Credit Cards', status: 'Standby', currency: 'BRL' },

                  // Middle East / GCC
                  { name: 'HyperPay GCC', region: 'Saudi/GCC', type: 'Mada, Sadad & Apple Pay', status: 'Standby', currency: 'SAR, AED, KWD' },
                  { name: 'MyFatoorah', region: 'Kuwait/GCC', type: 'KNET Direct Debit & Credit Cards', status: 'Standby', currency: 'KWD, SAR, AED' },
                  { name: 'Tap Payments', region: 'GCC', type: 'Mada, KNET, Benefit & Cards', status: 'Standby', currency: 'KWD, SAR, BHD, AED' },
                  { name: 'Network International', region: 'UAE & MEA', type: 'N-Genius Enterprise PGW', status: 'Standby', currency: 'AED, USD, EUR' },

                  // Asia / China
                  { name: 'WeChat Pay', region: 'China / Global', type: 'WeChat Pay QR & Native In-App', status: 'Standby', currency: 'CNY, HKD, USD' },
                  { name: 'Alipay Global', region: 'China / Global', type: 'Ant Financial Cross-Border Barcode', status: 'Standby', currency: 'CNY, HKD, USD' },

                  // B2B & Web3 / Crypto
                  { name: 'Payoneer Checkout', region: 'Global B2B', type: 'Cross-Border Merchant Receiving', status: 'Standby', currency: 'USD, EUR, GBP' },
                  { name: 'CoinGate Crypto', region: 'Web3 / Crypto', type: 'Bitcoin, Ethereum, USDT Settlement', status: 'Standby', currency: 'BTC, ETH, USDT' },
                  { name: 'BitPay Commerce', region: 'Web3 / Crypto', type: 'Cryptocurrency POS Settlement', status: 'Standby', currency: 'BTC, BCH, USDC' },
                ].map((pgw) => (
                  <div
                    key={pgw.name}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2 hover:border-[#00a8ff] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{pgw.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          pgw.status === 'Enabled'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {pgw.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{pgw.type}</div>
                    <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{pgw.region}</span>
                      <span className="font-mono text-slate-600">{pgw.currency}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Split settlement credentials securely managed by OmniStay Vault (AES-256-GCM).
                </span>
                <button
                  onClick={handleSave}
                  className="h-9 px-6 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Gateway Settings</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'style' ? (
            /* Chapter 4.1.1.4: Brand Customization, White-Labeling & Multi-Tenant Domain */
            <div className="bg-white rounded border border-slate-200 p-6 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#00a8ff]" /> Brand Customization & White-Labeling (Chapter 4.1.1.4)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize high-resolution logos, dark/light emblem, favicon, header hero banner, photography gallery, and custom domain SSL.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/themes"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00a8ff] hover:bg-[#0097e6] text-white rounded text-xs font-bold shadow-xs transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Open Visual Customizer</span>
                  </Link>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Tenant White-Label Active
                  </span>
                </div>
              </div>

              {/* Callout to Visual Customizer */}
              <div className="bg-sky-50/80 border border-sky-200/80 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#00a8ff] text-white flex items-center justify-center shrink-0">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">
                      WordPress / Shopify-Style Visual Theme & Website Builder (Live WYSIWYG)
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Customize landing page hero banner, headings, search tabs, promotional cards, and live desktop/mobile preview.
                    </p>
                  </div>
                </div>
                <Link
                  href="/themes"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00a8ff] hover:bg-[#0097e6] text-white rounded text-xs font-semibold shadow-xs transition shrink-0"
                >
                  <span>Launch Visual Builder &rarr;</span>
                </Link>
              </div>

              <form onSubmit={handleSaveBranding} className="space-y-6">
                {/* Section 1: Logo & Emblems */}
                <div className="space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    1. Brand Identity & High-Resolution Emblems
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Light Mode Logo */}
                    <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Sun className="w-3.5 h-3.5 text-amber-500" /> Light Mode Logo
                        </span>
                        <span className="text-[10px] text-slate-400">SVG / PNG</span>
                      </div>
                      <div className="relative h-20 rounded bg-white border border-slate-200 flex items-center justify-center p-2">
                        {brandLogoUrl ? (
                          <img src={brandLogoUrl} alt="Light Mode Logo" className="max-h-16 max-w-full object-contain" />
                        ) : (
                          <span className="text-xs text-slate-400">No logo uploaded</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={brandLogoUrl}
                        onChange={(e) => setBrandLogoUrl(e.target.value)}
                        placeholder="Enter logo image URL..."
                        className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded"
                      />
                    </div>

                    {/* Dark Mode Logo */}
                    <div className="p-4 rounded-lg border border-slate-200 bg-slate-900 text-white space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Moon className="w-3.5 h-3.5 text-blue-400" /> Dark Mode Emblem
                        </span>
                        <span className="text-[10px] text-slate-400">Night Navbar</span>
                      </div>
                      <div className="relative h-20 rounded bg-slate-800 border border-slate-700 flex items-center justify-center p-2">
                        {brandLogoDarkUrl ? (
                          <img src={brandLogoDarkUrl} alt="Dark Mode Emblem" className="max-h-16 max-w-full object-contain" />
                        ) : (
                          <span className="text-xs text-slate-500">No dark logo uploaded</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={brandLogoDarkUrl}
                        onChange={(e) => setBrandLogoDarkUrl(e.target.value)}
                        placeholder="Enter dark logo URL..."
                        className="w-full h-8 px-2.5 text-xs bg-slate-800 border border-slate-700 rounded text-white"
                      />
                    </div>

                    {/* Favicon */}
                    <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-emerald-600" /> Browser Favicon
                        </span>
                        <span className="text-[10px] text-slate-400">32x32 .ico / png</span>
                      </div>
                      <div className="relative h-20 rounded bg-white border border-slate-200 flex items-center justify-center p-2">
                        {brandFaviconUrl ? (
                          <img src={brandFaviconUrl} alt="Favicon" className="w-8 h-8 object-contain" />
                        ) : (
                          <span className="text-xs text-slate-400">Default favicon</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={brandFaviconUrl}
                        onChange={(e) => setBrandFaviconUrl(e.target.value)}
                        placeholder="Enter favicon URL..."
                        className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Header Hero Banner & Color Palette */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    2. Header Hero Banner & Theme Colors
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Header Hero Banner Preview */}
                    <div className="md:col-span-8 space-y-2">
                      <label className="text-xs font-medium text-slate-700">Custom Header Banner (Hero Display)</label>
                      <div className="relative w-full h-36 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shadow-2xs">
                        <img
                          src={brandHeaderBannerUrl || '/images/hotel-banner.jpg'}
                          alt="Header Hero Banner"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                          <span className="text-white text-xs font-bold drop-shadow">
                            Live Header Banner Overlay Preview
                          </span>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={brandHeaderBannerUrl}
                        onChange={(e) => setBrandHeaderBannerUrl(e.target.value)}
                        placeholder="Enter header banner image URL..."
                        className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800"
                      />
                    </div>

                    {/* Color Palette */}
                    <div className="md:col-span-4 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Primary Brand Accent</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={brandPrimaryColor}
                            onChange={(e) => setBrandPrimaryColor(e.target.value)}
                            className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0"
                          />
                          <input
                            type="text"
                            value={brandPrimaryColor}
                            onChange={(e) => setBrandPrimaryColor(e.target.value)}
                            className="w-full h-8 px-2.5 font-mono text-xs bg-white border border-slate-200 rounded"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Secondary Highlight Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={brandAccentColor}
                            onChange={(e) => setBrandAccentColor(e.target.value)}
                            className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0"
                          />
                          <input
                            type="text"
                            value={brandAccentColor}
                            onChange={(e) => setBrandAccentColor(e.target.value)}
                            className="w-full h-8 px-2.5 font-mono text-xs bg-white border border-slate-200 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Photography Gallery Manager */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-blue-600" /> 3. Photography Gallery Management (Chapter 4.1.1.4)
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Curate property photography categorized by Exterior, Lobby, Suite, Pool, Restaurant, and Spa.
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {['all', 'Exterior', 'Lobby', 'Suite', 'Pool', 'Restaurant', 'Spa'].map((cat) => (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => setGalleryFilter(cat)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                            galleryFilter === cat ? 'bg-[#00a8ff] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gallery Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {brandGallery
                      .filter((item) => galleryFilter === 'all' || item.category === galleryFilter)
                      .map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="group relative rounded-lg border border-slate-200 overflow-hidden bg-slate-50 aspect-4/3 flex flex-col justify-between shadow-2xs hover:border-[#00a8ff] transition-colors"
                        >
                          <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between text-white">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#00a8ff] w-fit">
                              {item.category}
                            </span>
                            <div>
                              <span className="block text-[10px] font-semibold line-clamp-1">{item.title}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setBrandGallery((prev) => prev.filter((p) => p.id !== item.id))
                                }
                                className="text-[10px] text-rose-300 hover:text-rose-100 mt-1 cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* Add Photo Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const title = prompt('Photo Title (e.g. Sunset Ocean Cabana):');
                        if (!title) return;
                        const url = prompt('Photo URL (e.g. /images/gallery/cabana.jpg):', '/images/gallery/suite-1.jpg');
                        if (!url) return;
                        const category = prompt('Category (Exterior, Lobby, Suite, Pool, Restaurant, Spa):', 'Suite') || 'Suite';
                        setBrandGallery((prev) => [
                          ...prev,
                          { id: `gal-${Date.now()}`, title, url, category, width: 1920, height: 1080 },
                        ]);
                      }}
                      className="rounded-lg border-2 border-dashed border-slate-200 hover:border-[#00a8ff] aspect-4/3 flex flex-col items-center justify-center p-2 text-center text-slate-400 hover:text-[#00a8ff] bg-slate-50 hover:bg-blue-50/50 transition-colors cursor-pointer"
                    >
                      <Plus className="w-5 h-5 mb-1" />
                      <span className="text-[11px] font-bold">Add Photo</span>
                    </button>
                  </div>
                </div>

                {/* Section 4: Multi-Tenant Custom Domain & SSL Configuration */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" /> 4. Custom Domain & SSL Certificate Automation (Chapter 19)
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Subdomain */}
                    <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">Dedicated Tenant Subdomain</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={brandSubdomain}
                          onChange={(e) => setBrandSubdomain(e.target.value)}
                          className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded font-mono text-slate-800"
                        />
                        <span className="text-xs text-slate-500 font-mono">.omnistay.com</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Default isolated partition routing via PostgreSQL RLS tenant ID.
                      </p>
                    </div>

                    {/* Custom Domain & SSL Check */}
                    <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700">Custom FQDN Domain Mapping</label>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> {brandSslStatus === 'active' ? 'SSL Active (TLS 1.3)' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={brandCustomDomain}
                          onChange={(e) => setBrandCustomDomain(e.target.value)}
                          placeholder="e.g. bookings.grandresort.com"
                          className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded font-mono text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyDomain}
                          disabled={isVerifyingDomain}
                          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded shrink-0 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {isVerifyingDomain ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                          <span>Verify SSL</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Point your DNS CNAME record to <code className="text-slate-700 font-mono">cname.omnistay.com</code> for automatic SSL certificate issuance.
                      </p>
                    </div>
                  </div>

                  {domainVerifyNotice && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{domainVerifyNotice}</span>
                    </div>
                  )}
                </div>

                {/* Save Changes Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    White-label branding and custom domains are distributed to edge CDN nodes worldwide.
                  </span>
                  <button
                    type="submit"
                    disabled={isSavingBranding}
                    className="h-9 px-6 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    {isSavingBranding ? <BeatLoader color="currentColor" size={6} speedMultiplier={1.2} /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Brand Settings</span>
                  </button>
                </div>
              </form>
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
