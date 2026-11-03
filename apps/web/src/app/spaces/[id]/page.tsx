"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TravelService, SpaceItem } from "@/features/travel/travel.service";
import { useCartStore } from "@/features/cart/cart-store";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  Users,
  Clock,
  Wifi,
  Sparkles,
  MapPin,
  CheckCircle2,
  Calendar,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "space-1";

  const [space, setSpace] = useState<SpaceItem | null>(null);
  const [bookingType, setBookingType] = useState<"day" | "hour">("day");
  const [hours, setHours] = useState(4);
  const [days, setDays] = useState(1);
  const [eventDate, setEventDate] = useState("");
  const [needsCatering, setNeedsCatering] = useState(false);
  const [needsAV, setNeedsAV] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    TravelService.getSpaceById(id).then((res) => {
      if (res) setSpace(res);
      else {
        TravelService.getSpaces().then((spaces) => {
          const match = spaces.find((s) => s.id === id) || spaces[0];
          setSpace(match || null);
        });
      }
    });
  }, [id]);

  if (!space) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-[#00a8ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading venue layout & specifications...</p>
      </div>
    );
  }

  const baseRate = bookingType === "day" ? space.dailyRate : space.hourlyRate;
  const quantity = bookingType === "day" ? days : hours;
  const addOnCost = (needsCatering ? 25000 : 0) + (needsAV ? 5000 : 0);
  const totalPrice = baseRate * quantity + addOnCost;

  const handleAddToCart = () => {
    addItem({
      verticalType: "space",
      resourceId: space.id,
      title: space.name,
      subtitle: `${bookingType === "day" ? `${days} Day(s)` : `${hours} Hours`} • ${space.type} • Up to ${space.capacity} Guests`,
      imageUrl: space.images[0],
      pricePerUnit: baseRate + (addOnCost / quantity),
      quantity,
      unitLabel: bookingType === "day" ? "day" : "hour",
      startDate: eventDate || undefined,
    });
    router.push("/cart");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#00a8ff] mb-2">
          <MapPin className="w-4 h-4" />
          <span>{space.location}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {space.name}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {space.type.toUpperCase()} Venue • Managed by Softsasi Spaces
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Gallery & Specs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-3xl overflow-hidden aspect-video bg-slate-100 shadow-md">
            <img
              src={space.images[0]}
              alt={space.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Dedicated Event Coordinator Included</span>
            </div>
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <Users className="w-5 h-5 text-[#00a8ff] mb-2" />
              <span className="text-xs text-slate-400 block font-medium">Guest Capacity</span>
              <span className="text-sm font-bold text-slate-900">{space.capacity} Pax</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <Building2 className="w-5 h-5 text-[#00a8ff] mb-2" />
              <span className="text-xs text-slate-400 block font-medium">Space Category</span>
              <span className="text-sm font-bold text-slate-900 capitalize">{space.type}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <Wifi className="w-5 h-5 text-[#00a8ff] mb-2" />
              <span className="text-xs text-slate-400 block font-medium">Connectivity</span>
              <span className="text-sm font-bold text-slate-900">Gigabit Fiber</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <Clock className="w-5 h-5 text-[#00a8ff] mb-2" />
              <span className="text-xs text-slate-400 block font-medium">Booking Window</span>
              <span className="text-sm font-bold text-slate-900">Hourly / Daily</span>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Venue Overview & Technical Amenities</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {space.description || "State-of-the-art event space and corporate boardroom configured for high-impact conferences, banquets, product launches, and private galas. Complete acoustic insulation with climate control."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Dual 4K Laser Projection & Wireless Microphones</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Dedicated Power Backup & UPS Redundancy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>On-Site Valet Parking for up to 150 Vehicles</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>VIP Green Room & Executive Lounge Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Booking Box */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6 sticky top-24">
            {/* Slot Mode */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setBookingType("day")}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  bookingType === "day"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Full Day Slot
              </button>
              <button
                type="button"
                onClick={() => setBookingType("hour")}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  bookingType === "hour"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Hourly Reservation
              </button>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Venue Rate
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-slate-900">
                  {formatCurrency(baseRate, "BDT")}
                </span>
                <span className="text-xs text-slate-500">
                  / {bookingType === "day" ? "day" : "hour"}
                </span>
              </div>
            </div>

            {/* Event Date & Duration */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  {bookingType === "day" ? "Days Duration" : "Slot Hours"}
                </label>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      if (bookingType === "day") setDays(Math.max(1, days - 1));
                      else setHours(Math.max(2, hours - 1));
                    }}
                    className="px-4 py-2 text-sm font-bold hover:bg-slate-200"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center text-xs font-bold text-slate-800">
                    {bookingType === "day" ? `${days} Day(s)` : `${hours} Hours`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (bookingType === "day") setDays(days + 1);
                      else setHours(hours + 1);
                    }}
                    className="px-4 py-2 text-sm font-bold hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Addons */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">
                  Equipment & Catering Add-ons
                </span>
                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                  <span>Pro 4K AV & Sound System (+৳5,000)</span>
                  <input
                    type="checkbox"
                    checked={needsAV}
                    onChange={(e) => setNeedsAV(e.target.checked)}
                    className="h-4 w-4 rounded text-[#00a8ff] focus:ring-[#00a8ff]"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                  <span>Executive Buffet Catering (+৳25,000)</span>
                  <input
                    type="checkbox"
                    checked={needsCatering}
                    onChange={(e) => setNeedsCatering(e.target.checked)}
                    className="h-4 w-4 rounded text-[#00a8ff] focus:ring-[#00a8ff]"
                  />
                </label>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Total Investment</span>
              <span className="text-xl font-black text-[#00a8ff]">
                {formatCurrency(totalPrice, "BDT")}
              </span>
            </div>

            <Button
              onClick={handleAddToCart}
              className="w-full py-6 font-extrabold uppercase tracking-wider text-xs bg-[#00a8ff] hover:bg-[#0092dd] shadow-lg shadow-sky-500/20 gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Reserve This Venue</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

