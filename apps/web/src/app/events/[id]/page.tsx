"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TravelService, EventItem } from "@/features/travel/travel.service";
import { useCartStore } from "@/features/cart/cart-store";
import { formatCurrency } from "@/lib/utils";
import { BeatLoader } from "react-spinners";
import {
  CalendarCheck,
  MapPin,
  Calendar,
  Users,
  QrCode,
  Crown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "event-1";

  const [event, setEvent] = useState<EventItem | null>(null);
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    TravelService.getEventById(id).then((res) => {
      if (res) setEvent(res);
      else {
        TravelService.getEvents().then((events) => {
          const match = events.find((e) => e.id === id || e.slug === id) || events[0];
          setEvent(match || null);
        });
      }
    });
  }, [id]);

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <BeatLoader color="#00a8ff" size={18} speedMultiplier={1.2} />
        <p className="text-slate-500 text-sm mt-4 font-medium animate-pulse">Loading event passes & seating chart...</p>
      </div>
    );
  }

  const selectedTier = event.ticketTiers[selectedTierIndex] || event.ticketTiers[0] || {
    id: "std",
    name: "General Pass",
    price: event.startingPrice,
    totalSeats: 100,
  };

  const totalPrice = selectedTier.price * ticketQuantity;

  const startDateFormatted = new Date(event.startDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleBook = () => {
    addItem({
      verticalType: "event",
      resourceId: event.id,
      title: `${event.title} - ${selectedTier.name}`,
      subtitle: `${event.eventType} • ${event.venueAddress}`,
      imageUrl: event.images[0],
      pricePerUnit: selectedTier.price,
      quantity: ticketQuantity,
      unitLabel: "pass",
      startDate: event.startDate,
      endDate: event.endDate,
      meta: {
        tierName: selectedTier.name,
        venueAddress: event.venueAddress,
      },
    });
    router.push("/cart");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb / Tag */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
        <span>Events</span>
        <span>/</span>
        <span className="text-[#00a8ff]">{event.eventType}</span>
        <span>/</span>
        <span className="text-slate-900 truncate max-w-md">{event.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Event Media & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Event Banner */}
          <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-md aspect-16/9 relative bg-slate-900">
            <img
              src={event.images[0]}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-[#0b132b]/85 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
              <CalendarCheck className="w-3.5 h-3.5 text-[#00a8ff]" />
              {event.eventType}
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 rounded-2xl text-white">
              <h1 className="text-2xl sm:text-3xl font-extrabold">{event.title}</h1>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#00a8ff]" /> {event.venueAddress}
              </p>
            </div>
          </div>

          {/* Key Event Metrics */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Date</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{startDateFormatted}</div>
            </div>
            <div className="border-x border-slate-200">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Capacity</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{event.maxCapacity} Guests</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Ticketing</div>
              <div className="text-xs sm:text-sm font-bold text-emerald-600 mt-0.5">Instant QR Pass</div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900">About the Event</h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {event.description}
            </p>

            <h3 className="text-base font-bold text-slate-900 pt-4">Included with All Passes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                "Personalized encrypted dynamic QR pass",
                "Full keynote & session auditorium access",
                "Networking luncheon & artisanal coffee breaks",
                "Digital event handbook & certificate of attendance",
              ].map((inc, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{inc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Tier Selector & Booking Card */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-md sticky top-24">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Pass Pricing</span>
                <div className="text-2xl font-black text-slate-900">
                  {formatCurrency(selectedTier.price)}
                  <span className="text-xs text-slate-500 font-normal ml-1">/ person</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#00a8ff] border border-blue-100">
                Live Sales
              </span>
            </div>

            {/* Ticket Tier Selection */}
            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold text-slate-700 block">Select Ticket Tier</label>
              {event.ticketTiers.map((tier, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedTierIndex(idx)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    selectedTierIndex === idx
                      ? "border-[#00a8ff] bg-sky-50/50 ring-2 ring-[#00a8ff]/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{tier.name}</div>
                    <div className="text-[11px] text-slate-500">{tier.totalSeats} seats allocated</div>
                  </div>
                  <div className="text-xs font-extrabold text-slate-900">
                    {formatCurrency(tier.price)}
                  </div>
                </button>
              ))}
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-700 block mb-2">Number of Passes</label>
              <div className="flex items-center gap-3">
                {[1, 2, 4, 8].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setTicketQuantity(qty)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                      ticketQuantity === qty
                        ? "bg-[#0b132b] text-white border-[#0b132b]"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Summary */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>{selectedTier.name} × {ticketQuantity}</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>VAT & Service Charge</span>
                <span className="text-emerald-600 font-semibold">Included</span>
              </div>
              <div className="border-t border-slate-200/80 pt-2 flex justify-between text-sm font-black text-slate-900">
                <span>Total Amount</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleBook}
              className="w-full h-12 bg-[#00a8ff] hover:bg-[#0095e0] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Book Event Passes ({formatCurrency(totalPrice)})</span>
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% money-back guarantee if canceled by organizer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

