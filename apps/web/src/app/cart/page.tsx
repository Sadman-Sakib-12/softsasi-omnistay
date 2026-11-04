"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/features/cart/cart-store";
import { useCurrencyStore } from "@/features/currency/currency-store";
import { formatCurrency } from "@/lib/utils";
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Sparkles, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const { formatPrice } = useCurrencyStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-[#00a8ff] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const subtotal = getTotal();
  // Chapter 6.1 Smart Vacation Bundling: 12% off vehicle when booked with a stay
  const hasStay = items.some((i) => i.verticalType === "stay");
  const carItems = items.filter((i) => i.verticalType === "car");
  const carSubtotal = carItems.reduce((acc, c) => acc + c.pricePerUnit * c.quantity, 0);
  const bundleDiscount = (hasStay && carItems.length > 0) ? Math.round(carSubtotal * 0.12 * 100) / 100 : 0;
  const vatTax = Math.round(subtotal * 0.05 * 100) / 100; // 5% hospitality VAT
  const grandTotal = Math.max(0, subtotal + vatTax - bundleDiscount);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-3xl bg-sky-50 text-[#00a8ff] flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Travel Cart is Empty</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
          Explore luxury stays, guided tours, chauffeur car rentals, or private yachts and add them to your unified cart.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/stays">
            <Button size="lg">Explore Hotels & Stays</Button>
          </Link>
          <Link href="/tours">
            <Button variant="outline" size="lg">Browse Tours</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Cross-Vertical Travel Cart
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Bundle multiple stays, excursions, and mobility in one unified checkout.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
        >
          Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
            >
              <div className="flex gap-4 items-center">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0"
                  />
                )}
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-[#00a8ff] mb-1">
                    {item.verticalType}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                  {item.subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                  )}
                  <p className="text-xs font-semibold text-slate-700 mt-1">
                    {formatPrice(item.pricePerUnit)} / {item.unitLabel}
                  </p>
                </div>
              </div>

              {/* Quantity Controls & Total */}
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 hover:text-[#00a8ff] text-slate-500"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:text-[#00a8ff] text-slate-500"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-slate-900 block">
                    {formatPrice(item.pricePerUnit * item.quantity)}
                  </span>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Cross-vertical upsell hint */}
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-center gap-3 text-xs text-sky-900">
            <Sparkles className="w-5 h-5 text-[#00a8ff] shrink-0" />
            <span>
              <strong>Smart Travel Multi-Save:</strong> Booking a stay and a tour or car together automatically links your itinerary for synchronized arrival schedules.
            </span>
          </div>
        </div>

        {/* Order Summary & Checkout Card */}
        <aside className="lg:col-span-1">
          <div className="sticky top-28 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 text-lg">Reservation Summary</h3>

            <div className="space-y-3 text-sm text-slate-600 border-b border-slate-100 pb-5">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              {bundleDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Vacation Bundle (12% off Car)</span>
                  <span>-{formatPrice(bundleDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Government Hospitality VAT (5%)</span>
                <span className="font-semibold text-slate-900">{formatPrice(vatTax)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Platform Booking Fee</span>
                <span>FREE (Promotional)</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline text-slate-900">
              <span className="text-base font-bold">Grand Total</span>
              <span className="text-2xl font-black">{formatPrice(grandTotal)}</span>
            </div>

            <Button
              onClick={() => router.push("/checkout")}
              size="lg"
              className="w-full py-4 text-base font-bold gap-2 shadow-lg shadow-sky-500/25"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-5 h-5" />
            </Button>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Encrypted 256-bit Secure Checkout</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

