"use client";

import React from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/features/cart/cart-store";
import { useCurrencyStore } from "@/features/currency/currency-store";
import { Plus, Check, Clock, Users, ArrowRight } from "lucide-react";

export interface VerticalCardProps {
  id: string;
  verticalType: "tour" | "car" | "boat" | "space";
  title: string;
  subtitle?: string;
  imageUrl: string;
  price: number;
  unitLabel: string;
  detailUrl: string;
  metaBadge?: string;
  specs?: { label: string; value: string }[];
}

export function VerticalCard({
  id,
  verticalType,
  title,
  subtitle,
  imageUrl,
  price,
  unitLabel,
  detailUrl,
  metaBadge,
  specs,
}: VerticalCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const formatPrice = useCurrencyStore((s) => s.formatPrice);
  const [added, setAdded] = React.useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      verticalType,
      resourceId: id,
      title,
      subtitle,
      imageUrl,
      pricePerUnit: price,
      quantity: 1,
      unitLabel,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Image */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {metaBadge && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xs">
            {metaBadge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {subtitle && (
            <p className="text-xs text-[#00a8ff] font-semibold uppercase tracking-wider mb-1">
              {subtitle}
            </p>
          )}

          <Link href={detailUrl}>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-[#00a8ff] transition-colors line-clamp-1">
              {title}
            </h3>
          </Link>

          {/* Specs pills */}
          {specs && specs.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {specs.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-[11px] font-medium bg-slate-50 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-100"
                >
                  {s.label}: <strong className="ml-1 text-slate-800">{s.value}</strong>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900" suppressHydrationWarning>
                {formatPrice(price)}
              </span>
              <span className="text-xs text-slate-500">/ {unitLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleQuickAdd}
              className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                added
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 hover:bg-[#00a8ff] text-slate-700 hover:text-white"
              }`}
              title="Add to Cross-Vertical Cart"
            >
              {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>

            <Link href={detailUrl}>
              <button className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-[#00a8ff] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer flex items-center gap-1">
                <span>Details</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

