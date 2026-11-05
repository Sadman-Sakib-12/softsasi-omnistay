'use client';

import React, { useState } from 'react';
import { BeatLoader } from 'react-spinners';
import {
  Wallet,
  Gift,
  Award,
  Share2,
  DollarSign,
  ArrowUpRight,
  CheckCircle2,
  Plus,
  X,
  CreditCard,
  QrCode,
  Copy,
  Check,
  TrendingUp,
  Percent,
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Tag,
  Users,
  Compass,
  Crown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  walletService,
  WalletSummary,
  WalletItem,
  LoyaltyTierItem,
  LoyaltyMemberItem,
  LoyaltyCatalogItem,
  ReferralLinkItem,
  GiftCardItem,
  CreateGiftCardDto,
  TopUpWalletDto,
} from '@/features/wallet/services/wallet.service';

export default function DigitalWalletLoyaltyPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'wallet' | 'loyalty' | 'referrals' | 'giftcards'>('wallet');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isAddGiftCardOpen, setIsAddGiftCardOpen] = useState(false);
  const [selectedReferralQr, setSelectedReferralQr] = useState<ReferralLinkItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Top-Up Form State
  const [topUpData, setTopUpData] = useState<TopUpWalletDto>({
    currency: 'USD',
    amount: 500,
    description: 'Manual wallet credit top-up via Admin Portal',
  });

  // Gift Card Form State
  const [newGiftCard, setNewGiftCard] = useState<CreateGiftCardDto>({
    recipientEmail: '',
    senderEmail: 'concierge@omnistay.com',
    amount: 250,
    currency: 'USD',
    theme: 'Luxury Escape',
    message: 'Wishing you an unforgettable luxury stay with our compliments.',
  });

  // Queries
  const { data: summary, isLoading: isSummaryLoading } = useQuery<WalletSummary>({
    queryKey: ['walletSummary'],
    queryFn: () => walletService.getSummary(),
  });

  const { data: wallets = [], isLoading: isWalletsLoading } = useQuery<WalletItem[]>({
    queryKey: ['allWallets'],
    queryFn: () => walletService.getAllWallets(),
  });

  const { data: tiers = [], isLoading: isTiersLoading } = useQuery<LoyaltyTierItem[]>({
    queryKey: ['loyaltyTiers'],
    queryFn: () => walletService.getLoyaltyTiers(),
  });

  const { data: members = [], isLoading: isMembersLoading } = useQuery<LoyaltyMemberItem[]>({
    queryKey: ['loyaltyMembers'],
    queryFn: () => walletService.getLoyaltyMembers(),
  });

  const { data: catalog = [], isLoading: isCatalogLoading } = useQuery<LoyaltyCatalogItem[]>({
    queryKey: ['loyaltyCatalog'],
    queryFn: () => walletService.getLoyaltyCatalog(),
  });

  const { data: referrals = [], isLoading: isReferralsLoading } = useQuery<ReferralLinkItem[]>({
    queryKey: ['allReferrals'],
    queryFn: () => walletService.getAllReferrals(),
  });

  const { data: giftCards = [], isLoading: isGiftCardsLoading } = useQuery<GiftCardItem[]>({
    queryKey: ['giftCardsList'],
    queryFn: () => walletService.getGiftCards(),
  });

  // Mutations
  const topUpMutation = useMutation({
    mutationFn: (dto: TopUpWalletDto) => walletService.topUpWallet(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allWallets'] });
      queryClient.invalidateQueries({ queryKey: ['walletSummary'] });
      setIsTopUpOpen(false);
    },
  });

  const createGiftCardMutation = useMutation({
    mutationFn: (dto: CreateGiftCardDto) => walletService.createGiftCard(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCardsList'] });
      setIsAddGiftCardOpen(false);
      setNewGiftCard({
        recipientEmail: '',
        senderEmail: 'concierge@omnistay.com',
        amount: 250,
        currency: 'USD',
        theme: 'Luxury Escape',
        message: 'Wishing you an unforgettable luxury stay with our compliments.',
      });
    },
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getTierBadge = (tierName?: string) => {
    switch (tierName) {
      case 'Platinum Ambassador':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Gold Elite':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Silver Voyager':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const formatCurrencyWithCode = (val: number, curr = 'USD') => {
    const symbolMap: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      AUD: 'A$',
    };
    const sym = symbolMap[curr] || '$';
    return `${sym}${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Chapter 13: Digital Wallet, Loyalty & Rewards Ecosystem</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#00a8ff]" /> Digital Wallet, Loyalty & Rewards
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pre-paid multi-currency stored balances, 4-tier USALI guest loyalty program, affiliate referrals, and gift cards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'wallet' && (
            <Button
              onClick={() => setIsTopUpOpen(true)}
              size="sm"
              className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Fund Wallet Top-Up
            </Button>
          )}

          {activeTab === 'giftcards' && (
            <Button
              onClick={() => setIsAddGiftCardOpen(true)}
              size="sm"
              className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Issue Digital Gift Card
            </Button>
          )}
        </div>
      </div>

      {/* Chapter 13 Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-lg border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'wallet' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-[#00a8ff]" />
          13.1 Pre-Paid Digital Wallet
        </button>
        <button
          onClick={() => setActiveTab('loyalty')}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'loyalty' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          13.2 Tiered Guest Loyalty Program
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'referrals' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-500" />
          13.3 Referral & Affiliate Marketing
        </button>
        <button
          onClick={() => setActiveTab('giftcards')}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'giftcards' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Gift className="w-3.5 h-3.5 text-indigo-500" />
          13.4 Digital Gift Card Engine
        </button>
      </div>

      {/* TAB 1: 13.1 PRE-PAID DIGITAL WALLET SYSTEM */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Total Stored Value Liability</span>
                <DollarSign className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {isSummaryLoading ? (
                  <BeatLoader color="#22d3ee" size={10} speedMultiplier={1.2} />
                ) : (
                  formatCurrency(summary?.totalStoredValueLiability || 0)
                )}
              </div>
              <p className="text-[11px] text-slate-400">Escrow liability across active guest wallets</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Active Customer Wallets</span>
                <Users className="w-4 h-4 text-[#00a8ff]" />
              </div>
              <div className="text-2xl font-bold text-[#00a8ff]">
                {isSummaryLoading ? (
                  <BeatLoader color="#22d3ee" size={10} speedMultiplier={1.2} />
                ) : (
                  summary?.totalActiveWallets || 0
                )}
              </div>
              <p className="text-[11px] text-slate-400">Pre-funded stored balances &gt; $0.00</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Total Top-Up Volume</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-600">
                {isSummaryLoading ? (
                  <BeatLoader color="#22d3ee" size={10} speedMultiplier={1.2} />
                ) : (
                  formatCurrency(summary?.totalTopUpVolume || 0)
                )}
              </div>
              <p className="text-[11px] text-slate-400">Includes promotional bonus credits</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Instant Wallet Refunds</span>
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-indigo-600">
                {isSummaryLoading ? (
                  <BeatLoader color="#22d3ee" size={10} speedMultiplier={1.2} />
                ) : (
                  formatCurrency(summary?.instantRefundVolume || 0)
                )}
              </div>
              <p className="text-[11px] text-slate-400">&lt;1s turnaround (retains liquidity)</p>
            </div>
          </div>

          {/* Promotional Bonus Feature Banner */}
          <div className="bg-linear-to-r from-cyan-50 via-sky-50 to-blue-50 border border-cyan-200 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-100 border border-cyan-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Chapter 13.1 Pre-Paid Promotional Bonus Engine Active
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Every $500 pre-funding milestone earns an instant <strong>+$50 Promotional Bonus Credit</strong>. 1-click frictionless booking checkout with zero payment gateway latency or 3D-Secure redirects.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsTopUpOpen(true)}
              variant="outline"
              size="sm"
              className="text-xs bg-white text-cyan-700 border-cyan-300 hover:bg-cyan-50 shrink-0 cursor-pointer"
            >
              Simulate $500 Top-Up
            </Button>
          </div>

          {/* Multi-Currency Customer Wallets Table */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Customer Multi-Currency Wallets</h3>
                <p className="text-[11px] text-slate-400">Stored value accounts across USD, EUR, GBP, and AUD</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                {wallets.length} Accounts Active
              </span>
            </div>

            {isWalletsLoading ? (
              <div className="flex items-center justify-center p-12">
                <BeatLoader color="#22d3ee" size={16} speedMultiplier={1.2} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">User Identifier</th>
                      <th className="py-3 px-4">Base Currency</th>
                      <th className="py-3 px-4">Stored Balance</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4">Recent Transactions</th>
                      <th className="py-3 px-4">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {wallets.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-800">
                          {w.userId.slice(0, 18)}...
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {w.currency}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                          {formatCurrencyWithCode(w.balance, w.currency)}
                        </td>
                        <td className="py-3 px-4">
                          {w.isLocked ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              Locked
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1 max-w-md">
                            {(w.transactions || []).slice(0, 2).map((t) => (
                              <div key={t.id} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    t.type === 'deposit'
                                      ? 'bg-emerald-500'
                                      : t.type === 'bonus'
                                      ? 'bg-cyan-500'
                                      : t.type === 'refund'
                                      ? 'bg-indigo-500'
                                      : 'bg-rose-500'
                                  }`}
                                />
                                <span className="font-semibold text-slate-800">
                                  {t.type === 'deposit' ? '+' : t.type === 'bonus' ? '+Bonus ' : t.type === 'refund' ? '+Refund ' : '-'}
                                  {formatCurrencyWithCode(t.amount, w.currency)}:
                                </span>
                                <span className="truncate text-slate-500">{t.description}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{w.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: 13.2 TIERED GUEST LOYALTY PROGRAM */}
      {activeTab === 'loyalty' && (
        <div className="space-y-6">
          {/* 4 Loyalty Tiers Comparison Cards */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" /> USALI-Standard 4-Tier Membership Architecture
            </h3>
            {isTiersLoading ? (
              <div className="flex items-center justify-center p-12 bg-white rounded-lg border border-slate-200">
                <BeatLoader color="#22d3ee" size={16} speedMultiplier={1.2} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {tiers.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTierBadge(t.name)}`}>
                        {t.multiplier}x Multiplier
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      <span className="text-slate-400">Threshold: </span>
                      <span className="font-semibold text-slate-800">
                        {t.minPoints.toLocaleString()} Min Points
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 min-h-[60px] leading-relaxed">
                      {t.perks?.description || (typeof t.perks === 'string' ? t.perks : 'Tier privileges and member rewards.')}
                    </div>

                    <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
                      <span>Qualifying:</span>
                      <span className="font-medium text-slate-600">{t.perks?.qualifying || 'Nights / Spend'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Loyalty Members Roster Table */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Active Loyalty Members & Points Balances</h3>
                <p className="text-[11px] text-slate-400">Real-time point accumulation and tier standing</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                {members.length} VIP Members
              </span>
            </div>

            {isMembersLoading ? (
              <div className="flex items-center justify-center p-12">
                <BeatLoader color="#22d3ee" size={16} speedMultiplier={1.2} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Member ID</th>
                      <th className="py-3 px-4">Current Tier</th>
                      <th className="py-3 px-4">Point Multiplier</th>
                      <th className="py-3 px-4">Total Points</th>
                      <th className="py-3 px-4">Folio Cash Value (1,000 pts = $10)</th>
                      <th className="py-3 px-4">Recent Ledger Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-800">
                          {m.userId.slice(0, 18)}...
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTierBadge(m.tier?.name)}`}>
                            {m.tier?.name || 'Bronze Explorer'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {m.tier?.multiplier || 1.0}x
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                          {m.points.toLocaleString()} pts
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-600">
                          {formatCurrency((m.points / 1000) * 10)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {(m.ledger || []).slice(0, 2).map((l) => (
                              <div key={l.id} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                                <span
                                  className={`font-semibold ${
                                    l.pointsDelta > 0 ? 'text-emerald-600' : 'text-rose-600'
                                  }`}
                                >
                                  {l.pointsDelta > 0 ? `+${l.pointsDelta}` : l.pointsDelta} pts
                                </span>
                                <span className="truncate text-slate-500 max-w-xs">{l.reason}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Points Redemption Catalog */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Points Redemption Catalog
                </h3>
                <p className="text-[11px] text-slate-400">
                  Points can be redeemed for instant cash deductions (1,000 pts = $10 discount) or luxury hospitality perks
                </p>
              </div>
              <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600">
                USALI Standard Catalog
              </Badge>
            </div>

            {isCatalogLoading ? (
              <div className="flex items-center justify-center p-8">
                <BeatLoader color="#22d3ee" size={14} speedMultiplier={1.2} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {catalog.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#00a8ff]/40 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {c.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {c.pointsRequired.toLocaleString()} Points
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs">{c.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{c.description}</p>
                    <div className="text-xs font-semibold text-emerald-600 pt-1 flex items-center justify-between border-t border-slate-100">
                      <span>Equivalent Value:</span>
                      <span>{formatCurrency(c.cashValue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: 13.3 REFERRAL & AFFILIATE MARKETING */}
      {activeTab === 'referrals' && (
        <div className="space-y-6">
          {/* Double-Sided Referral Incentive Banner */}
          <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                <Share2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Chapter 13.3 Double-Sided Referral & Influencer Engine
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  <strong>Referred friend receives $25 off</strong> their first booking; <strong>referring user receives $25 wallet credit</strong> upon stay completion. Includes real-time click tracking, conversion ratios, and monthly payouts.
                </p>
              </div>
            </div>
            <div className="px-3 py-1.5 bg-white border border-emerald-300 rounded-md text-xs font-bold text-emerald-700 shrink-0">
              $25 / $25 Incentive Model
            </div>
          </div>

          {/* Referral Campaigns Table */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Affiliate Influencer & User Referral Links</h3>
                <p className="text-[11px] text-slate-400">Click telemetry, booking conversions, and accrued commissions</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                {referrals.length} Campaigns Tracking
              </span>
            </div>

            {isReferralsLoading ? (
              <div className="flex items-center justify-center p-12">
                <BeatLoader color="#22d3ee" size={16} speedMultiplier={1.2} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Referral Code</th>
                      <th className="py-3 px-4">Personalized Tracking URL</th>
                      <th className="py-3 px-4">Clicks</th>
                      <th className="py-3 px-4">Conversions</th>
                      <th className="py-3 px-4">Conversion Rate</th>
                      <th className="py-3 px-4">Accrued Commissions</th>
                      <th className="py-3 px-4">QR & Deep Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {referrals.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {r.referralCode}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200 max-w-[220px] truncate">
                              {r.trackingUrl}
                            </span>
                            <button
                              onClick={() => copyToClipboard(r.trackingUrl, r.id)}
                              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Copy Tracking Link"
                            >
                              {copiedCode === r.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{r.clicksCount}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-600">
                          {r.convertedBookings} bookings
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                            {r.conversionRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                          {formatCurrency(r.totalCommissions)}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            onClick={() => setSelectedReferralQr(r)}
                            variant="outline"
                            size="sm"
                            className="text-[11px] h-7 px-2.5 cursor-pointer text-slate-700 hover:text-[#00a8ff]"
                          >
                            <QrCode className="w-3.5 h-3.5 mr-1 text-[#00a8ff]" /> View QR
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

      {/* TAB 4: 13.4 DIGITAL GIFT CARD ENGINE */}
      {activeTab === 'giftcards' && (
        <div className="space-y-6">
          {/* Gift Card Themes Showcase Banner */}
          <div className="bg-linear-to-r from-purple-50 via-indigo-50 to-pink-50 border border-purple-200 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Chapter 13.4 Digital Hospitality Gift Card Engine
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  16-character alphanumeric redemption codes with multi-theme styling (Birthday, Honeymoon, Luxury Escape, Spa Wellness) supporting partial balance redemption.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsAddGiftCardOpen(true)}
              size="sm"
              className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Issue Digital Gift Card
            </Button>
          </div>

          {/* Gift Cards Registry Table */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Issued Gift Cards & Balance Ledger</h3>
                <p className="text-[11px] text-slate-400">Alphanumeric codes, partial redemptions, and recipient emails</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-full border border-indigo-200">
                {giftCards.length} Active Cards
              </span>
            </div>

            {isGiftCardsLoading ? (
              <div className="flex items-center justify-center p-12">
                <BeatLoader color="#22d3ee" size={16} speedMultiplier={1.2} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">16-Char Card Code</th>
                      <th className="py-3 px-4">Recipient Email</th>
                      <th className="py-3 px-4">Sender Email</th>
                      <th className="py-3 px-4">Face Value</th>
                      <th className="py-3 px-4">Remaining Balance</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {giftCards.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{g.code}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{g.recipientEmail}</td>
                        <td className="py-3 px-4 text-slate-500">{g.senderEmail || 'concierge@omnistay.com'}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {formatCurrencyWithCode(g.initialVal, g.currency)}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-600 text-sm">
                          {formatCurrencyWithCode(g.currentVal, g.currency)}
                        </td>
                        <td className="py-3 px-4">
                          {g.isRedeemed || g.currentVal <= 0 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              Fully Redeemed
                            </span>
                          ) : g.currentVal < g.initialVal ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Partially Redeemed
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{g.expiresAt || 'No Expiry'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOP-UP MODAL SIMULATOR */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#00a8ff]" /> Pre-Paid Digital Wallet Top-Up
              </h3>
              <button
                onClick={() => setIsTopUpOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await topUpMutation.mutateAsync(topUpData);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Currency Base</label>
                <select
                  value={topUpData.currency}
                  onChange={(e) => setTopUpData({ ...topUpData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff] bg-white"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="AUD">AUD (A$) - Australian Dollar</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Top-Up Amount</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={topUpData.amount}
                  onChange={(e) => setTopUpData({ ...topUpData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
                <p className="text-[11px] text-cyan-600 mt-1 font-medium">
                  {topUpData.amount >= 500
                    ? `Eligible for +$${Math.floor(topUpData.amount / 500) * 50} Promotional Bonus Credit!`
                    : 'Tip: Top up $500 or more to unlock a $50 promotional bonus credit.'}
                </p>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Description / Memo</label>
                <input
                  type="text"
                  value={topUpData.description}
                  onChange={(e) => setTopUpData({ ...topUpData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTopUpOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={topUpMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white cursor-pointer"
                >
                  {topUpMutation.isPending ? (
                    <BeatLoader color="#ffffff" size={8} speedMultiplier={1.2} />
                  ) : (
                    'Confirm Top-Up'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE DIGITAL GIFT CARD MODAL */}
      {isAddGiftCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#00a8ff]" /> Issue Digital Hospitality Gift Card
              </h3>
              <button
                onClick={() => setIsAddGiftCardOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await createGiftCardMutation.mutateAsync(newGiftCard);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Design Theme</label>
                <select
                  value={newGiftCard.theme}
                  onChange={(e) => setNewGiftCard({ ...newGiftCard, theme: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff] bg-white"
                >
                  <option value="Luxury Escape">Luxury Escape Theme</option>
                  <option value="Birthday Celebration">Birthday Celebration Theme</option>
                  <option value="Honeymoon Suite">Honeymoon Suite Theme</option>
                  <option value="Spa Wellness Retreat">Spa Wellness Retreat Theme</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Recipient Email</label>
                <input
                  type="email"
                  required
                  value={newGiftCard.recipientEmail}
                  onChange={(e) => setNewGiftCard({ ...newGiftCard, recipientEmail: e.target.value })}
                  placeholder="e.g. guest.vip@luxurytravel.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Card Face Value ($)</label>
                <input
                  type="number"
                  min="25"
                  step="25"
                  required
                  value={newGiftCard.amount}
                  onChange={(e) => setNewGiftCard({ ...newGiftCard, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Personal Greeting Message</label>
                <textarea
                  rows={2}
                  value={newGiftCard.message}
                  onChange={(e) => setNewGiftCard({ ...newGiftCard, message: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddGiftCardOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createGiftCardMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white cursor-pointer"
                >
                  {createGiftCardMutation.isPending ? (
                    <BeatLoader color="#ffffff" size={8} speedMultiplier={1.2} />
                  ) : (
                    'Issue 16-Char Card'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR CODE PREVIEW MODAL */}
      {selectedReferralQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#00a8ff]" /> Personalized QR Code
              </h3>
              <button
                onClick={() => setSelectedReferralQr(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg inline-block my-2">
              {/* SVG QR Code Simulation */}
              <div className="w-44 h-44 bg-white p-2 border border-slate-300 rounded shadow-inner flex flex-col items-center justify-center font-mono text-[9px] text-slate-400">
                <QrCode className="w-32 h-32 text-slate-900" />
                <span className="mt-1 text-slate-600 font-bold">{selectedReferralQr.referralCode}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-2 font-mono">
              {selectedReferralQr.trackingUrl}
            </p>

            <p className="text-[11px] text-slate-400 mt-1">
              Scan with smartphone camera to apply the $25 discount automatically.
            </p>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <Button
                onClick={() => {
                  copyToClipboard(selectedReferralQr.trackingUrl, selectedReferralQr.id);
                  setSelectedReferralQr(null);
                }}
                size="sm"
                className="w-full bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy Referral Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
