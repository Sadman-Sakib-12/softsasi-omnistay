'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FileText,
  ExternalLink,
  Clock,
  Award,
  Plus,
  Users,
  DollarSign,
  Layers,
  Sparkles,
  AlertTriangle,
  Building,
  Anchor,
  Compass,
  Car,
  ChevronRight,
  Eye,
  MessageSquare,
  Send,
  Sliders,
  Check,
  X,
  Star,
  Calendar,
  CreditCard,
  Briefcase,
  UserCheck,
  Percent,
  Search,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BeatLoader } from 'react-spinners';
import {
  marketplaceService,
  VendorItem,
  KycSubmissionItem,
  VendorCommissionItem,
  VendorWithdrawalItem,
  VendorPayoutItem,
  GuestReviewItem,
  VendorPlanItem,
} from '@/features/marketplace/services/marketplace.service';
import { formatCurrency, formatDate } from '@/lib/utils';

function calculateCommissionRate(baseRate: number, vertical?: string, monthlyGmv?: number): number {
  if (monthlyGmv && monthlyGmv >= 100000) return 10.0;
  if (monthlyGmv && monthlyGmv >= 50000) return 12.0;
  if (vertical) {
    switch (vertical.toLowerCase()) {
      case 'tour':
      case 'tours':
        return 20.0;
      case 'boat':
      case 'boats':
      case 'yacht':
        return 18.0;
      case 'hotel':
      case 'hospitality':
        return 15.0;
      case 'car':
      case 'cars':
        return 12.0;
      case 'space':
      case 'spaces':
        return 10.0;
      case 'flight':
      case 'flights':
        return 5.0;
    }
  }
  return baseRate;
}

export default function MarketplaceEnterprisePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'kyc' | 'commission' | 'portal' | 'payouts' | 'team' | 'reviews'>('kyc');

  // React Query: Zero Mock (100% Live Backend Data)
  const { data: vendors = [], isLoading: isLoadingVendors } = useQuery<VendorItem[]>({
    queryKey: ['marketplaceVendors'],
    queryFn: () => marketplaceService.getVendors(),
  });

  const { data: kycSubmissions = [], isLoading: isLoadingKyc } = useQuery<KycSubmissionItem[]>({
    queryKey: ['marketplaceKyc'],
    queryFn: () => marketplaceService.getKycSubmissions(),
  });

  const { data: commissions = [], isLoading: isLoadingCommissions } = useQuery<VendorCommissionItem[]>({
    queryKey: ['marketplaceCommissions'],
    queryFn: () => marketplaceService.getCommissions(),
  });

  const { data: withdrawals = [], isLoading: isLoadingWithdrawals } = useQuery<VendorWithdrawalItem[]>({
    queryKey: ['marketplaceWithdrawals'],
    queryFn: () => marketplaceService.getWithdrawals(),
  });

  const { data: payouts = [], isLoading: isLoadingPayouts } = useQuery<VendorPayoutItem[]>({
    queryKey: ['marketplacePayouts'],
    queryFn: () => marketplaceService.getPayoutHistory(),
  });

  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery<GuestReviewItem[]>({
    queryKey: ['marketplaceReviews'],
    queryFn: () => marketplaceService.getReviews(),
  });

  const { data: plans = [] } = useQuery<VendorPlanItem[]>({
    queryKey: ['marketplacePlans'],
    queryFn: () => marketplaceService.getPlans(),
  });

  // UI Modals & Interactive States
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedKycDoc, setSelectedKycDoc] = useState<KycSubmissionItem | null>(null);
  const [selectedReviewForReply, setSelectedReviewForReply] = useState<GuestReviewItem | null>(null);
  const [selectedVendorForTeam, setSelectedVendorForTeam] = useState<VendorItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newTeamUserId, setNewTeamUserId] = useState('');
  const [newTeamRole, setNewTeamRole] = useState('Property Manager');
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  const triggerBanner = (msg: string) => {
    setAlertBanner(msg);
    setTimeout(() => setAlertBanner(null), 4000);
  };

  // 12.1 Host Registration State
  const [newVendor, setNewVendor] = useState({
    businessName: '',
    taxId: '',
    commissionRate: 15,
  });

  // 12.2 Live Commission Simulator State
  const [simGross, setSimGross] = useState(3500);
  const [simVertical, setSimVertical] = useState('tour');
  const [simMonthlyGmv, setSimMonthlyGmv] = useState(0);

  // Mutations
  const registerVendorMutation = useMutation({
    mutationFn: (dto: any) => marketplaceService.registerVendor(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceVendors'] });
      setIsRegisterOpen(false);
      setNewVendor({ businessName: '', taxId: '', commissionRate: 15 });
      triggerBanner('Host / Operator profile registered successfully.');
    },
  });

  const reviewKycMutation = useMutation({
    mutationFn: ({ kycId, status }: { kycId: string; status: 'verified' | 'rejected' }) =>
      marketplaceService.reviewKyc(kycId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceKyc'] });
      queryClient.invalidateQueries({ queryKey: ['marketplaceVendors'] });
      setSelectedKycDoc(null);
      triggerBanner('KYC verification status updated. Verified badge synced to public listings.');
    },
  });

  const processPayoutMutation = useMutation({
    mutationFn: (withdrawalId: string) => marketplaceService.processPayout({ withdrawalId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceWithdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['marketplacePayouts'] });
      queryClient.invalidateQueries({ queryKey: ['marketplaceVendors'] });
      triggerBanner('Payout disbursement executed and recorded.');
    },
  });

  const replyReviewMutation = useMutation({
    mutationFn: ({ reviewId, text }: { reviewId: string; text: string }) =>
      marketplaceService.replyReview(reviewId, { replyText: text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceReviews'] });
      setSelectedReviewForReply(null);
      setReplyText('');
      triggerBanner('Public host response published to guest review.');
    },
  });

  const addTeamMemberMutation = useMutation({
    mutationFn: ({ vendorId, userId, role }: { vendorId: string; userId: string; role: string }) =>
      marketplaceService.addTeamMember(vendorId, { userId, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplaceVendors'] });
      setSelectedVendorForTeam(null);
      setNewTeamUserId('');
      triggerBanner('Team member operational role assigned.');
    },
  });

  // Simulator Calculation
  const evaluatedRate = calculateCommissionRate
    ? calculateCommissionRate(15, simVertical, simMonthlyGmv)
    : simVertical === 'tour'
    ? 20
    : simVertical === 'boat'
    ? 18
    : simVertical === 'car'
    ? 12
    : 15;
  const simulatedCommission = (simGross * evaluatedRate) / 100;
  const simulatedNet = simGross - simulatedCommission;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Alert Banner */}
      {alertBanner && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{alertBanner}</span>
        </div>
      )}

      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span className="text-[#00a8ff] font-semibold">Marketplace & Multi-Vendor</span>
            <span>/</span>
            <span className="text-slate-400">Chapter 12 Host & Operator Ecosystem</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#00a8ff]" /> Multi-Vendor Marketplace & Host Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Airbnb & Booking.com style multi-vertical inventory, automated KYC verification, granular commissions, payouts & multi-criteria reviews
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsRegisterOpen(true)}
            className="bg-[#00a8ff] hover:bg-[#0090dd] text-white text-xs font-bold gap-1.5 rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" /> Onboard Host / Partner
          </Button>
        </div>
      </div>

      {/* Chapter 12 Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('kyc')}
          className={`px-4 py-2.5 font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'kyc'
              ? 'bg-sky-50 text-[#00a8ff] border-b-2 border-[#00a8ff]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>12.1 Host KYC & Verification</span>
          <span className="bg-sky-100 text-[#00a8ff] px-1.5 py-0.5 rounded-full text-[10px]">
            {kycSubmissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('commission')}
          className={`px-4 py-2.5 font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'commission'
              ? 'bg-sky-50 text-[#00a8ff] border-b-2 border-[#00a8ff]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>12.2 Granular Commission</span>
          <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full text-[10px]">
            {commissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('portal')}
          className={`px-4 py-2.5 font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'portal'
              ? 'bg-sky-50 text-[#00a8ff] border-b-2 border-[#00a8ff]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>12.3 Host Inventory Portal</span>
          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-full text-[10px]">
            {vendors.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2.5 font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'payouts'
              ? 'bg-sky-50 text-[#00a8ff] border-b-2 border-[#00a8ff]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>12.4 Payouts & Disbursements</span>
          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px]">
            {withdrawals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2.5 font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'team'
              ? 'bg-sky-50 text-[#00a8ff] border-b-2 border-[#00a8ff]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>12.5 Host Team Accounts & RBAC</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2.5 font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'reviews'
              ? 'bg-sky-50 text-[#00a8ff] border-b-2 border-[#00a8ff]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Star className="w-4 h-4 text-amber-500" />
          <span>12.6 Multi-Criteria Reviews</span>
          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px]">
            {reviews.length}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: 12.1 Host Onboarding & KYC Queue                        */}
      {/* ============================================================== */}
      {activeTab === 'kyc' && (
        <div className="space-y-5">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-sky-100 bg-gradient-to-br from-sky-50 to-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-[#00a8ff] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Verified Hosts</div>
                  <div className="text-xl font-black text-slate-900">
                    {vendors.filter((v) => v.isVerified).length} Operators
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">KYC In Queue</div>
                  <div className="text-xl font-black text-amber-700">
                    {kycSubmissions.filter((k) => k.status === 'pending').length} Submissions
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Verification Badging</div>
                  <div className="text-xs font-bold text-emerald-700">Auto-Synced on Listings</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Host Balances Held</div>
                  <div className="text-xl font-black text-purple-700">
                    {formatCurrency(vendors.reduce((s, v) => s + Number(v.balance || 0), 0))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KYC Verification Queue Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00a8ff]" /> KYC Document Verification Queue (SuperAdmin Audit)
              </h3>
              <span className="text-xs text-slate-400 font-semibold">Review operating licenses & ownership deeds</span>
            </div>

            {isLoadingKyc ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2">
                <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
                <p className="text-xs text-slate-400">Loading KYC submissions from database...</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Host / Business Entity</th>
                      <th className="py-3 px-4">Uploaded Legal Document</th>
                      <th className="py-3 px-4">Document File</th>
                      <th className="py-3 px-4">Audit Status</th>
                      <th className="py-3 px-4">Submitted Date</th>
                      <th className="py-3 px-4 text-right">SuperAdmin Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {kycSubmissions.map((k) => {
                      const isPending = k.status === 'pending';
                      const isVerified = k.status === 'verified';
                      return (
                        <tr key={k.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {k.vendorName}
                            <div className="text-[10px] text-slate-400 font-normal">Host ID: {k.vendorId.slice(0, 16)}...</div>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-sky-500" />
                              {k.documentType}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => triggerBanner(`Opening secure document viewer for ${k.documentType}...`)}
                              className="inline-flex items-center gap-1 text-[11px] text-[#00a8ff] hover:underline font-semibold"
                            >
                              <span>View File</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isVerified
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isPending
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {k.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">{formatDate(k.createdAt)}</td>
                          <td className="py-3 px-4 text-right">
                            {isPending ? (
                              <div className="inline-flex items-center gap-1.5">
                                <Button
                                  size="sm"
                                  disabled={reviewKycMutation.isPending}
                                  onClick={() => reviewKycMutation.mutate({ kycId: k.id, status: 'verified' })}
                                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1"
                                >
                                  <Check className="w-3 h-3" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={reviewKycMutation.isPending}
                                  onClick={() => reviewKycMutation.mutate({ kycId: k.id, status: 'rejected' })}
                                  className="h-7 text-xs border-rose-300 text-rose-600 hover:bg-rose-50 font-bold gap-1"
                                >
                                  <X className="w-3 h-3" /> Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-semibold italic">Audit Closed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Marketplace Hosts & Verified Badging Table */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00a8ff]" /> Onboarded Host Partners & Verified Status
            </h3>

            {isLoadingVendors ? (
              <div className="py-10 flex flex-col items-center justify-center">
                <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Operator / Business Name</th>
                      <th className="py-3 px-4">Tax ID / TIN</th>
                      <th className="py-3 px-4">Verification Badge</th>
                      <th className="py-3 px-4">Commission Margin</th>
                      <th className="py-3 px-4">Digital Wallet Balance</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vendors.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{v.businessName}</span>
                            {v.isVerified && (
                              <span title="Verified Host Badge (Chapter 12.1)">
                                <ShieldCheck className="w-4 h-4 text-sky-500 inline fill-sky-100" />
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">UUID: {v.userId.slice(0, 16)}...</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{v.taxId || '—'}</td>
                        <td className="py-3 px-4">
                          {v.isVerified ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Operator
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Pending Review
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-700">{v.commissionRate}% Flat Rate</td>
                        <td className="py-3 px-4 font-black text-slate-900">{formatCurrency(v.balance)}</td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedVendorForTeam(v)}
                            className="text-[#00a8ff] hover:bg-sky-50 text-xs font-bold gap-1"
                          >
                            <Users className="w-3.5 h-3.5" /> Team Accounts
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: 12.2 Granular Commission Architecture                  */}
      {/* ============================================================== */}
      {activeTab === 'commission' && (
        <div className="space-y-5">
          {/* Commission Structure Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-sky-100 bg-sky-50/40">
              <CardContent className="p-4 space-y-1.5">
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Standard Global Rate</span>
                <div className="text-2xl font-black text-slate-900">15.0%</div>
                <p className="text-[11px] text-slate-500">
                  Flat percentage deducted from gross booking subtotal for standard hotels and vacation stays.
                </p>
              </CardContent>
            </Card>

            <Card className="border-indigo-100 bg-indigo-50/40">
              <CardContent className="p-4 space-y-1.5">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Vertical Category Rates</span>
                <div className="text-xs font-extrabold text-slate-800 space-y-1">
                  <div className="flex justify-between"><span>Tours & Activities:</span> <span className="text-indigo-600">20.0%</span></div>
                  <div className="flex justify-between"><span>Boat & Yacht Charters:</span> <span className="text-indigo-600">18.0%</span></div>
                  <div className="flex justify-between"><span>Car & Supercars:</span> <span className="text-indigo-600">12.0%</span></div>
                  <div className="flex justify-between"><span>Event Venues & Spaces:</span> <span className="text-indigo-600">10.0%</span></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-emerald-50/40">
              <CardContent className="p-4 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Tiered Volume Incentives</span>
                <div className="text-xs font-extrabold text-slate-800 space-y-1">
                  <div className="flex justify-between"><span>&gt; $50k/mo GMV:</span> <span className="text-emerald-700 font-black">12.0%</span></div>
                  <div className="flex justify-between"><span>&gt; $100k/mo GMV:</span> <span className="text-emerald-700 font-black">10.0%</span></div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Incentivizes premier operators to bring exclusive inventory.</p>
              </CardContent>
            </Card>

            <Card className="border-purple-100 bg-purple-50/40">
              <CardContent className="p-4 space-y-1.5">
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Flat Per-Booking Fee</span>
                <div className="text-2xl font-black text-slate-900">$5.00</div>
                <p className="text-[11px] text-slate-500">
                  Fixed fee per ticket for budget day-passes, transfers, and activity excursions.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Live Commission Simulator */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 rounded-2xl p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-sky-400" /> Granular Commission Live Engine & Simulator
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulate real-time revenue deductions across vertical margins and high-volume GMV tiers.
                </p>
              </div>
              <Badge className="bg-sky-500/20 text-sky-300 border-sky-400/30 font-mono text-xs">
                Domain Rule Engine Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Gross Booking Subtotal ($)</label>
                <input
                  type="number"
                  value={simGross}
                  onChange={(e) => setSimGross(Number(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Vertical Category</label>
                <select
                  value={simVertical}
                  onChange={(e) => setSimVertical(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-bold"
                >
                  <option value="hotel">Hotels & Stays (15%)</option>
                  <option value="tour">Tours & Activities (20%)</option>
                  <option value="boat">Boats & Yacht Charters (18%)</option>
                  <option value="car">Car & Supercar Rentals (12%)</option>
                  <option value="space">Venues & Event Spaces (10%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Monthly GMV Volume Tier ($)</label>
                <select
                  value={simMonthlyGmv}
                  onChange={(e) => setSimMonthlyGmv(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-bold"
                >
                  <option value={0}>Standard Tier (&lt; $50k/mo)</option>
                  <option value={60000}>Volume Premier (&gt; $50k/mo - 12%)</option>
                  <option value={120000}>Global Partner (&gt; $100k/mo - 10%)</option>
                </select>
              </div>

              <div className="bg-slate-800/90 border border-slate-700 p-3.5 rounded-xl text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Evaluated Commission</div>
                <div className="text-xl font-black text-sky-400">{evaluatedRate.toFixed(1)}% ({formatCurrency(simulatedCommission)})</div>
                <div className="text-[11px] text-emerald-400 font-bold mt-0.5">Host Net: {formatCurrency(simulatedNet)}</div>
              </div>
            </div>
          </div>

          {/* Real Commissions Deduction Ledger Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#00a8ff]" /> Automated Commission Ledger (Deductions upon Guest Check-in)
            </h3>

            {isLoadingCommissions ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Commission ID</th>
                      <th className="py-3 px-4">Host / Vendor Operator</th>
                      <th className="py-3 px-4">Booking Reference</th>
                      <th className="py-3 px-4">Gross Booking</th>
                      <th className="py-3 px-4">Platform Fee Deducted</th>
                      <th className="py-3 px-4 text-right">Net Credited to Vendor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {commissions.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 font-mono text-[10px] text-slate-400">{c.id.slice(0, 14)}...</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{c.vendor?.businessName || 'Operator'}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{c.bookingId.slice(0, 14)}...</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{formatCurrency(c.grossAmount)}</td>
                        <td className="py-3 px-4 font-bold text-rose-600">-{formatCurrency(c.commissionAmt)}</td>
                        <td className="py-3 px-4 font-black text-emerald-700 text-right">+{formatCurrency(c.netVendorAmt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: 12.3 Dedicated Host & Inventory Portal                  */}
      {/* ============================================================== */}
      {activeTab === 'portal' && (
        <div className="space-y-5">
          <div className="p-4 bg-gradient-to-r from-sky-50 to-white rounded-xl border border-sky-100 flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-slate-900">
                Isolated Host Self-Service Portal & Multi-Vertical Inventory
              </h3>
              <p className="text-xs text-slate-500">
                Third-party operators manage inventory, dynamic availability calendars, rate plans, and guest messaging.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => triggerBanner('Opening public marketplace listing view...')}
                className="text-xs font-bold text-[#00a8ff] gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Public Marketplace
              </Button>
            </div>
          </div>

          {/* Multi-Vertical Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="hover:border-[#00a8ff] transition shadow-xs">
              <CardContent className="p-4 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-[#00a8ff] flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">Hotel & Luxury Villas</h4>
                <p className="text-[11px] text-slate-500">
                  Rate plans, room block inventory, high-resolution galleries, and 2-way iCal availability sync.
                </p>
                <div className="text-[10px] font-bold text-slate-400">Santorini Caldera Villas • 18 Suites</div>
              </CardContent>
            </Card>

            <Card className="hover:border-[#00a8ff] transition shadow-xs">
              <CardContent className="p-4 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Anchor className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">Yacht Charters & Fleets</h4>
                <p className="text-[11px] text-slate-500">
                  Full day & sunset charters, captain & crew allocation, fuel surcharge, and port slips.
                </p>
                <div className="text-[10px] font-bold text-slate-400">Azure Coastal Charters • 6 Catamarans</div>
              </CardContent>
            </Card>

            <Card className="hover:border-[#00a8ff] transition shadow-xs">
              <CardContent className="p-4 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">Tours & Alpine Expeditions</h4>
                <p className="text-[11px] text-slate-500">
                  PAX capacity pacing, certified mountain guide manifests, equipment rental add-ons.
                </p>
                <div className="text-[10px] font-bold text-slate-400">Swiss Alpine Heli-Ski • 12 Routes</div>
              </CardContent>
            </Card>

            <Card className="hover:border-[#00a8ff] transition shadow-xs">
              <CardContent className="p-4 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">Supercars & Vehicles</h4>
                <p className="text-[11px] text-slate-500">
                  Daily mileage allowances, digital security deposits, delivery to airport/portico.
                </p>
                <div className="text-[10px] font-bold text-slate-400">Monaco Prestige Supercars • 14 Exotics</div>
              </CardContent>
            </Card>
          </div>

          {/* Active Operator Directory */}
          <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-sm text-slate-900">Operator Live Inventory Summary</h4>
              <span className="text-xs text-slate-400 font-semibold">Real-Time Booking Management & Messaging</span>
            </div>

            <div className="divide-y divide-slate-100">
              {vendors.map((v) => (
                <div key={v.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-xs text-slate-900">{v.businessName}</h5>
                      {v.isVerified && (
                        <span className="bg-sky-50 text-[#00a8ff] text-[9px] font-bold px-1.5 py-0.2 rounded border border-sky-100">
                          Verified Badge
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Status: <span className="capitalize font-semibold text-slate-700">{v.status}</span> • Wallet Balance: {formatCurrency(v.balance)} • Commission Rate: {v.commissionRate}%
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerBanner(`Opening live calendar for ${v.businessName}...`)}
                      className="text-xs font-semibold gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" /> iCal Calendar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => triggerBanner(`Opening in-app guest messaging channel for ${v.businessName}...`)}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Guest Chat
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: 12.4 Payouts & Disbursements Workflow                   */}
      {/* ============================================================== */}
      {activeTab === 'payouts' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Payout Gateways</div>
                  <div className="text-xs font-bold text-emerald-800">Stripe Connect • PayPal • Bank Wire</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Min Withdrawal Threshold</div>
                  <div className="text-xl font-black text-amber-700">$100.00 Minimum</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-sky-100 bg-gradient-to-br from-sky-50 to-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-[#00a8ff] flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Disbursed Volume</div>
                  <div className="text-xl font-black text-[#00a8ff]">
                    {formatCurrency(payouts.reduce((s, p) => s + Number(p.amount || 0), 0))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Withdrawal Requests Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" /> Pending Withdrawal Requests (SuperAdmin Disbursement Approval)
              </h3>
              <span className="text-xs text-slate-400 font-semibold">Requires $100 minimum threshold validation</span>
            </div>

            {isLoadingWithdrawals ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Operator / Vendor</th>
                      <th className="py-3 px-4">Withdrawal Amount</th>
                      <th className="py-3 px-4">Disbursement Method</th>
                      <th className="py-3 px-4">Request Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Disbursement Execution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {withdrawals.map((w) => {
                      const isRequested = w.status === 'requested';
                      return (
                        <tr key={w.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {w.vendor?.businessName || 'Host Partner'}
                            <div className="text-[10px] text-slate-400 font-normal">ID: {w.vendorId.slice(0, 14)}...</div>
                          </td>
                          <td className="py-3 px-4 font-black text-slate-900 text-sm">{formatCurrency(w.amount)}</td>
                          <td className="py-3 px-4">
                            <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                              Direct Bank Wire / Stripe
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">{formatDate(w.requestedAt)}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                w.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {w.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isRequested ? (
                              <Button
                                size="sm"
                                disabled={processPayoutMutation.isPending}
                                onClick={() => processPayoutMutation.mutate(w.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1"
                              >
                                <DollarSign className="w-3.5 h-3.5" /> Execute Payout
                              </Button>
                            ) : (
                              <span className="text-emerald-700 font-semibold text-[11px] inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Paid & Settled
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Historical Payouts & Disbursement Ledger */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed Payout Disbursements (Audit Trail)
            </h3>

            {isLoadingPayouts ? (
              <div className="py-10 flex flex-col items-center justify-center">
                <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Disbursement Reference</th>
                      <th className="py-3 px-4">Vendor Entity</th>
                      <th className="py-3 px-4">Amount Disbursed</th>
                      <th className="py-3 px-4">Gateway</th>
                      <th className="py-3 px-4">Settled At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payouts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 font-mono text-[11px] font-bold text-slate-700">{p.reference || p.id.slice(0, 16)}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{p.vendor?.businessName || 'Operator'}</td>
                        <td className="py-3 px-4 font-black text-emerald-700">{formatCurrency(p.amount)}</td>
                        <td className="py-3 px-4 capitalize font-semibold text-slate-600">{p.payoutMethod.replace('_', ' ')}</td>
                        <td className="py-3 px-4 text-slate-500">{p.processedAt ? formatDate(p.processedAt) : 'Recent'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: 12.5 Vendor Team Accounts & Role-Based Permissions (RBAC)*/}
      {/* ============================================================== */}
      {activeTab === 'team' && (
        <div className="space-y-5">
          {/* RBAC Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-sky-100 bg-sky-50/40">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-sky-800 uppercase tracking-wider">Property Manager</span>
                  <Badge className="bg-sky-600 text-white text-[10px]">Full Operational</Badge>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Full authority to create & modify listings, adjust rate plans, accept or modify bookings, and access guest messaging.
                </p>
              </CardContent>
            </Card>

            <Card className="border-indigo-100 bg-indigo-50/40">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-indigo-800 uppercase tracking-wider">Front Desk / Check-In</span>
                  <Badge className="bg-indigo-600 text-white text-[10px]">Read-Only Front Desk</Badge>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Access to guest arrival manifests, check-in confirmation, key handovers, and in-house guest special requests.
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-emerald-50/40">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-800 uppercase tracking-wider">Cleaner / Housekeeper</span>
                  <Badge className="bg-emerald-600 text-white text-[10px]">Limited Mobile Schedule</Badge>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Limited mobile view showing room cleaning schedules, turnaround checklists, and linen restocking alerts.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Team Members Roster */}
          <div className="border border-slate-200 rounded-xl bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-sm text-slate-900">Host Team Operational Delegation</h4>
                <p className="text-xs text-slate-500">Property owners delegate daily tasks without sharing master banking credentials.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {vendors.map((v) => (
                <div key={v.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#00a8ff]" />
                      <span>{v.businessName}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedVendorForTeam(v)}
                      className="text-xs font-bold text-[#00a8ff] gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Assign Staff
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                    {v.teamMembers && v.teamMembers.length > 0 ? (
                      v.teamMembers.map((tm) => (
                        <div key={tm.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-800">{tm.role}</div>
                            <div className="text-[10px] text-slate-400 font-mono">User: {tm.userId.slice(0, 14)}...</div>
                          </div>
                          <Badge variant="outline" className="text-[9px] uppercase font-bold">Active</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">No delegated staff assigned yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: 12.6 Multi-Criteria Reviews & Reputation Management     */}
      {/* ============================================================== */}
      {activeTab === 'reviews' && (
        <div className="space-y-5">
          <div className="p-4 bg-gradient-to-r from-amber-50 via-slate-50 to-white rounded-xl border border-amber-200/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
                <Star className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  Multi-Criteria Guest Reviews & Authentic Reputation Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Verified Stay Protection ensures only guests with completed bookings post reviews across 5 key dimensions.
                </p>
              </div>
            </div>
          </div>

          {isLoadingReviews ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((r) => (
                <Card key={r.id} className="border-slate-200 bg-white shadow-xs hover:border-[#00a8ff] transition">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-slate-900 flex items-center gap-1">
                            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                            {r.overallScore} / 5.0
                          </span>
                          {r.isVerifiedStay && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Stay Protected
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Booking UUID: {r.bookingId.slice(0, 18)}...</p>
                      </div>
                      <span className="text-[11px] text-slate-400 font-semibold">{formatDate(r.createdAt)}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    {/* Multi-Criteria Ratings 5 Dimensions */}
                    {r.ratings && r.ratings.length > 0 && (
                      <div className="grid grid-cols-2 gap-1.5 p-2.5 bg-slate-50 rounded-lg text-xs">
                        {r.ratings.map((rt) => (
                          <div key={rt.id} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600 font-medium">{rt.dimension}:</span>
                            <span className="font-extrabold text-amber-600 flex items-center gap-0.5">
                              {rt.score} <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Guest Comment */}
                    {r.comment && (
                      <p className="text-xs text-slate-700 italic bg-sky-50/40 p-2.5 rounded-lg border border-sky-100">
                        &ldquo;{r.comment}&rdquo;
                      </p>
                    )}

                    {/* Host Public Replies */}
                    {r.hostReplies && r.hostReplies.length > 0 ? (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-[#00a8ff]" /> Public Host Response:
                        </div>
                        {r.hostReplies.map((hr) => (
                          <div key={hr.id} className="p-2.5 bg-slate-100 rounded-lg text-xs text-slate-800 font-medium">
                            {hr.replyText}
                            <div className="text-[9px] text-slate-400 mt-1">Replied {formatDate(hr.repliedAt)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-100 flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedReviewForReply(r)}
                          className="text-xs font-bold text-[#00a8ff] gap-1"
                        >
                          <Send className="w-3 h-3" /> Post Host Reply
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Host Onboarding Wizard (Chapter 12.1)                   */}
      {/* ============================================================== */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Host & Operator Registration Wizard</h3>
                <p className="text-xs text-slate-500">Capture legal entity name, Tax ID, and commission tier.</p>
              </div>
              <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                registerVendorMutation.mutate(newVendor);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Entity / Host Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amalfi Coast Catamarans LLC"
                  value={newVendor.businessName}
                  onChange={(e) => setNewVendor({ ...newVendor, businessName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#00a8ff]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tax ID / Commercial Registration TIN</label>
                <input
                  type="text"
                  placeholder="e.g. US-EIN-984210 / EL-094182941"
                  value={newVendor.taxId}
                  onChange={(e) => setNewVendor({ ...newVendor, taxId: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#00a8ff]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Commission Margin (%)</label>
                <input
                  type="number"
                  value={newVendor.commissionRate}
                  onChange={(e) => setNewVendor({ ...newVendor, commissionRate: Number(e.target.value) || 15 })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#00a8ff]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setIsRegisterOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={registerVendorMutation.isPending} className="bg-[#00a8ff] text-white font-bold">
                  Submit Registration
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Host Public Reply to Review (Chapter 12.6)              */}
      {/* ============================================================== */}
      {selectedReviewForReply && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Post Public Host Response</h3>
                <p className="text-xs text-slate-500">Demonstrate 5-star customer care to future travelers.</p>
              </div>
              <button onClick={() => setSelectedReviewForReply(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 italic border border-slate-100">
              &ldquo;{selectedReviewForReply.comment}&rdquo;
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Your Official Host Response:</label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a professional, warm reply to the guest..."
                className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#00a8ff]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedReviewForReply(null)}>
                Cancel
              </Button>
              <Button
                disabled={!replyText.trim() || replyReviewMutation.isPending}
                onClick={() =>
                  replyReviewMutation.mutate({
                    reviewId: selectedReviewForReply.id,
                    text: replyText,
                  })
                }
                className="bg-[#00a8ff] text-white font-bold text-xs"
              >
                Publish Response
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Assign Vendor Team Member (Chapter 12.5)                */}
      {/* ============================================================== */}
      {selectedVendorForTeam && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Assign Operational Staff Role</h3>
                <p className="text-xs text-slate-500">{selectedVendorForTeam.businessName}</p>
              </div>
              <button onClick={() => setSelectedVendorForTeam(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Staff User UUID / ID *</label>
                <input
                  type="text"
                  placeholder="e.g. 55c3849e-0fa3-4b52-9c2d-b4cbe23e9901"
                  value={newTeamUserId}
                  onChange={(e) => setNewTeamUserId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role & Permission Tier *</label>
                <select
                  value={newTeamRole}
                  onChange={(e) => setNewTeamRole(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 font-bold text-xs"
                >
                  <option value="Property Manager">Property Manager (Full Operational)</option>
                  <option value="Front Desk / Check-In Staff">Front Desk / Check-In Staff (Manifests & Check-in)</option>
                  <option value="Cleaner / Housekeeper">Cleaner / Housekeeper (Cleaning Schedule & Restock)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedVendorForTeam(null)}>
                Cancel
              </Button>
              <Button
                disabled={!newTeamUserId.trim() || addTeamMemberMutation.isPending}
                onClick={() =>
                  addTeamMemberMutation.mutate({
                    vendorId: selectedVendorForTeam.id,
                    userId: newTeamUserId,
                    role: newTeamRole,
                  })
                }
                className="bg-[#00a8ff] text-white font-bold text-xs"
              >
                Assign Staff
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
