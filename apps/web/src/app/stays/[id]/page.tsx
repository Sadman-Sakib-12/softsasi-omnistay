"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PropertiesService, Property, RoomType } from "@/features/properties/properties.service";
import { useCartStore } from "@/features/cart/cart-store";
import { useCurrencyStore } from "@/features/currency/currency-store";
import {
  MapPin,
  Star,
  Check,
  Bed,
  Users,
  Maximize2,
  Share2,
  Heart,
  ShoppingBag,
  Tv,
  Wifi,
  Coffee,
  Car,
  Bell,
  Sparkles,
  ChevronRight,
  Maximize,
  Video,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const DEFAULT_FIGURE_6_1_PROPERTY: Property = {
  id: "parian-holiday-villas",
  code: "PARIAN-01",
  name: "Parian Holiday Villas",
  address: "Regal Cinemas Battery Park",
  city: "New York",
  country: "United States",
  propertyType: "Hotels",
  starRating: 5,
  description: "Built in 1986, Hotel Stanford is a distinct addition to New York (NY) and a smart choice for travelers. The excitement of the city center is only 0 KM away. No less exceptional is the hotel's easy access to the city's myriad attractions and landmarks, such as Toto Music Studio, British Virgin Islands Tourist Board, L'Atelier Du Chocolat. Start and end in San Francisco! With the In-depth cultural tour Northern California Summer 2019, you have an 8 day tour package taking you through San Francisco, USA and 9 other destinations in USA. Northern California Summer 2019 includes accommodation as well as an expert guide, meals, transport and more.",
  lowestPrice: 350,
  images: [
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80",
  ],
  amenities: [
    "Wake-up call",
    "Car hire",
    "Bicycle hire",
    "Flat Tv",
    "Laundry and dry cleaning",
    "Internet - Wifi",
    "Coffee and tea",
  ],
  rooms: [
    {
      id: "rm-1",
      propertyId: "parian-holiday-villas",
      name: "Standard Double Room",
      description: "King bed with city view, soundproof glazing & marble bath.",
      basePrice: 350,
      bedType: "1 King Bed",
      maxOccupancy: 2,
      sizeSquareMeters: 42,
      images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"],
      amenities: ["Free Wifi", "Breakfast Included", "Air Conditioning", "Flat TV"],
    },
    {
      id: "rm-2",
      propertyId: "parian-holiday-villas",
      name: "Double Room With Town View",
      description: "Panoramic Manhattan skyline views with private workspace.",
      basePrice: 350,
      bedType: "2 Queen Beds",
      maxOccupancy: 4,
      sizeSquareMeters: 48,
      images: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80"],
      amenities: ["Free Wifi", "City View", "Work Desk", "Espresso Bar"],
    },
    {
      id: "rm-3",
      propertyId: "parian-holiday-villas",
      name: "Room Sheraton Hotel",
      description: "Executive club access with complimentary morning buffet.",
      basePrice: 350,
      bedType: "1 Super King Bed",
      maxOccupancy: 2,
      sizeSquareMeters: 55,
      images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"],
      amenities: ["Executive Lounge Access", "King Bed", "Rain Shower", "Free Wifi"],
    },
    {
      id: "rm-4",
      propertyId: "parian-holiday-villas",
      name: "Room Kerama Islands",
      description: "Private outdoor terrace overlooking Battery Park.",
      basePrice: 350,
      bedType: "2 Double Beds",
      maxOccupancy: 4,
      sizeSquareMeters: 62,
      images: ["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80"],
      amenities: ["Private Terrace", "Park View", "Free Minibar", "Free Wifi"],
    },
  ],
};

const DEFAULT_FIGURE_6_1_RELATED_HOTELS: Property[] = [
  {
    id: "rel-stanford",
    name: "Hotel Stanford",
    code: "STANFORD-01",
    starRating: 5,
    lowestPrice: 300,
    address: "New York, USA",
    city: "New York",
    country: "USA",
    propertyType: "Hotels",
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"],
    amenities: ["Wifi", "Breakfast", "Gym"],
    rooms: [],
  },
  {
    id: "rel-wbf",
    name: "Hotel WBF Hommachi",
    code: "WBF-01",
    starRating: 5,
    lowestPrice: 350,
    address: "Osaka, Japan",
    city: "Osaka",
    country: "Japan",
    propertyType: "Hotels",
    images: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80"],
    amenities: ["Wifi", "Spa", "Restaurant"],
    rooms: [],
  },
  {
    id: "rel-casole",
    name: "Castello Casole Hotel",
    code: "CASOLE-01",
    starRating: 5,
    lowestPrice: 350,
    address: "Tuscany, Italy",
    city: "Tuscany",
    country: "Italy",
    propertyType: "Hotels",
    images: ["https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80"],
    amenities: ["Wifi", "Pool", "Vineyard Tour"],
    rooms: [],
  },
  {
    id: "rel-redac",
    name: "Redac Gateway Hotel",
    code: "REDAC-01",
    starRating: 5,
    lowestPrice: 500,
    address: "Torrance, California",
    city: "California",
    country: "USA",
    propertyType: "Hotels",
    images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"],
    amenities: ["Wifi", "Airport Shuttle", "Pool"],
    rooms: [],
  },
];

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [property, setProperty] = useState<Property | null>(null);
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [activeBookingTab, setActiveBookingTab] = useState<"book" | "enquiry">("book");
  const [checkInDate, setCheckInDate] = useState("2026-10-12");
  const [checkOutDate, setCheckOutDate] = useState("2026-10-14");
  const [guestsCount, setGuestsCount] = useState(2);
  const [addedRoomId, setAddedRoomId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const { formatPrice } = useCurrencyStore();

  // Guest Reviews
  const [reviews, setReviews] = useState([
    {
      id: "rev-1",
      author: "Robert Sterling",
      avatar: "R",
      date: "September 2026",
      rating: 5,
      comment: "Exceptional sanctuary in New York! The tufted master bedroom suite and private concierge service exceeded our expectations. Contactless self check-in took 30 seconds.",
      verified: true,
    },
    {
      id: "rev-2",
      author: "Jessica Vance",
      avatar: "J",
      date: "August 2026",
      rating: 5,
      comment: "Top notch comfort and breathtaking views. Parian Holiday Villas offers seamless airport executive transfer and unmatched room acoustics.",
      verified: true,
    },
    {
      id: "rev-3",
      author: "David Chen",
      avatar: "D",
      date: "July 2026",
      rating: 5,
      comment: "The executive loft suite was spacious and impeccably maintained. The high-speed internet and quiet work desk were ideal for remote meetings.",
      verified: true,
    },
    {
      id: "rev-4",
      author: "Sophie Dupont",
      avatar: "S",
      date: "June 2026",
      rating: 5,
      comment: "Everything shown in the photos matches reality 100%. Five-star staff attentiveness and delicious artisan morning coffee.",
      verified: true,
    },
  ]);

  const [newAuthor, setNewAuthor] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Fetch property directly from PostgreSQL database via API
      const prop = await PropertiesService.getById(id);
      const allProps = await PropertiesService.getAll();
      const effectiveProp = prop || DEFAULT_FIGURE_6_1_PROPERTY;
      setProperty(effectiveProp);

      // Filter related properties from Figure 6.1 (Hotel Stanford, Hotel WBF Hommachi, Castello Casole Hotel, Redac Gateway Hotel)
      const exactRelatedCodes = ["STANFORD-01", "WBF-01", "CASOLE-01", "REDAC-01"];
      const filteredRelated = allProps.filter(
        (p) => p.id !== effectiveProp?.id && (exactRelatedCodes.includes(p.code || "") || exactRelatedCodes.some(code => p.slug?.includes(code.toLowerCase())))
      );

      if (filteredRelated.length >= 4) {
        setRelatedProperties(filteredRelated.slice(0, 4));
      } else {
        setRelatedProperties(DEFAULT_FIGURE_6_1_RELATED_HOTELS);
      }

      if (effectiveProp?.rooms && effectiveProp.rooms.length > 0) {
        setRooms(effectiveProp.rooms);
      } else {
        const roomList = await PropertiesService.getRooms(effectiveProp.id);
        setRooms(roomList && roomList.length > 0 ? roomList : (DEFAULT_FIGURE_6_1_PROPERTY.rooms || []));
      }

      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-4 border-[#2577e3] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Fetching real sanctuary specifications from backend database...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Property Not Found</h2>
        <p className="text-slate-500 text-sm mt-2">The requested hotel property does not exist in the database.</p>
        <Link href="/stays" className="mt-4 inline-block">
          <Button size="md">Browse Available Hotels</Button>
        </Link>
      </div>
    );
  }

  // Exact 6 photos matching Figure 6.1 (Page 31)
  const galleryImages = (property.images && property.images.length >= 6)
    ? property.images.slice(0, 6)
    : [
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80",
      ];

  const currentMainPhoto = galleryImages[activePhotoIndex] || galleryImages[0];

  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handleBookRoom = (room: RoomType) => {
    addItem({
      verticalType: "stay",
      resourceId: room.id,
      title: `${property.name} - ${room.name}`,
      subtitle: `${room.bedType} • Max ${room.maxOccupancy} Guests`,
      imageUrl: room.images[0] || galleryImages[0],
      pricePerUnit: room.basePrice,
      quantity: 2, // 2 nights
      unitLabel: "night",
      startDate: checkInDate,
      endDate: checkOutDate,
      meta: {
        propertyId: property.id,
        propertyName: property.name,
        roomTypeId: room.id,
        roomTypeName: room.name,
      },
    });

    setAddedRoomId(room.id);
    setTimeout(() => {
      setAddedRoomId(null);
      router.push("/cart");
    }, 600);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* 1. Top Cover Banner matching Figure 6.1 (Page 31) with [🎥 Hotel Video] Button */}
      <div className="relative h-32 sm:h-44 w-full bg-slate-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2000&q=80"
          alt="Hotel Header Cover"
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30" />

        {/* Floating [🎥 Hotel Video] Button (Top Right in Figure 6.1) */}
        <div className="absolute top-4 right-4 sm:right-8 z-10">
          <button
            type="button"
            onClick={() => setShowVideoModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white text-xs font-bold shadow-md transition-colors cursor-pointer border border-white/20"
          >
            <Video className="w-3.5 h-3.5 text-white" />
            <span>Hotel Video</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
          {/* 2. Top Header Section matching Figure 6.1 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            {/* Left: Star rating, Title, Address */}
            <div>
              <div className="flex items-center gap-1 text-amber-500 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {property.name}
              </h1>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-600">
                  {property.address}
                </span>
              </div>
            </div>

            {/* Right: Rating Box & Customer 01 Member Card from Figure 6.1 */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Rating Box from Figure 6.1 */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 block leading-tight">
                    Excellent
                  </span>
                  <span className="text-[10px] text-slate-400 block">from 4 reviews</span>
                  <span className="text-[10px] text-emerald-600 font-bold block">100% of guests recommend</span>
                </div>
                <div className="w-10 h-10 rounded-md bg-[#2577e3] text-white flex flex-col items-center justify-center font-black text-xs leading-none shadow-sm">
                  <span className="text-xs font-bold">4.8</span>
                  <span className="text-[8px] font-normal text-white/80">/5</span>
                </div>
              </div>

              {/* Customer 01 Member Card from Figure 6.1 */}
              <div className="flex items-center gap-2.5 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900">Customer 01</span>
                    <span className="w-3 h-3 rounded-full bg-[#2577e3] text-white flex items-center justify-center text-[8px] font-black">
                      ✓
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 block">Member Since Dec 2025</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Main Two-Column Layout (Figure 6.1) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
            {/* Left Column (68% width): Large Photo, 6 Thumbnails, Description, Rooms */}
            <div className="lg:col-span-8 space-y-6">
              {/* Large Main Bedroom Photo */}
              <div className="relative rounded-xl overflow-hidden bg-slate-100 h-[340px] sm:h-[440px] group border border-slate-200">
                <img
                  src={currentMainPhoto}
                  alt={property.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-101"
                />

                {/* Top Right Floating Share & Favorite Buttons (Figure 6.1) */}
                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText?.(window.location.href);
                      alert("Link copied to clipboard!");
                    }}
                    className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
                    title="Share"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors cursor-pointer shadow-md ${
                      isFavorite ? "bg-red-500 text-white" : "bg-black/60 hover:bg-black/80 text-white"
                    }`}
                    title="Favorite"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-current" : ""}`} />
                  </button>
                </div>

                {/* Next Arrow on Right Center (Figure 6.1) */}
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-all cursor-pointer shadow-md z-10"
                  title="Next Photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Expand Icon on Bottom Right (Figure 6.1) */}
                <button
                  type="button"
                  onClick={() => window.open(currentMainPhoto, "_blank")}
                  className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center transition-colors cursor-pointer shadow-md z-10"
                  title="Expand"
                >
                  <Maximize className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Row of Exactly 6 Square Thumbnails (Figure 6.1) */}
              <div className="grid grid-cols-6 gap-2">
                {galleryImages.map((img, idx) => {
                  const isActive = idx === activePhotoIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`relative aspect-square rounded-md overflow-hidden cursor-pointer transition-all ${
                        isActive
                          ? "ring-2 ring-[#2577e3] opacity-100"
                          : "opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>

              {/* Description Section from Figure 4.2 & Figure 6.1 */}
              <div className="pt-2">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Description
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {property.description ||
                    `Built in 1986, ${property.name} is a distinct addition to New York (NY) and a smart choice for travelers. The excitement of the city center is only 0 KM away. No less exceptional is the hotel's easy access to the city's myriad attractions and landmarks, such as Toto Music Studio, British Virgin Islands Tourist Board, L'Atelier Du Chocolat. Start and end in San Francisco! With the In-depth cultural tour Northern California Summer 2019, you have an 8 day tour package taking you through San Francisco, USA and 9 other destinations in USA. Northern California Summer 2019 includes accommodation as well as an expert guide, meals, transport and more.`}
                </p>
              </div>

              {/* HIGHLIGHTS Section Matching Figure 4.2 in PDF */}
              <div className="pt-1">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  HIGHLIGHTS
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600 font-normal pl-4 list-disc marker:text-slate-400">
                  <li>Visit the Museum of Modern Art in Manhattan</li>
                  <li>See amazing works of contemporary art, including Vincent van Gogh's The Starry Night</li>
                  <li>Check out Campbell's Soup Cans by Warhol and The Dance (I) by Matisse</li>
                  <li>Behold masterpieces by Gauguin, Dali, Picasso, and Pollock</li>
                  <li>Enjoy free audio guides available in English, French, German, Italian, Spanish, Portuguese</li>
                </ul>
              </div>

              {/* Room Selection & Rate Plan Checkout Architecture (Figure 4.2) */}
              <div className="pt-5 border-t border-slate-150">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mb-3">
                  Available Rooms
                </h2>

                {/* Available Rooms Tabs: BOOK / ENQUIRY (Figure 4.2) */}
                <div className="flex items-center gap-6 border-b border-slate-200 mb-4 text-xs font-bold uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => setActiveBookingTab("book")}
                    className={`pb-2.5 transition-all cursor-pointer relative ${
                      activeBookingTab === "book"
                        ? "text-[#2577e3] border-b-2 border-[#2577e3]"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    BOOK
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveBookingTab("enquiry")}
                    className={`pb-2.5 transition-all cursor-pointer relative ${
                      activeBookingTab === "enquiry"
                        ? "text-[#2577e3] border-b-2 border-[#2577e3]"
                        : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    ENQUIRY
                  </button>
                </div>

                {/* Check Availability Bar Matching Figure 4.2 in PDF */}
                <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 mb-5 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Check In - Out</label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Check-out</label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Guests</label>
                    <select
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs font-bold text-slate-800"
                    >
                      <option value={1}>1 Adult - 0 Child</option>
                      <option value={2}>2 Adults - 0 Child</option>
                      <option value={3}>2 Adults - 1 Child</option>
                      <option value={4}>2 Adults - 2 Children</option>
                    </select>
                  </div>
                  <div className="pt-3 sm:pt-0">
                    <Button className="w-full py-2 font-black text-xs uppercase bg-[#2577e3] hover:bg-[#1d62c2] text-white">
                      CHECK AVAILABILITY
                    </Button>
                  </div>
                </div>

                {/* Room Matrix Table / Cards */}
                <div className="space-y-3.5">
                  {rooms.map((room) => {
                    const isSelected = addedRoomId === room.id;
                    return (
                      <div
                        key={room.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#2577e3] transition-all shadow-xs flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                      >
                        <div className="flex gap-3.5 items-center">
                          <img
                            src={room.images[0] || galleryImages[0]}
                            alt={room.name}
                            className="w-20 h-20 rounded-lg object-cover shrink-0"
                          />
                          <div>
                            <h3 className="font-extrabold text-sm text-slate-900">{room.name}</h3>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{room.description}</p>
                            <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-[11px] text-slate-600 font-semibold">
                              <span className="flex items-center gap-1">
                                <Bed className="w-3.5 h-3.5 text-slate-400" />
                                {room.bedType}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                Max {room.maxOccupancy} Guests
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                                {room.sizeSquareMeters} m²
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100 gap-1.5 shrink-0">
                          <div className="text-right">
                            <span className="text-lg font-black text-slate-900 block">
                              {formatPrice(room.basePrice)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">per night</span>
                          </div>

                          <Button
                            onClick={() => handleBookRoom(room)}
                            variant={isSelected ? "secondary" : "primary"}
                            size="sm"
                            className="font-extrabold text-xs uppercase px-4 py-1.5 bg-[#2577e3] hover:bg-[#1d62c2]"
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                                <span>Reserved!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                                <span>BOOK NOW</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column (32% width): EXACT RELATED HOTEL, PROPERTY TYPE, FACILITIES & HOTEL SERVICE Matching Figure 6.1 & Figure 4.2 */}
            <aside className="lg:col-span-4 space-y-6">
              {/* RELATED HOTEL Section with Blue Left Border (Figure 6.1 & Figure 4.2) */}
              <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
                <div className="border-l-3 border-[#2577e3] pl-2.5 mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    RELATED HOTEL
                  </h3>
                </div>

                <div className="space-y-4">
                  {relatedProperties.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/stays/${rel.code || rel.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <img
                        src={rel.images[0]}
                        alt={rel.name}
                        className="w-14 h-14 rounded-md object-cover shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex text-amber-500 text-[10px] mb-0.5">
                          {"★".repeat(rel.starRating || 5)}
                        </div>
                        <h4 className="font-bold text-xs text-[#2577e3] hover:underline truncate">
                          {rel.name}
                        </h4>
                        <span className="text-xs text-slate-500 font-medium">
                          from <span className="font-bold text-slate-900">{formatPrice(rel.lowestPrice || 300)}</span> /night
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* PROPERTY TYPE Filter List with Blue Left Border (Figure 6.1 & Figure 4.2) */}
              <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
                <div className="border-l-3 border-[#2577e3] pl-2.5 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    PROPERTY TYPE
                  </h3>
                </div>

                <div className="space-y-2 text-xs text-slate-700 font-medium">
                  {[
                    { name: "Apartments", checked: false },
                    { name: "Hotels", checked: true },
                    { name: "Homestays", checked: false },
                    { name: "Boats", checked: false },
                    { name: "Motels", checked: false },
                    { name: "Resorts", checked: false },
                    { name: "Lodges", checked: false },
                    { name: "Holiday homes", checked: false },
                    { name: "Cruises", checked: false },
                  ].map((pt, i) => (
                    <label key={i} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900">
                      <input
                        type="checkbox"
                        className="rounded text-[#2577e3] focus:ring-[#2577e3] w-4 h-4 cursor-pointer"
                        defaultChecked={pt.checked}
                      />
                      <span>{pt.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* FACILITIES List with Outline Icons Matching Figure 4.2 in PDF */}
              <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
                <div className="border-l-3 border-[#2577e3] pl-2.5 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    FACILITIES
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Wake-up call</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Car className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Car hire</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Bicycle hire</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Tv className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Flat Tv</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Laundry and dry cleaning</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Wifi className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Internet – Wifi</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Coffee className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Coffee and tea</span>
                  </div>
                </div>
              </div>

              {/* HOTEL SERVICE Section with Blue Left Border (Figure 4.2) */}
              <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
                <div className="border-l-3 border-[#2577e3] pl-2.5 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    HOTEL SERVICE
                  </h3>
                </div>

                <div className="space-y-2 text-xs text-slate-600 font-medium">
                  <p>• 24/7 Multilingual Front Desk</p>
                  <p>• Autonomous Digital Self Check-in</p>
                  <p>• Concierge Luggage Storage</p>
                  <p>• Express Laundry & Dry Cleaning</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Video Modal if opened */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl overflow-hidden max-w-2xl w-full p-4 relative">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-3 right-3 text-white/80 hover:text-white font-bold text-lg cursor-pointer"
            >
              ✕
            </button>
            <h4 className="text-white font-bold text-sm mb-3">Parian Holiday Villas - Virtual Tour</h4>
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Hotel Virtual Tour"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
