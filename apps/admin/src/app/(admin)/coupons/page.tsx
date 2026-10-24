'use client';

import React, { useState } from 'react';
import { TicketPercent, Plus, Search, Tag, Calendar, Percent, DollarSign, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface CouponItem {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minSpend: number;
  totalUsageLimit: number;
  usedCount: number;
  status: string;
}

export default function CouponsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    discountValue: 20,
    minSpend: 150,
    totalUsageLimit: 500,
    status: 'Active',
  });
  const [coupons, setCoupons] = useState<CouponItem[]>([
    { id: 'c-1', code: 'WELCOME20', discountType: 'PERCENTAGE', discountValue: 20, minSpend: 150, totalUsageLimit: 500, usedCount: 142, status: 'Active' },
    { id: 'c-2', code: 'LUXURY50', discountType: 'FIXED_AMOUNT', discountValue: 50, minSpend: 300, totalUsageLimit: 200, usedCount: 89, status: 'Active' },
    { id: 'c-3', code: 'SUMMERVIBES', discountType: 'PERCENTAGE', discountValue: 15, minSpend: 200, totalUsageLimit: 1000, usedCount: 420, status: 'Active' },
  ]);

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;
    setCoupons((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        code: newCoupon.code.toUpperCase().trim(),
        discountType: newCoupon.discountType,
        discountValue: Number(newCoupon.discountValue),
        minSpend: Number(newCoupon.minSpend),
        totalUsageLimit: Number(newCoupon.totalUsageLimit),
        usedCount: 0,
        status: newCoupon.status,
      },
    ]);
    setIsAddCouponOpen(false);
    setNewCoupon({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minSpend: 150,
      totalUsageLimit: 500,
      status: 'Active',
    });
  };

  const filtered = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Coupons & Promotions</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <TicketPercent className="w-6 h-6 text-[#00a8ff]" /> Coupons & Promotional Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Percentage discounts, fixed vouchers, usage caps, and seasonal campaign codes (Chapter 6.5).
          </p>
        </div>

        <button
          onClick={() => setIsAddCouponOpen(true)}
          className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search coupon codes..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
          />
        </div>
        <span className="text-xs text-slate-500">Found {filtered.length} coupon codes</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Coupon Code</th>
              <th className="py-3 px-4">Discount</th>
              <th className="py-3 px-4">Min Spend</th>
              <th className="py-3 px-4">Redemptions</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#00a8ff]" />
                  <span>{c.code}</span>
                </td>
                <td className="py-3 px-4 font-bold text-emerald-600">
                  {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `$${c.discountValue} OFF`}
                </td>
                <td className="py-3 px-4 text-slate-600">{formatCurrency(c.minSpend)}</td>
                <td className="py-3 px-4 text-slate-600">
                  {c.usedCount} / {c.totalUsageLimit} used
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Coupon Modal Dialog */}
      {isAddCouponOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TicketPercent className="w-4 h-4 text-[#00a8ff]" /> Create Promotional Coupon
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCouponOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCoupon}>
              <div className="p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-semibold">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE30"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 uppercase font-mono font-bold focus:outline-none focus:border-[#00a8ff]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Discount Type</label>
                    <select
                      value={newCoupon.discountType}
                      onChange={(e) =>
                        setNewCoupon({
                          ...newCoupon,
                          discountType: e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT',
                        })
                      }
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">
                      Value {newCoupon.discountType === 'PERCENTAGE' ? '(%)' : '($)'} *
                    </label>
                    <input
                      type="number"
                      required
                      value={newCoupon.discountValue}
                      onChange={(e) =>
                        setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })
                      }
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Min Spend ($)</label>
                    <input
                      type="number"
                      value={newCoupon.minSpend}
                      onChange={(e) =>
                        setNewCoupon({ ...newCoupon, minSpend: Number(e.target.value) })
                      }
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-700 font-semibold">Total Usage Cap</label>
                    <input
                      type="number"
                      value={newCoupon.totalUsageLimit}
                      onChange={(e) =>
                        setNewCoupon({ ...newCoupon, totalUsageLimit: Number(e.target.value) })
                      }
                      className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
                    />
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCouponOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#00a8ff] hover:bg-[#0097e6] rounded transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
