"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/features/cart/cart-store";
import { formatCurrency } from "@/lib/utils";
import {
  Plane,
  Calendar,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Users,
  Clock,
  Sparkles,
  ShoppingBag,
  FileCheck,
  Tag,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CharterFlight {
  id: string;
  from: string;
  to: string;
  type: string;
  aircraft: string;
  duration: string;
  pricePerSeat: number;
  departureTime: string;
  arrivalTime: string;
  capacity: number;
  helipad: string;
  isEmptyLeg?: boolean;
}

const CHARTER_FLIGHTS: CharterFlight[] = [
  {
    id: "fl-1",
    from: "Dhaka (DAC)",
    to: "Cox's Bazar (CXB)",
    type: "Helicopter Executive Transfer",
    aircraft: "Bell 429 Twin-Engine Luxury Helicopter",
    duration: "1h 10m",
    pricePerSeat: 65000,
    departureTime: "10:30 AM",
    arrivalTime: "11:40 AM",
    capacity: 6,
    helipad: "Resort Beachfront Helipad",
  },
  {
    id: "fl-2",
    from: "Dhaka (DAC)",
    to: "Sreemangal Tea Sanctuary (SRG)",
    type: "Private Seaplane Charter",
    aircraft: "Cessna Caravan Amphibian Seaplane",
    duration: "45m",
    pricePerSeat: 48000,
    departureTime: "02:15 PM",
    arrivalTime: "03:00 PM",
    capacity: 8,
    helipad: "Estate Private Lake Runway",
  },
  {
    id: "fl-3",
    from: "Chittagong (CGP)",
    to: "Saint Martin's Island (SMT)",
    type: "Helicopter Coastal Shuttle",
    aircraft: "Eurocopter EC130",
    duration: "35m",
    pricePerSeat: 42000,
    departureTime: "11:00 AM",
    arrivalTime: "11:35 AM",
    capacity: 5,
    helipad: "Coral Island Helipad",
  },
  {
    id: "fl-empty-1",
    from: "Cox's Bazar (CXB)",
    to: "Dhaka (DAC)",
    type: "Empty-Leg Return Deal (55% OFF)",
    aircraft: "Bell 429 Twin-Engine Luxury Helicopter",
    duration: "1h 10m",
    pricePerSeat: 29000,
    departureTime: "04:30 PM",
    arrivalTime: "05:40 PM",
    capacity: 6,
    helipad: "Dhaka Executive Ramp",
    isEmptyLeg: true,
  },
  {
    id: "fl-empty-2",
    from: "Saint Martin's Island (SMT)",
    to: "Chittagong (CGP)",
    type: "Empty-Leg Repositioning (53% OFF)",
    aircraft: "Eurocopter EC130",
    duration: "35m",
    pricePerSeat: 19500,
    departureTime: "03:00 PM",
    arrivalTime: "03:35 PM",
    capacity: 5,
    helipad: "Chittagong Private Helipad",
    isEmptyLeg: true,
  },
];

export default function FlightsPage() {
  const router = useRouter();
  const [selectedOrigin, setSelectedOrigin] = useState("All");
  const [passengers, setPassengers] = useState(2);
  const [flightDate, setFlightDate] = useState("");
  const [filterType, setFilterType] = useState<"all" | "regular" | "empty-leg">("all");
  const addItem = useCartStore((s) => s.addItem);

  // APIS Passenger Manifest State (Chapter 5.6)
  const [selectedFlightForManifest, setSelectedFlightForManifest] = useState<CharterFlight | null>(null);
  const [manifestData, setManifestData] = useState({
    legalFullName: "",
    passportNumber: "",
    dateOfBirth: "",
    gender: "Male",
    nationality: "Bangladeshi",
    specialRequests: "",
  });

  const filteredFlights = CHARTER_FLIGHTS.filter((f) => {
    const originMatch = selectedOrigin === "All" || f.from.includes(selectedOrigin);
    const typeMatch =
      filterType === "all"
        ? true
        : filterType === "empty-leg"
        ? !!f.isEmptyLeg
        : !f.isEmptyLeg;
    return originMatch && typeMatch;
  });

  const handleOpenManifestModal = (flight: CharterFlight) => {
    setSelectedFlightForManifest(flight);
  };

  const handleAutoFillManifest = () => {
    setManifestData({
      legalFullName: "TARIQUL ISLAM CHOWDHURY",
      passportNumber: "BP0829140",
      dateOfBirth: "1988-06-15",
      gender: "Male",
      nationality: "Bangladeshi",
      specialRequests: "VIP tarmac limousine escort required",
    });
  };

  const handleConfirmFlightManifest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlightForManifest) return;

    addItem({
      verticalType: "car",
      resourceId: selectedFlightForManifest.id,
      title: `${selectedFlightForManifest.type}: ${selectedFlightForManifest.from} ➔ ${selectedFlightForManifest.to}`,
      subtitle: `${selectedFlightForManifest.aircraft} • APIS Manifest Verified (${manifestData.legalFullName})`,
      imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80",
      pricePerUnit: selectedFlightForManifest.pricePerSeat,
      quantity: passengers,
      unitLabel: "seat",
      startDate: flightDate || undefined,
      meta: {
        flightManifest: manifestData,
      },
    });

    setSelectedFlightForManifest(null);
    router.push("/cart");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div>
        <span className="text-xs font-black text-[#00a8ff] uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <Plane className="w-4 h-4" /> Point-to-Point Aviation & Helipad Transfers (Chapter 5.6)
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Executive Helicopter, Seaplane & Empty-Leg Charters
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl">
          Bypass highway congestion with private aerial transfers directly to resort helipads. Complies with ICAO & APIS passenger manifest security guidelines.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Departure Hub
          </label>
          <select
            value={selectedOrigin}
            onChange={(e) => setSelectedOrigin(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800"
          >
            <option value="All">All Hubs (Dhaka, Cox&apos;s Bazar, SMT)</option>
            <option value="Dhaka">Dhaka (DAC)</option>
            <option value="Chittagong">Chittagong (CGP)</option>
            <option value="Cox's Bazar">Cox&apos;s Bazar (CXB)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Charter Category
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800"
          >
            <option value="all">All Flights (Charters & Empty Legs)</option>
            <option value="empty-leg">Empty-Leg Deals (Up to 60% OFF)</option>
            <option value="regular">Direct Private Charters</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Flight Date
          </label>
          <input
            type="date"
            value={flightDate}
            onChange={(e) => setFlightDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Passengers
          </label>
          <select
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800"
          >
            {[1, 2, 4, 6, 8].map((n) => (
              <option key={n} value={n}>
                {n} Passenger{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Flight Cards */}
      <div className="space-y-4">
        {filteredFlights.map((flight) => (
          <div
            key={flight.id}
            className={`p-6 sm:p-8 rounded-3xl bg-white border transition-all shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
              flight.isEmptyLeg
                ? "border-amber-300 hover:border-amber-500 bg-amber-50/20"
                : "border-slate-200/80 hover:border-[#00a8ff]"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 mt-1 ${
                  flight.isEmptyLeg ? "bg-amber-100 text-amber-700" : "bg-sky-50 text-[#00a8ff]"
                }`}
              >
                <Plane className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      flight.isEmptyLeg
                        ? "bg-amber-100 text-amber-900 border-amber-300 flex items-center gap-1"
                        : "bg-sky-50 text-[#00a8ff] border-sky-200"
                    }`}
                  >
                    {flight.isEmptyLeg && <Tag className="w-3 h-3" />}
                    {flight.type}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {flight.aircraft}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {flight.from} <span className="text-[#00a8ff]">➔</span> {flight.to}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {flight.departureTime} – {flight.arrivalTime} ({flight.duration})
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {flight.capacity} Passenger Capacity
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-600">
                    <MapPin className="w-3.5 h-3.5" />
                    {flight.helipad}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 w-full lg:w-auto justify-between border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900 block">
                  {formatCurrency(flight.pricePerSeat * passengers, "BDT")}
                </span>
                <span className="text-xs text-slate-400">
                  for {passengers} passenger{passengers > 1 ? "s" : ""}
                </span>
              </div>
              <Button
                onClick={() => handleOpenManifestModal(flight)}
                size="md"
                className={`gap-2 font-extrabold text-xs uppercase px-5 py-6 shadow-md ${
                  flight.isEmptyLeg
                    ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20"
                    : "bg-[#00a8ff] hover:bg-[#0092dd] text-white shadow-sky-500/20"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Reserve Flight</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* APIS / TSA Passenger Manifest Dialog (Chapter 5.6) */}
      {selectedFlightForManifest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-sky-400" /> APIS Passenger Flight Manifest (Chapter 5.6)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Aviation regulatory compliance for {selectedFlightForManifest.from} &rarr; {selectedFlightForManifest.to}
                </p>
              </div>
              <button
                onClick={() => setSelectedFlightForManifest(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmFlightManifest} className="p-6 space-y-4 text-xs">
              <div className="flex justify-between items-center bg-sky-50 p-2.5 rounded-xl border border-sky-200 text-sky-900 text-[11px]">
                <span>Requires full legal name as shown on national travel passport.</span>
                <button
                  type="button"
                  onClick={handleAutoFillManifest}
                  className="font-bold underline text-blue-700 hover:text-blue-900"
                >
                  Quick Auto-Fill
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Legal Name (as on Passport) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TARIQUL ISLAM CHOWDHURY"
                  value={manifestData.legalFullName}
                  onChange={(e) => setManifestData({ ...manifestData, legalFullName: e.target.value })}
                  className="w-full h-9 px-3 border border-slate-200 rounded-xl uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Passport / National ID # *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BP0829140"
                    value={manifestData.passportNumber}
                    onChange={(e) => setManifestData({ ...manifestData, passportNumber: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={manifestData.dateOfBirth}
                    onChange={(e) => setManifestData({ ...manifestData, dateOfBirth: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={manifestData.gender}
                    onChange={(e) => setManifestData({ ...manifestData, gender: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nationality</label>
                  <input
                    type="text"
                    value={manifestData.nationality}
                    onChange={(e) => setManifestData({ ...manifestData, nationality: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Special Aviation Requests (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Excess baggage (>25kg), wheelchair tarmac access"
                  value={manifestData.specialRequests}
                  onChange={(e) => setManifestData({ ...manifestData, specialRequests: e.target.value })}
                  className="w-full h-9 px-3 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 border-t flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedFlightForManifest(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#00a8ff] hover:bg-[#0092dd] text-white font-bold"
                >
                  Verify Manifest & Add to Cart
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
