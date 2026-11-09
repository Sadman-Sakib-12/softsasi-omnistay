'use client';
import { BeatLoader } from 'react-spinners';

import React, { useState } from 'react';
import {
  Building2,
  Check,
  ArrowRight,
  ShieldCheck,
  Globe,
  Plus,
  Loader2,
  Trash2,
  X,
  Search,
  ExternalLink,
  Palette,
  RefreshCw,
  Sun,
  Moon,
  Camera,
  Lock,
  Save,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsService, Organization } from '@/features/organizations/services/organizations.service';
import { useTenantStore } from '@/stores/tenant-store';
import { api } from '@/lib/api/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPublicWebUrl } from '@/config/site.config';
import { showConfirm, showAlert } from '@/lib/sweetalert';

export default function OrganizationsPage() {
  const queryClient = useQueryClient();
  const { currentTenantId, setTenantId } = useTenantStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formError, setFormError] = useState('');

  // Branding & Multi-Tenant Domain modal state (Chapter 4.1.1.4 & 19)
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);
  const [selectedOrgForBranding, setSelectedOrgForBranding] = useState<Organization | null>(null);
  const [bLogoUrl, setBLogoUrl] = useState('');
  const [bLogoDarkUrl, setBLogoDarkUrl] = useState('');
  const [bFaviconUrl, setBFaviconUrl] = useState('');
  const [bBannerUrl, setBBannerUrl] = useState('');
  const [bPrimaryColor, setBPrimaryColor] = useState('#00a8ff');
  const [bAccentColor, setBAccentColor] = useState('#0097e6');
  const [bCustomDomain, setBCustomDomain] = useState('');
  const [bSubdomain, setBSubdomain] = useState('');
  const [bSslStatus, setBSslStatus] = useState('active');
  const [bSslIssuer, setBSslIssuer] = useState("Cloudflare for SaaS / Let's Encrypt Authority X3");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  const { data: organizations = [], isLoading } = useQuery<Organization[]>({
    queryKey: ['organizationsList'],
    queryFn: () => organizationsService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (dto: { name: string; slug: string }) => organizationsService.create(dto),
    onSuccess: (newOrg) => {
      queryClient.invalidateQueries({ queryKey: ['organizationsList'] });
      setIsCreateOpen(false);
      setFormName('');
      setFormSlug('');
      setFormError('');
      if (newOrg?.id) {
        setTenantId(newOrg.id);
      }
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to create organization');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => organizationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationsList'] });
    },
  });

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!formSlug || formSlug === formName.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
      setFormSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim()) {
      setFormError('Organization name and slug are required');
      return;
    }
    setFormError('');
    await createMutation.mutateAsync({
      name: formName.trim(),
      slug: formSlug.trim().toLowerCase(),
    });
  };

  const handleOpenBranding = async (org: Organization) => {
    setSelectedOrgForBranding(org);
    setIsBrandingOpen(true);
    setVerifyNotice(null);
    setBSubdomain(org.subdomain || org.slug || '');
    setBCustomDomain(org.domain || '');

    try {
      const data = await api.get<any>(`/api/v1/organizations/${org.id}/branding`);
      if (data) {
        setBLogoUrl(data.logoUrl || '/images/omnistay-logo.png');
        setBLogoDarkUrl(data.logoDarkUrl || '/images/omnistay-logo-dark.png');
        setBFaviconUrl(data.faviconUrl || '/favicon.ico');
        setBBannerUrl(data.headerBannerUrl || '/images/hotel-banner.jpg');
        setBPrimaryColor(data.primaryColor || '#00a8ff');
        setBAccentColor(data.accentColor || '#0097e6');
        setBCustomDomain(data.customDomain || org.domain || '');
        setBSubdomain(data.subdomain || org.subdomain || org.slug || '');
        setBSslStatus(data.sslStatus || 'active');
        setBSslIssuer(data.sslIssuer || "Cloudflare for SaaS / Let's Encrypt Authority X3");
      }
    } catch (err) {
      console.error('Failed to load org branding:', err);
    }
  };

  const handleVerifyDomain = async () => {
    if (!selectedOrgForBranding) return;
    setIsVerifying(true);
    setVerifyNotice(null);

    try {
      const data = await api.post<{ verified: boolean; message?: string }>(
        `/api/v1/organizations/${selectedOrgForBranding.id}/verify-domain`,
        { customDomain: bCustomDomain }
      );
      if (data?.verified) {
        setBSslStatus('active');
        setVerifyNotice(`Validated: ${data.message || 'SSL Certificate active'}`);
        queryClient.invalidateQueries({ queryKey: ['organizationsList'] });
      } else {
        setVerifyNotice(`Notice: ${data?.message || 'Verification in progress'}`);
      }
    } catch (err) {
      console.error('Domain verification failed:', err);
      setVerifyNotice('Verification error: Ensure CNAME points to cname.omnistay.com');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgForBranding) return;
    setIsSavingBranding(true);

    try {
      await api.put(`/api/v1/organizations/${selectedOrgForBranding.id}/branding`, {
        logoUrl: bLogoUrl,
        logoDarkUrl: bLogoDarkUrl,
        faviconUrl: bFaviconUrl,
        headerBannerUrl: bBannerUrl,
        primaryColor: bPrimaryColor,
        accentColor: bAccentColor,
        customDomain: bCustomDomain,
        subdomain: bSubdomain,
      });

      queryClient.invalidateQueries({ queryKey: ['organizationsList'] });
      setIsBrandingOpen(false);
    } catch (err) {
      console.error('Failed to save branding:', err);
    } finally {
      setIsSavingBranding(false);
    }
  };

  const filteredOrgs = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.slug && o.slug.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.id && o.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" /> Multi-Tenant Organizations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Isolated tenant partitions retrieved directly from NestJS Organization API (`/api/v1/organizations`).
          </p>
        </div>
        <Button
          onClick={() => {
            setIsCreateOpen(true);
            setFormError('');
          }}
          variant="default"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1" /> New Organization
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Filter organizations by name, slug, or UUID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder-slate-400"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600 text-xs">
            Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Loading tenant partitions from database...
        </div>
      ) : filteredOrgs.length === 0 ? (
        <Card className="p-12 text-center bg-white border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">No organizations found</p>
          <p className="text-xs text-slate-500 mt-1">
            Click &quot;New Organization&quot; above to provision a new tenant instance.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrgs.map((tenant, idx) => {
            const isActive = tenant.id === currentTenantId;

            return (
              <Card
                key={tenant.id || tenant.slug || `tenant-card-${idx}`}
                className={`transition-all bg-white border ${
                  isActive
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <CardHeader className="flex flex-row items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <CardTitle className="text-base text-slate-900 flex items-center gap-2 font-bold">
                      {tenant.name}
                      {isActive && (
                        <Badge variant="success" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          Active Context
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono mt-1 text-slate-500">
                      UUID: {tenant.id}
                    </CardDescription>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <Building2 className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">Domain Mapping</span>
                      <p className="font-medium text-slate-800 mt-0.5">{tenant.domain || `${tenant.slug || 'tenant'}.omnistay.com`}</p>
                      <a
                        href={getPublicWebUrl('', tenant.slug)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#00a8ff] hover:underline inline-flex items-center gap-1 mt-0.5 font-mono"
                      >
                        {getPublicWebUrl('', tenant.slug).replace(/^https?:\/\//, '')} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">SaaS Tier</span>
                      <p className="font-medium text-blue-600 capitalize mt-0.5">{tenant.planId || 'Professional'}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> PostgreSQL RLS Partitioned
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenBranding(tenant)}
                        className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs cursor-pointer"
                        title="Configure Branding & Custom Domain"
                      >
                        <Palette className="w-3.5 h-3.5 mr-1 text-[#00a8ff]" /> Branding & SSL
                      </Button>
                      <Button
                        variant={isActive ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            sessionStorage.setItem('omnistay_tenant_switched', 'true');
                          }
                          setTenantId(tenant.id);
                        }}
                        className={isActive ? 'border-slate-300 text-slate-700 cursor-pointer' : 'bg-blue-600 hover:bg-blue-700 text-white text-xs cursor-pointer'}
                      >
                        {isActive ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Active Context
                          </>
                        ) : (
                          <>
                            Switch Context <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          const confirmed = await showConfirm({
                            title: 'Delete Organization?',
                            text: `Are you sure you want to delete organization "${tenant.name}"? This will soft-delete the tenant partition.`,
                            confirmButtonText: 'Yes, Delete',
                            icon: 'warning',
                          });
                          if (confirmed) {
                            try {
                              await deleteMutation.mutateAsync(tenant.id);
                              showAlert({
                                title: 'Deleted!',
                                text: `Organization "${tenant.name}" has been removed.`,
                                icon: 'success',
                              });
                            } catch (err: any) {
                              showAlert({
                                title: 'Error',
                                text: err?.message || 'Failed to delete organization',
                                icon: 'error',
                              });
                            }
                          }
                        }}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 h-8 px-2 cursor-pointer"
                        title="Delete organization"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Organization Modal Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Provision New Organization</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Organization / Hotel Chain Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grand Horizon Hospitality Group"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tenant Slug (Subdomain) *</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    pattern="^[a-z0-9-]+$"
                    placeholder="grand-horizon"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-l text-xs font-mono focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  <span className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-300 text-slate-500 text-xs font-mono rounded-r">
                    .omnistay.com
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">Only lowercase alphanumeric characters and hyphens allowed.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">Auto-Provisioned Services:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                  <li>Isolated PostgreSQL Tenant Workspace</li>
                  <li>Company Owner/GM Administrative Role</li>
                  <li>SaaS Professional Cloud Cluster</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Provisioning...
                    </>
                  ) : (
                    'Create Organization'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branding & SSL Domain Modal Dialog (Chapter 4.1.1.4 & Chapter 19) */}
      {isBrandingOpen && selectedOrgForBranding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#00a8ff]" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    White-Label Branding & Domain Management (Chapters 4.1.1.4 & 19)
                  </h3>
                  <p className="text-[11px] text-slate-500">Tenant: {selectedOrgForBranding.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsBrandingOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBranding} className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              {/* Domain & Subdomain Section */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-600" /> Multi-Tenant Domain Routing & SSL
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> {bSslStatus === 'active' ? 'SSL Active (TLS 1.3)' : 'Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Dedicated Subdomain</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={bSubdomain}
                        onChange={(e) => setBSubdomain(e.target.value)}
                        className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded font-mono text-slate-800"
                      />
                      <span className="ml-1 text-[11px] text-slate-400 font-mono">.omnistay.com</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Custom FQDN Domain</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={bCustomDomain}
                        onChange={(e) => setBCustomDomain(e.target.value)}
                        placeholder="e.g. bookings.resort.com"
                        className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded font-mono text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyDomain}
                        disabled={isVerifying}
                        className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isVerifying ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        <span>Verify</span>
                      </button>
                    </div>
                  </div>
                </div>

                {verifyNotice && (
                  <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{verifyNotice}</span>
                  </div>
                )}
              </div>

              {/* Logos & Emblems */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded border border-slate-200 space-y-2">
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> Light Mode Logo URL
                  </span>
                  <input
                    type="text"
                    value={bLogoUrl}
                    onChange={(e) => setBLogoUrl(e.target.value)}
                    placeholder="/images/logo.png"
                    className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded"
                  />
                  {bLogoUrl && (
                    <div className="h-10 bg-slate-50 border border-slate-100 rounded flex items-center justify-center p-1">
                      <img src={bLogoUrl} alt="Logo" className="max-h-8 max-w-full object-contain" />
                    </div>
                  )}
                </div>

                <div className="p-3 rounded border border-slate-200 bg-slate-900 text-white space-y-2">
                  <span className="font-semibold text-white flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-blue-400" /> Dark Mode Emblem URL
                  </span>
                  <input
                    type="text"
                    value={bLogoDarkUrl}
                    onChange={(e) => setBLogoDarkUrl(e.target.value)}
                    placeholder="/images/logo-dark.png"
                    className="w-full h-8 px-2.5 bg-slate-800 border border-slate-700 rounded text-white"
                  />
                  {bLogoDarkUrl && (
                    <div className="h-10 bg-slate-800 border border-slate-700 rounded flex items-center justify-center p-1">
                      <img src={bLogoDarkUrl} alt="Dark Logo" className="max-h-8 max-w-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              {/* Favicon & Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Favicon URL</label>
                  <input
                    type="text"
                    value={bFaviconUrl}
                    onChange={(e) => setBFaviconUrl(e.target.value)}
                    placeholder="/favicon.ico"
                    className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Header Banner URL</label>
                  <input
                    type="text"
                    value={bBannerUrl}
                    onChange={(e) => setBBannerUrl(e.target.value)}
                    placeholder="/images/banner.jpg"
                    className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded"
                  />
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Primary Brand Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bPrimaryColor}
                      onChange={(e) => setBPrimaryColor(e.target.value)}
                      className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={bPrimaryColor}
                      onChange={(e) => setBPrimaryColor(e.target.value)}
                      className="w-full h-7 px-2 font-mono text-xs bg-white border border-slate-200 rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Secondary Brand Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bAccentColor}
                      onChange={(e) => setBAccentColor(e.target.value)}
                      className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={bAccentColor}
                      onChange={(e) => setBAccentColor(e.target.value)}
                      className="w-full h-7 px-2 font-mono text-xs bg-white border border-slate-200 rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBrandingOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingBranding}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  {isSavingBranding ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                  Save White-Labeling
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
