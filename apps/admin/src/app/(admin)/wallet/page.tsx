'use client';

import React, { useState } from 'react';
import { Wallet, Gift, Award, Share2, DollarSign, ArrowUpRight, CheckCircle2, Plus, Loader2, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService, LoyaltyTierItem, GiftCardItem, WalletSummary, CreateGiftCardDto } from '@/features/wallet/services/wallet.service';

export default function DigitalWalletLoyaltyPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'wallet' | 'loyalty' | 'giftcards'>('wallet');
  const [isAddGiftCardOpen, setIsAddGiftCardOpen] = useState(false);
  const [newGiftCard, setNewGiftCard] = useState<CreateGiftCardDto>({
    recipientEmail: '',
    amount: 0,
    message: '',
  });

  const { data: summary, isLoading: isSummaryLoading } = useQuery<WalletSummary>({
    queryKey: ['walletSummary'],
    queryFn: () => walletService.getSummary(),
  });

  const { data: tiers = [], isLoading: isTiersLoading } = useQuery<LoyaltyTierItem[]>({
    queryKey: ['loyaltyTiers'],
    queryFn: () => walletService.getLoyaltyTiers(),
  });

  const { data: giftCards = [], isLoading: isGiftCardsLoading } = useQuery<GiftCardItem[]>({
    queryKey: ['giftCardsList'],
    queryFn: () => walletService.getGiftCards(),
  });

  const createGiftCardMutation = useMutation({
    mutationFn: (dto: CreateGiftCardDto) => walletService.createGiftCard(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCardsList'] });
      setIsAddGiftCardOpen(false);
      setNewGiftCard({ recipientEmail: '', amount: 0, message: '' });
    },
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Digital Wallet & Loyalty</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#00a8ff]" /> Digital Wallet, Loyalty & Gift Cards
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pre-funded customer wallets, 4-tier guest loyalty program, and instant digital gift cards (Chapter 13).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'wallet' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Digital Wallet
            </button>
            <button
              onClick={() => setActiveTab('loyalty')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'loyalty' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4-Tier Loyalty
            </button>
            <button
              onClick={() => setActiveTab('giftcards')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'giftcards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gift Cards
            </button>
          </div>

          {activeTab === 'giftcards' && (
            <Button
              onClick={() => setIsAddGiftCardOpen(true)}
              size="sm"
              className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Issue Gift Card
            </Button>
          )}
        </div>
      </div>

      {activeTab === 'wallet' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-2">
            <span className="text-xs text-slate-500 font-medium">Total Stored Value Liability</span>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(summary?.totalStoredValueLiability || 0)}
            </div>
            <p className="text-[11px] text-slate-400">Pre-funded user balances</p>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-2">
            <span className="text-xs text-slate-500 font-medium">Active Customer Wallets</span>
            <div className="text-2xl font-bold text-[#00a8ff]">
              {summary?.totalActiveWallets || 0}
            </div>
            <p className="text-[11px] text-slate-400">Holders with &gt;$0 balance</p>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-2">
            <span className="text-xs text-slate-500 font-medium">30-Day Top-Up Volume</span>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(summary?.totalTopUpVolume || 0)}
            </div>
            <p className="text-[11px] text-slate-400">Credit card & bank top-ups</p>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-2">
            <span className="text-xs text-slate-500 font-medium">Instant Wallet Refunds</span>
            <div className="text-2xl font-bold text-indigo-600">
              {formatCurrency(summary?.instantRefundVolume || 0)}
            </div>
            <p className="text-[11px] text-slate-400">&lt;1s settlement turnaround</p>
          </div>
        </div>
      )}

      {activeTab === 'loyalty' && (
        <>
          {isTiersLoading ? (
            <div className="flex items-center justify-center p-12 bg-white rounded-lg border border-slate-200">
              <Loader2 className="w-5 h-5 animate-spin text-[#00a8ff]" />
            </div>
          ) : tiers.length === 0 ? (
            <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-lg p-6">
              <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No loyalty tiers configured</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Define membership tier thresholds and point multipliers in loyalty settings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tiers.map((t) => (
                <div key={t.id} className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      {t.multiplier}x Points
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    <span>Qualifying Threshold: </span>
                    <span className="font-semibold text-slate-800">{t.qualifyingNights} Nights</span>
                  </div>
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                    {t.perks}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'giftcards' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Card Code</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Face Value</th>
                <th className="py-3 px-4">Remaining Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Issued Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isGiftCardsLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#00a8ff]" />
                    <span className="mt-2 block text-xs">Loading gift cards...</span>
                  </td>
                </tr>
              ) : giftCards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No gift cards issued yet.
                  </td>
                </tr>
              ) : (
                giftCards.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{g.code}</td>
                    <td className="py-3 px-4 text-slate-600">{g.recipientEmail}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{formatCurrency(g.amount)}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">{formatCurrency(g.balance)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {g.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{g.createdAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Issue Gift Card Modal */}
      {isAddGiftCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#00a8ff]" /> Issue Digital Hospitality Gift Card
              </h3>
              <button onClick={() => setIsAddGiftCardOpen(false)} className="text-slate-400 hover:text-slate-600">
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
                <label className="block text-slate-600 font-semibold mb-1">Recipient Email</label>
                <input
                  type="email"
                  required
                  value={newGiftCard.recipientEmail}
                  onChange={(e) => setNewGiftCard({ ...newGiftCard, recipientEmail: e.target.value })}
                  placeholder="e.g. VIP.guest@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Card Monetary Value ($)</label>
                <input
                  type="number"
                  required
                  value={newGiftCard.amount}
                  onChange={(e) => setNewGiftCard({ ...newGiftCard, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Greeting Message</label>
                <textarea
                  rows={2}
                  value={newGiftCard.message}
                  onChange={(e) => setNewGiftCard({ ...newGiftCard, message: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddGiftCardOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createGiftCardMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white"
                >
                  {createGiftCardMutation.isPending ? 'Generating...' : 'Issue Gift Card'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
