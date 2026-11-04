import React from "react";
import Link from "next/link";
import { HeroSearchEngine } from "@/components/search/hero-search-engine";
import { StayCard } from "@/components/cards/stay-card";
import { VerticalCard } from "@/components/cards/vertical-card";
import { PropertiesService } from "@/features/properties/properties.service";
import { TravelService } from "@/features/travel/travel.service";
import { CustomizerService } from "@/features/customizer/customizer.service";
import {
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Waves,
  Palmtree,
  Mountain,
  Compass,
  Anchor,
  Building2,
  Crown,
  KeyRound,
  CheckCircle2,
  Play,
  Star,
} from "lucide-react";

// Luxury Experience Categories
const LUXURY_CATEGORIES = [
  { label: "Beachfront", icon: Waves, path: "/stays?tag=beach" },
  { label: "Private Islands", icon: Palmtree, path: "/spaces?type=island" },
  { label: "Alpine Chalets", icon: Mountain, path: "/spaces?type=chalet" },
  { label: "Palace Heritage", icon: Crown, path: "/stays?tag=heritage" },
  { label: "Safari Lodges", icon: Compass, path: "/tours?tag=safari" },
  { label: "Superyachts", icon: Anchor, path: "/boats" },
  { label: "Penthouses", icon: Building2, path: "/spaces?type=penthouse" },
];

export default async function HomePage() {
  // Real data fetched directly from PostgreSQL backend API
  const [properties, tours, cars, boats, customizer] = await Promise.all([
    PropertiesService.getAll(),
    TravelService.getTours(),
    TravelService.getCars(),
    TravelService.getBoats(),
    CustomizerService.getConfig(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. Hero Banner: Luxury Guest Booking Experience (Sakib_Project_Plan.pdf Figure 1.1) */}
      {customizer.sections.hero && (
        <section className="relative min-h-[480px] sm:min-h-[520px] lg:min-h-[560px] w-full overflow-hidden flex items-center justify-center">
          {/* Backdrop Banner: Warm Luxury Hotel Suite (Figure 1.1) */}
          <div className="absolute inset-0 z-0">
            <img
              src={customizer.heroBannerUrl && customizer.heroBannerUrl.includes('unsplash') 
                ? customizer.heroBannerUrl 
                : "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=2400&q=85"}
              alt="Luxury Suite Sanctuary"
              className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
            />
            {/* Ambient Warm Scrim Vignette Overlay (Figure 1.1) */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-slate-950/40 backdrop-blur-[0.5px]"
              style={{ opacity: Math.max(customizer.heroOverlayOpacity, 0.55) }}
            />
          </div>

          {/* Figure 1.1 Watermark Luxury Typography */}
          <div className="pointer-events-none absolute bottom-4 sm:bottom-6 left-0 right-0 overflow-hidden select-none z-5 text-center">
            <span className="text-[12vw] sm:text-[14vw] font-serif font-black tracking-[0.25em] uppercase text-white/[0.07] leading-none whitespace-nowrap block">
              LUXURY HOTEL
            </span>
          </div>

          {/* Hero Content Container - Vertically Balanced with Video Tour Trigger */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-10 text-left">
                {/* 5-Star Rating Pill (Figure 1.1) */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10 mb-3.5 shadow-sm">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold tracking-wider text-amber-200 uppercase ml-1">
                    5-Star Luxury Experience
                  </span>
                </div>

                {/* Hero Title - High-Converting Sanctuary Headline (Figure 1.1) */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white drop-shadow-md leading-[1.1] uppercase">
                  {customizer.heroTitle && customizer.heroTitle !== "Hi There!"
                    ? customizer.heroTitle
                    : "PRIVATE SEASIDE SANCTUARY"}
                </h1>

                {/* Subtitle Paragraph */}
                <p className="mt-3 text-xs sm:text-sm md:text-base font-light text-white/90 drop-shadow-sm mb-6 max-w-2xl leading-relaxed tracking-wide">
                  {customizer.heroSubtitle && customizer.heroSubtitle !== "Where would you like to go?"
                    ? customizer.heroSubtitle
                    : "Experience unhurried luxury where contemporary elegance meets timeless hospitality across the world's most breathtaking sanctuaries."}
                </p>

                {/* Floating Luxury Search Engine */}
                <HeroSearchEngine
                  activeTabs={customizer.searchTabs}
                  searchButtonText={customizer.searchButtonText}
                  searchButtonColor={customizer.searchButtonColor}
                />
              </div>

              {/* Right Side Video Tour Preview Button (Figure 1.1) */}
              <div className="hidden lg:flex lg:col-span-2 items-center justify-end">
                <div className="flex flex-col items-center gap-3">
                  <a
                    href="/stays"
                    className="group relative flex items-center justify-center w-18 h-18 rounded-full bg-white text-slate-950 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
                    aria-label="Explore Video Tour"
                    title="Watch Sanctuary Tour"
                  >
                    <div className="absolute inset-0 rounded-full bg-white/40 animate-ping opacity-70" />
                    <Play className="w-6 h-6 fill-slate-950 text-slate-950 ml-1 transition-transform group-hover:scale-110" />
                  </a>
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-white/80 drop-shadow-sm">
                    Watch Tour
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Luxury Category Quick-Browse Bar */}
      <section className="border-b border-slate-100 bg-white py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-none py-1">
            {LUXURY_CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={idx}
                  href={cat.path}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-slate-600 hover:text-[#0284c7] hover:bg-sky-50 transition-all group shrink-0 border border-slate-100/80 hover:border-sky-200"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-sky-100 flex items-center justify-center text-slate-600 group-hover:text-[#0284c7] transition-colors">
                    <Icon className="w-3.5 h-3.5 stroke-[1.8]" />
                  </div>
                  <span className="text-xs font-semibold tracking-tight whitespace-nowrap">
                    {cat.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Three Feature Cards Section */}
      {customizer.sections.featureCards && (
        <section className="bg-white py-8 sm:py-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Holiday Sale / Special Offers */}
              <Link
                href="/stays"
                className="rounded-2xl text-white p-6 min-h-[190px] sm:min-h-[210px] relative overflow-hidden shadow-md flex flex-col justify-between group cursor-pointer hover:shadow-xl transition-all duration-300"
              >
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
                  alt="Special Offers"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/20" />
                <div className="relative z-10">
                  <span className="bg-rose-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider inline-block shadow-xs">
                    {customizer.featureCard1.badge || "SPECIAL OFFER · 35% OFF"}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-2.5 tracking-tight leading-snug drop-shadow-md">
                    {customizer.featureCard1.title || "Winter Sun & Overwater Escapes"}
                  </h3>
                  <p className="text-[11px] text-white/80 mt-1 line-clamp-1">
                    Complimentary daily champagne breakfast & spa credits.
                  </p>
                </div>
                <div className="relative z-10 flex items-center gap-1.5 text-xs font-bold text-sky-300 group-hover:text-white transition-colors mt-3">
                  <span>Explore Offers</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 2: Curated Retreats */}
              <Link
                href="/spaces"
                className="rounded-2xl text-white p-6 min-h-[190px] sm:min-h-[210px] relative overflow-hidden shadow-md flex flex-col justify-between group cursor-pointer hover:shadow-xl transition-all duration-300"
              >
                <img
                  src="https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80"
                  alt="Private Villas"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/20" />
                <div className="relative z-10">
                  <span className="bg-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider inline-block shadow-xs">
                    CURATED RETREATS
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-2.5 tracking-tight leading-snug drop-shadow-md">
                    {customizer.featureCard2.title || "Private Villas & Alpine Chalets"}
                  </h3>
                  <p className="text-[11px] text-white/80 mt-1 line-clamp-1">
                    Dedicated private butler & heated infinity pool.
                  </p>
                </div>
                <div className="relative z-10 flex items-center gap-1.5 text-xs font-bold text-amber-300 group-hover:text-white transition-colors mt-3">
                  <span>Discover Villas</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 3: VIP Fleet */}
              <Link
                href="/boats"
                className="rounded-2xl text-white p-6 min-h-[190px] sm:min-h-[210px] relative overflow-hidden shadow-md flex flex-col justify-between group cursor-pointer hover:shadow-xl transition-all duration-300"
              >
                <img
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80"
                  alt="VIP Fleet"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/20" />
                <div className="relative z-10">
                  <span className="bg-cyan-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider inline-block shadow-xs">
                    EXCLUSIVE VIP FLEET
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-2.5 tracking-tight leading-snug drop-shadow-md">
                    {customizer.featureCard3.title || "Yacht Charters & VIP Chauffeurs"}
                  </h3>
                  <p className="text-[11px] text-white/80 mt-1 line-clamp-1">
                    Private catamaran cruises & luxury supercars.
                  </p>
                </div>
                <div className="relative z-10 flex items-center gap-1.5 text-xs font-bold text-cyan-300 group-hover:text-white transition-colors mt-3">
                  <span>Reserve Fleet</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4. Trust & Hospitality Guarantees Bar */}
      <section className="bg-slate-50 border-y border-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#0284c7] flex items-center justify-center shrink-0">
                <Award className="w-4.5 h-4.5 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Best Rate Guarantee</h4>
                <p className="text-[11px] text-slate-500">Direct integration, zero markups</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4.5 h-4.5 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">100% Verified Stays</h4>
                <p className="text-[11px] text-slate-500">Inspected for 5-star cleanliness</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4.5 h-4.5 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">24/7 AI Concierge</h4>
                <p className="text-[11px] text-slate-500">Instant personalized assistance</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <KeyRound className="w-4.5 h-4.5 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Smart Digital Key</h4>
                <p className="text-[11px] text-slate-500">Contactless QR & NFC check-in</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Stays - Real API Data from PostgreSQL */}
      {customizer.sections.featuredStays && (
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
            <div>
              <span className="text-xs font-black text-[#0284c7] uppercase tracking-widest">
                Handpicked Sanctuaries
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
                Featured Luxury Hotels & Resorts
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Verified luxury properties with instant booking confirmation and flexible cancellations.
              </p>
            </div>
            <Link
              href="/stays"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284c7] hover:text-[#0369a1] uppercase tracking-wider group"
            >
              <span>View All Hotels ({properties.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <StayCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Guided Expeditions & Tours - Real API Data */}
      {customizer.sections.trendingTours && (
        <section className="py-12 bg-slate-50/80 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
              <div>
                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">
                  Curated Expeditions
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
                  Guided Tours & Naturalist Safaris
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                  Private itineraries led by certified experts with all-inclusive luxury hospitality.
                </p>
              </div>
              <Link
                href="/tours"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider group"
              >
                <span>View All Tours ({tours.length})</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tours.map((tour) => (
                <VerticalCard
                  key={tour.id}
                  id={tour.id}
                  verticalType="tour"
                  title={tour.title}
                  subtitle={`${tour.durationHours} Hours • ${tour.location}`}
                  imageUrl={tour.images[0]}
                  price={tour.pricePerPerson}
                  unitLabel="person"
                  detailUrl={`/tours/${tour.id}`}
                  metaBadge="Naturalist Guide"
                  specs={[
                    { label: "Duration", value: `${tour.durationHours}h` },
                    { label: "Max Group", value: `${tour.maxParticipants} pax` },
                  ]}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Luxury Fleets & Marine Charters - Real API Data */}
      {customizer.sections.verticals && (
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
            <div>
              <span className="text-xs font-black text-amber-600 uppercase tracking-widest">
                Executive Mobility & Charters
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
                Chauffeur Fleets & Luxury Marine
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Private yachts with licensed captains and luxury executive SUVs with chauffeur service.
              </p>
            </div>
            <Link
              href="/cars"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 uppercase tracking-wider group"
            >
              <span>Explore Fleet ({cars.length + boats.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cars.map((car) => (
              <VerticalCard
                key={car.id}
                id={car.id}
                verticalType="car"
                title={`${car.make} ${car.model}`}
                subtitle={car.category}
                imageUrl={car.images[0]}
                price={car.pricePerDay}
                unitLabel="day"
                detailUrl="/cars"
                metaBadge={car.withDriver ? "With Chauffeur" : "Self-Drive"}
                specs={[
                  { label: "Seats", value: String(car.seats) },
                  { label: "Fuel", value: car.fuelType },
                ]}
              />
            ))}

            {boats.map((boat) => (
              <VerticalCard
                key={boat.id}
                id={boat.id}
                verticalType="boat"
                title={boat.name}
                subtitle={`${boat.type} Charter`}
                imageUrl={boat.images[0]}
                price={boat.pricePerDay}
                unitLabel="day"
                detailUrl="/boats"
                metaBadge="Includes Captain"
                specs={[
                  { label: "Capacity", value: `${boat.capacity} guests` },
                  { label: "Base", value: boat.location },
                ]}
              />
            ))}
          </div>
        </section>
      )}

      {/* 8. OmniStay Privé VIP Club Newsletter Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-7 sm:p-10 relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="text-amber-400 font-black text-xs uppercase tracking-widest">
              Exclusive Guest Privileges
            </span>
            <h3 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
              Join OmniStay Privé Club
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Unlock secret member-only rates, complimentary room upgrades, late check-out privileges, and priority yacht charter reservations.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                placeholder="Enter your email address"
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 flex-1 backdrop-blur-sm"
              />
              <button
                type="button"
                className="bg-white hover:bg-slate-100 text-slate-900 font-bold px-6 py-2.5 rounded-lg text-xs sm:text-sm transition-all shadow-sm shrink-0 cursor-pointer"
              >
                Join Free
              </button>
            </div>
            <div className="mt-3 flex items-center gap-4 text-[10px] sm:text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Instant 10% Welcome Discount
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> No Spam, Unsubscribe Anytime
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
