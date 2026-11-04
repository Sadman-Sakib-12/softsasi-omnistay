"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TravelService, BoatItem } from "@/features/travel/travel.service";
import { useCartStore } from "@/features/cart/cart-store";
import { formatCurrency } from "@/lib/utils";
import { BeatLoader } from "react-spinners";
import {
  Anchor,
  Users,
  Compass,
  Clock,
  ShieldCheck,
  Calendar,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BoatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "boat-1";

  const [boat, setBoat] = useState<BoatItem | null>(null);
  const [charterType, setCharterType] = useState<"day" | "hourly">("day");
  const [hours, setHours] = useState(4);
  const [days, setDays] = useState(1);
  const [charterDate, setCharterDate] = useState("");
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    TravelService.getBoatById(id).then((res) => {
      if (res) setBoat(res);
      else {
        TravelService.getBoats().then((boats) => {
          const match = boats.find((b) => b.id === id) || boats[0];
          setBoat(match || null);
        });
      }
    });
  }, [id]);

  if (!boat) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
        <p className="text-slate-500 text-sm mt-4 font-medium animate-pulse">Loading yacht charter specifications...</p>
      </div>
    );
  }

  const unitPrice = charterType === "day" ? boat.pricePerDay : boat.pricePerHour;
  const quantity = charterType === "day" ? days : hours;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addItem({
      verticalType: "boat",
      resourceId: boat.id,
      title: boat.name,
      subtitle: `${charterType === "day" ? `${days} Day(s) Full Charter` : `${hours} Hours Cruise`} • ${boat.type} • Skipper Included`,
      imageUrl: boat.images[0],
      pricePerUnit: unitPrice,
      quantity,
      unitLabel: charterType === "day" ? "day" : "hour",
      startDate: charterDate || undefined,
    });
    router.push("/cart");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#00a8ff] mb-2">
          <MapPin className="w-4 h-4" />
          <span>{boat.location}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {boat.name}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {boat.type} • Fully Crewed Luxury Vessel
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Gallery & Specs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-3xl overflow-hidden aspect-video bg-slate-100 shadow-md">
            <img
              src={boat.images[0]}
              alt={boat.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Certified Captain & Coast Guard Safety Passed</span>
            </div>
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <Users className="w-5 h-5 text-[#00a8ff] mb-2" />
              <span className="text-xs text-slate-400 block font-medium">Guest Capacity</span>
              <span className="text-sm font-bold text-slate-900">{boat.capacity} Guests</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <Anchor className="w-5 h-5 text-[#00a8ff] mb-2" />
              <span className="text-xs text-slate-400 block font-medium">Vessel Class</span>
              <span className="text-sm font-bold text-slate-900">{boat.type}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <Compass className="w-5 h-5 text-[#00a8ff] mb-2" />
              <span className="text-xs text-slate-400 block font-medium">Crew / Captain</span>
              <span className="text-sm font-bold text-slate-900">Licensed Skipper</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <Clock className="w-5 h-5 text-[#00a8ff] mb-2" />
              <span className="text-xs text-slate-400 block font-medium">Charter Window</span>
              <span className="text-sm font-bold text-slate-900">Day & Overnight</span>
            </div>
          </div>

          {/* Amenities & Overview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Vessel Overview & Inclusions</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {boat.description || "Experience the breathtaking Bay of Bengal waters aboard our premium private charter yacht. Equipped with state-of-the-art navigation, flybridge sun deck, air-conditioned saloon, sound system, and gourmet catering capabilities."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Complimentary Welcome Refreshments & Fruit Platter</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Life Vests & Marine First-Aid Safety Kit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Flybridge Sun Lounge with Bluetooth Sound System</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Fuel & Mooring Dockage Included in Rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Charter Booking Box */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6 sticky top-24">
            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setCharterType("day")}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  charterType === "day"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Full Day Charter
              </button>
              <button
                type="button"
                onClick={() => setCharterType("hourly")}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  charterType === "hourly"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Hourly Cruise
              </button>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Charter Investment
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-slate-900">
                  {formatCurrency(unitPrice, "BDT")}
                </span>
                <span className="text-xs text-slate-500">
                  / {charterType === "day" ? "day" : "hour"}
                </span>
              </div>
            </div>

            {/* Date & Quantity */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Charter Date
                </label>
                <input
                  type="date"
                  value={charterDate}
                  onChange={(e) => setCharterDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  {charterType === "day" ? "Number of Days" : "Cruise Duration (Hours)"}
                </label>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      if (charterType === "day") setDays(Math.max(1, days - 1));
                      else setHours(Math.max(2, hours - 1));
                    }}
                    className="px-4 py-2 text-sm font-bold hover:bg-slate-200"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center text-xs font-bold text-slate-800">
                    {charterType === "day" ? `${days} Day(s)` : `${hours} Hours`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (charterType === "day") setDays(days + 1);
                      else setHours(hours + 1);
                    }}
                    className="px-4 py-2 text-sm font-bold hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Total Charter Fee</span>
              <span className="text-xl font-black text-[#00a8ff]">
                {formatCurrency(totalPrice, "BDT")}
              </span>
            </div>

            <Button
              onClick={handleAddToCart}
              className="w-full py-6 font-extrabold uppercase tracking-wider text-xs bg-[#00a8ff] hover:bg-[#0092dd] shadow-lg shadow-sky-500/20 gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Charter This Yacht</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

