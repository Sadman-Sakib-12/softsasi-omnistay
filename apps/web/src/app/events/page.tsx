import React from "react";
import { TravelService } from "@/features/travel/travel.service";
import { VerticalCard } from "@/components/cards/vertical-card";
import { CalendarCheck, Sparkles, ShieldCheck, QrCode, Crown, Users } from "lucide-react";

export const metadata = {
  title: "Luxury Events, Summits & Galas | OmniStay 360",
  description: "Book passes to global hospitality summits, technology conferences, and Michelin-starred banquet galas.",
};

export default async function EventsPage() {
  const events = await TravelService.getEvents();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <span className="text-xs font-bold text-[#00a8ff] uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <CalendarCheck className="w-4 h-4" /> Global Summits & Luxury Galas
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Conferences, Galas & World Summits
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
          Reserve executive delegate passes and VIP tables for premier global business summits, tech innovation conferences, and black-tie charity galas.
        </p>
      </div>

      {/* Feature Highlights Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 bg-slate-50 border border-slate-100 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Encrypted QR Pass</div>
            <div className="text-[11px] text-slate-500">Contactless fast-track check-in</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">VIP Table Access</div>
            <div className="text-[11px] text-slate-500">Reserved premium floor seating</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Michelin Banqueting</div>
            <div className="text-[11px] text-slate-500">Curated gastronomic dining</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Verified Organizer</div>
            <div className="text-[11px] text-slate-500">100% authenticated events</div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {events.map((event) => {
          const startDate = new Date(event.startDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <VerticalCard
              key={event.id}
              id={event.id}
              verticalType="event"
              title={event.title}
              subtitle={`${event.eventType.toUpperCase()} • ${event.venueAddress}`}
              imageUrl={event.images[0]}
              price={event.startingPrice}
              unitLabel="pass"
              detailUrl={`/events/${event.id}`}
              metaBadge={`Date: ${startDate}`}
              specs={[
                { label: "Type", value: event.eventType },
                { label: "Capacity", value: `${event.maxCapacity} Seats` },
                { label: "Venue", value: event.venueAddress.split(",")[0] },
              ]}
            />
          );
        })}
      </div>
    </div>
  );
}

