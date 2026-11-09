import apiClient from "@/lib/api-client";

export interface TourItem {
  id: string;
  title: string;
  slug?: string;
  description: string;
  location: string;
  durationHours: number;
  pricePerPerson: number;
  maxParticipants: number;
  images: string[];
  inclusions: string[];
  itinerary: { title: string; description: string; time?: string }[];
}

export interface SpaceItem {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  hourlyRate: number;
  dailyRate: number;
  capacity: number;
  images: string[];
  amenities: string[];
}

export interface CarItem {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  pricePerDay: number;
  withDriver: boolean;
  seats: number;
  transmission: string;
  fuelType: string;
  images: string[];
  location: string;
}

export interface BoatItem {
  id: string;
  name: string;
  type: string;
  capacity: number;
  pricePerHour: number;
  pricePerDay: number;
  images: string[];
  location: string;
  description: string;
  includesCaptain: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  slug?: string;
  eventType: string;
  venueAddress: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  description: string;
  images: string[];
  startingPrice: number;
  ticketTiers: { id?: string; name: string; price: number; totalSeats: number }[];
}

// Canonical Fallbacks for Resilience (e.g. Render Cold Starts)
export const FALLBACK_TOURS: TourItem[] = [
  {
    id: "tour-sundarbans",
    title: "Sundarbans Mangrove Royal Bengal Tiger Expedition",
    slug: "sundarbans-mangrove-safari",
    description: "Deep riverine wilderness cruise through UNESCO heritage Sundarbans mangrove biosphere with expert naturalists and armed forest escorts.",
    location: "Sundarbans, Khulna",
    durationHours: 72,
    pricePerPerson: 18500,
    maxParticipants: 16,
    images: ["https://res.cloudinary.com/drrkr71o0/image/upload/v1794163325/omnistay/travel/travel_guided_tour.jpg"],
    inclusions: [
      "AC cabin cruise ship aboard vessel",
      "Buffet meals and fresh seafood barbecues",
      "Certified naturalist and armed forest escorts",
      "Forest Department permission & permits",
    ],
    itinerary: [
      { title: "Day 1: Mongla Port Embarkation & Kotka Sanctuary Entry", description: "Board the luxury expedition cruiser at Mongla and glide past pristine mangrove channels into Kotka wildlife sanctuary." },
      { title: "Day 2: Jamtoli Watch Tower & Kachikhali Tiger Creek Safari", description: "Dawn silence boat canal exploration to spot deer, estuarine crocodiles, and Royal Bengal Tigers, followed by a jungle canopy walk." },
      { title: "Day 3: Harbaria Eco-Walk & Return Cruise to Khulna", description: "Morning foot trek across Harbaria wooden boardwalk and return journey back to Mongla with sunset river views." },
    ],
  },
  {
    id: "tour-saint-martin",
    title: "Saint Martin Coral Atoll & Chhera Island Sail",
    slug: "saint-martin-coral-atoll",
    description: "Exclusive catamaran sailing expedition across the Bay of Bengal to the crystal waters and coral reefs of Saint Martin and Chhera Dwip.",
    location: "Saint Martin's Island",
    durationHours: 48,
    pricePerPerson: 14500,
    maxParticipants: 20,
    images: ["https://res.cloudinary.com/drrkr71o0/image/upload/v1794163319/omnistay/hero/hero_beach_sanctuary.jpg"],
    inclusions: [
      "Catamaran cruise transfer across Bay of Bengal",
      "Beachfront boutique resort stay",
      "Snorkeling gear & reef instructor",
      "Fresh green coconut & live lobster dinner",
    ],
    itinerary: [
      { title: "Day 1: Teknaf Departure & Saint Martin Island Welcome", description: "Scenic ocean crossing aboard premier cruise vessel, island check-in, and sunset cycling along West Beach." },
      { title: "Day 2: Chhera Dwip Coral Exploration & Return Sail", description: "Traditional wooden speed craft to uninhabited coral islet of Chhera Dwip for snorkeling amidst living marine corals." },
    ],
  },
  {
    id: "tour-sreemangal",
    title: "Sreemangal Rainforest & Tea Highlands Safari",
    slug: "sreemangal-rainforest-tea-highlands",
    description: "Trek through Lawachara National Park rain forest, spot endangered Hoolock Gibbons, and experience artisanal tea estate tastings.",
    location: "Sreemangal, Sylhet",
    durationHours: 48,
    pricePerPerson: 12000,
    maxParticipants: 12,
    images: ["https://res.cloudinary.com/drrkr71o0/image/upload/v1794163328/omnistay/travel/travel_grand_ballroom.jpg"],
    inclusions: [
      "Private 4x4 safari jeep with guide",
      "Colonial tea bungalow heritage stay",
      "Lawachara National Park wildlife permit",
      "Traditional seven-layer tea ceremony",
    ],
    itinerary: [
      { title: "Day 1: Lawachara Canopy Trek & Khasia Tribal Village", description: "Trek through towering rain trees to spot rare bird species and learn centuries-old betel leaf farming traditions." },
      { title: "Day 2: Madhabpur Lake Lotus Sanctuary & Tea Tasting", description: "Early morning reflection hike along Madhabpur lotus lake and private masterclass on white tea craftsmanship." },
    ],
  },
];

export const FALLBACK_CARS: CarItem[] = [
  {
    id: "car-s580",
    make: "Mercedes-Benz",
    model: "S-Class S580 Executive",
    year: 2024,
    category: "Luxury",
    pricePerDay: 32000,
    withDriver: true,
    seats: 4,
    transmission: "Automatic",
    fuelType: "Hybrid",
    location: "Dhaka Airport / Gulshan & Banani",
    images: ["https://res.cloudinary.com/drrkr71o0/image/upload/v1794163326/omnistay/travel/travel_luxury_car.jpg"],
  },
  {
    id: "car-lc300",
    make: "Toyota",
    model: "Land Cruiser 300 VXR VIP",
    year: 2024,
    category: "Luxury SUV",
    pricePerDay: 28000,
    withDriver: true,
    seats: 6,
    transmission: "Automatic",
    fuelType: "Diesel",
    location: "Dhaka Diplomatic Zone & Cox's Bazar",
    images: ["https://res.cloudinary.com/drrkr71o0/image/upload/v1794163327/omnistay/travel/travel_suv_fleet.jpg"],
  },
  {
    id: "car-740li",
    make: "BMW",
    model: "7 Series 740Li Individual",
    year: 2024,
    category: "Executive Sedan",
    pricePerDay: 29500,
    withDriver: true,
    seats: 4,
    transmission: "Automatic",
    fuelType: "Petrol",
    location: "Dhaka City & Airport Transfers",
    images: ["https://res.cloudinary.com/drrkr71o0/image/upload/v1794163326/omnistay/travel/travel_luxury_car.jpg"],
  },
];

export const FALLBACK_BOATS: BoatItem[] = [
  {
    id: "boat-azimut",
    name: "Azimut Grande 27M Superyacht",
    type: "Superyacht",
    capacity: 14,
    pricePerHour: 23125,
    pricePerDay: 185000,
    location: "Cox's Bazar Marina / Bay of Bengal",
    description: "Breathtaking Italian luxury yacht with full crew, five-star private chef, expansive flybridge, jacuzzi, and water sports tender.",
    includesCaptain: true,
    images: ["https://res.cloudinary.com/drrkr71o0/image/upload/v1794163327/omnistay/travel/travel_superyacht.jpg"],
  },
  {
    id: "boat-sunseeker",
    name: "Sunseeker Manhattan 68 Flybridge",
    type: "Motor Yacht",
    capacity: 12,
    pricePerHour: 15625,
    pricePerDay: 125000,
    location: "Saint Martin Channel / Bay of Bengal",
    description: "Effortless offshore entertaining with panoramic sea views, state-of-the-art stabilizers, and dedicated captain.",
    includesCaptain: true,
    images: ["https://res.cloudinary.com/drrkr71o0/image/upload/v1794163327/omnistay/travel/travel_superyacht.jpg"],
  },
];

export const FALLBACK_SPACES: SpaceItem[] = [
  {
    id: "space-ballroom",
    name: "The Imperial Grand Ballroom",
    type: "ballroom",
    description: "Pillarless crystal-chandelier banquet hall featuring Meyer Sound acoustics, intelligent theatrical lighting, and dedicated banquet kitchen.",
    location: "Gulshan Avenue, Dhaka",
    hourlyRate: 25000,
    dailyRate: 220000,
    capacity: 650,
    images: ["https://res.cloudinary.com/drrkr71o0/image/upload/v1794163328/omnistay/travel/travel_grand_ballroom.jpg"],
    amenities: ["wifi", "ac", "parking", "projector", "catering", "stage", "sound-system"],
  },
  {
    id: "space-boardroom",
    name: "Apex Sovereign Executive Boardroom",
    type: "conference",
    description: "High-security boardroom with 4K video telepresence, encrypted Cisco conferencing, motorized privacy shades, and executive catering pantry.",
    location: "Banani Corporate Strip, Dhaka",
    hourlyRate: 12000,
    dailyRate: 85000,
    capacity: 36,
    images: ["https://res.cloudinary.com/drrkr71o0/image/upload/v1794163329/omnistay/travel/travel_executive_boardroom.jpg"],
    amenities: ["wifi", "ac", "parking", "projector", "telepresence", "executive-pantry"],
  },
];

export const FALLBACK_EVENTS: EventItem[] = [
  {
    id: "event-summit-2026",
    title: "Global Hospitality & Tech Innovation Summit 2026",
    slug: "hospitality-tech-innovation-summit-2026",
    eventType: "Conference",
    venueAddress: "Grand Palace Convention Center, Gulshan Avenue, Dhaka",
    startDate: "2026-11-25T09:00:00Z",
    endDate: "2026-11-26T18:00:00Z",
    maxCapacity: 500,
    description: "The flagship conference uniting global travel leaders, hotel executives, IoT pioneers, and fintech visionaries for executive keynotes, panel sessions, and private networking.",
    images: ["https://res.cloudinary.com/drrkr71o0/image/upload/v1794163328/omnistay/travel/travel_grand_ballroom.jpg"],
    startingPrice: 5000,
    ticketTiers: [
      { id: "tier-std", name: "Standard Delegate Pass", price: 5000, totalSeats: 350 },
      { id: "tier-vip", name: "VIP Executive All-Access Pass", price: 15000, totalSeats: 150 },
    ],
  },
  {
    id: "event-royal-gala",
    title: "Royal Gala & Culinary Symphony Night",
    slug: "royal-gala-culinary-symphony",
    eventType: "Gala",
    venueAddress: "The Imperial Grand Ballroom, Dhaka",
    startDate: "2026-12-05T19:00:00Z",
    endDate: "2026-12-05T23:30:00Z",
    maxCapacity: 250,
    description: "A 7-course Michelin-starred chef banquet with live chamber orchestra, vintage pairings, and charity auction amidst opulent crystal chandeliers.",
    images: ["https://res.cloudinary.com/drrkr71o0/image/upload/v1794163329/omnistay/travel/travel_executive_boardroom.jpg"],
    startingPrice: 12000,
    ticketTiers: [
      { id: "tier-gold", name: "Gold Table Seat", price: 12000, totalSeats: 180 },
      { id: "tier-plat", name: "Platinum Royal Table", price: 25000, totalSeats: 70 },
    ],
  },
];

export const TravelService = {
  /**
   * Fetches tours from backend API (/api/v1/tours)
   */
  async getTours(): Promise<TourItem[]> {
    try {
      const res = await apiClient.get<any[]>("/tours");
      const list = Array.isArray(res.data) ? res.data : [];
      if (list.length === 0) return FALLBACK_TOURS;

      return list.map((t) => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        description: t.translations?.[0]?.description || t.title,
        location: t.slug?.includes("sundarbans")
          ? "Sundarbans, Khulna"
          : t.slug?.includes("sreemangal")
            ? "Sreemangal, Sylhet"
            : "Saint Martin's Island",
        durationHours: t.durationHours || (t.durationDays ? t.durationDays * 24 : 24),
        pricePerPerson: Number(t.basePriceAdult || 15000),
        maxParticipants: t.maxPax || 16,
        images: [
          t.slug?.includes("sundarbans")
            ? "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163325/omnistay/travel/travel_guided_tour.jpg"
            : t.slug?.includes("sreemangal")
              ? "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163328/omnistay/travel/travel_grand_ballroom.jpg"
              : "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163319/omnistay/hero/hero_beach_sanctuary.jpg",
        ],
        inclusions: t.inclusions?.map((inc: any) => inc.content) || [
          "English-speaking naturalist guide",
          "AC cabin aboard vessel",
          "Buffet meals",
        ],
        itinerary: t.itineraries?.map((it: any) => ({
          title: `Day ${it.dayNumber}: ${it.title}`,
          description: it.description || "",
        })) || [],
      }));
    } catch (err) {
      console.warn("Failed to fetch tours from API, using fallback data:", err);
      return FALLBACK_TOURS;
    }
  },

  /**
   * Fetches tour detail by ID (/api/v1/tours/:id)
   */
  async getTourById(id: string): Promise<TourItem | null> {
    try {
      const res = await apiClient.get<any>(`/tours/${id}`);
      const t = res.data;
      if (!t) {
        return FALLBACK_TOURS.find((item) => item.id === id || item.slug === id) || FALLBACK_TOURS[0];
      }

      return {
        id: t.id,
        title: t.title,
        slug: t.slug,
        description: t.translations?.[0]?.description || t.title,
        location: t.slug?.includes("sundarbans")
          ? "Sundarbans, Khulna"
          : t.slug?.includes("sreemangal")
            ? "Sreemangal, Sylhet"
            : "Saint Martin's Island",
        durationHours: t.durationHours || (t.durationDays ? t.durationDays * 24 : 24),
        pricePerPerson: Number(t.basePriceAdult || 15000),
        maxParticipants: t.maxPax || 16,
        images: [
          t.slug?.includes("sundarbans")
            ? "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163325/omnistay/travel/travel_guided_tour.jpg"
            : "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163319/omnistay/hero/hero_beach_sanctuary.jpg",
        ],
        inclusions: t.inclusions?.map((inc: any) => inc.content) || [
          "English-speaking naturalist guide",
          "AC cabin aboard vessel",
          "Buffet meals",
        ],
        itinerary: t.itineraries?.map((it: any) => ({
          title: `Day ${it.dayNumber}: ${it.title}`,
          description: it.description || "",
        })) || [],
      };
    } catch (err) {
      console.warn(`Failed to fetch tour ${id}, using fallback:`, err);
      return FALLBACK_TOURS.find((item) => item.id === id || item.slug === id) || FALLBACK_TOURS[0];
    }
  },

  /**
   * Fetches cars from backend API (/api/v1/cars)
   */
  async getCars(): Promise<CarItem[]> {
    try {
      const res = await apiClient.get<any[]>("/cars");
      const list = Array.isArray(res.data) ? res.data : [];
      if (list.length === 0) return FALLBACK_CARS;

      return list.map((c) => ({
        id: c.id,
        make: c.title.split(" ")[0] || "Luxury",
        model: c.title.split(" ").slice(1).join(" ") || "Sedan",
        year: 2024,
        category: c.category || "Luxury",
        pricePerDay: Number(c.dailyPrice || 25000),
        withDriver: true,
        seats: c.passengerSeats || 4,
        transmission: c.transmission || "Automatic",
        fuelType: c.fuelType || "Hybrid",
        location: "Dhaka Airport / City & Cox's Bazar",
        images: [
          c.title?.includes("Mercedes")
            ? "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163326/omnistay/travel/travel_luxury_car.jpg"
            : c.title?.includes("Toyota") || c.title?.includes("Land Cruiser")
              ? "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163327/omnistay/travel/travel_suv_fleet.jpg"
              : "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163326/omnistay/travel/travel_luxury_car.jpg",
        ],
      }));
    } catch (err) {
      console.warn("Failed to fetch cars from API, using fallback data:", err);
      return FALLBACK_CARS;
    }
  },

  /**
   * Fetches single car by ID (/api/v1/cars/:id)
   */
  async getCarById(id: string): Promise<CarItem | null> {
    try {
      const res = await apiClient.get<any>(`/cars/${id}`);
      const c = res.data;
      if (!c) {
        return FALLBACK_CARS.find((item) => item.id === id) || FALLBACK_CARS[0];
      }
      return {
        id: c.id,
        make: c.title.split(" ")[0] || "Luxury",
        model: c.title.split(" ").slice(1).join(" ") || "Sedan",
        year: 2024,
        category: c.category || "Luxury",
        pricePerDay: Number(c.dailyPrice || 25000),
        withDriver: true,
        seats: c.passengerSeats || 4,
        transmission: c.transmission || "Automatic",
        fuelType: c.fuelType || "Hybrid",
        location: "Dhaka Airport / City & Cox's Bazar",
        images: [
          c.title?.includes("Mercedes")
            ? "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163326/omnistay/travel/travel_luxury_car.jpg"
            : "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163327/omnistay/travel/travel_suv_fleet.jpg",
        ],
      };
    } catch (err) {
      console.warn(`Failed to fetch car ${id}, using fallback:`, err);
      return FALLBACK_CARS.find((item) => item.id === id) || FALLBACK_CARS[0];
    }
  },

  /**
   * Fetches boats & yachts from backend API (/api/v1/boats)
   */
  async getBoats(): Promise<BoatItem[]> {
    try {
      const res = await apiClient.get<any[]>("/boats");
      const list = Array.isArray(res.data) ? res.data : [];
      if (list.length === 0) return FALLBACK_BOATS;

      return list.map((b) => ({
        id: b.id,
        name: b.title,
        type: b.vesselType || "Luxury Yacht",
        capacity: b.guestCapacity || 14,
        pricePerHour: Math.round(Number(b.dailyPrice || 95000) / 8),
        pricePerDay: Number(b.dailyPrice || 95000),
        location: "Cox's Bazar Marina / Bay of Bengal",
        description: b.translations?.[0]?.description || b.title,
        includesCaptain: b.charterType === "fully_crewed" || true,
        images: [
          "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163327/omnistay/travel/travel_superyacht.jpg",
        ],
      }));
    } catch (err) {
      console.warn("Failed to fetch boats from API, using fallback data:", err);
      return FALLBACK_BOATS;
    }
  },

  /**
   * Fetches single boat by ID
   */
  async getBoatById(id: string): Promise<BoatItem | null> {
    try {
      const res = await apiClient.get<any>(`/boats/${id}`);
      const b = res.data;
      if (!b) {
        return FALLBACK_BOATS.find((item) => item.id === id) || FALLBACK_BOATS[0];
      }
      return {
        id: b.id,
        name: b.title,
        type: b.vesselType || "Luxury Yacht",
        capacity: b.guestCapacity || 14,
        pricePerHour: Math.round(Number(b.dailyPrice || 95000) / 8),
        pricePerDay: Number(b.dailyPrice || 95000),
        location: "Cox's Bazar Marina / Bay of Bengal",
        description: b.translations?.[0]?.description || b.title,
        includesCaptain: b.charterType === "fully_crewed" || true,
        images: [
          "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163327/omnistay/travel/travel_superyacht.jpg",
        ],
      };
    } catch (err) {
      console.warn(`Failed to fetch boat ${id}, using fallback:`, err);
      return FALLBACK_BOATS.find((item) => item.id === id) || FALLBACK_BOATS[0];
    }
  },

  /**
   * Fetches spaces & venues from backend API (/api/v1/spaces)
   */
  async getSpaces(): Promise<SpaceItem[]> {
    try {
      const res = await apiClient.get<any[]>("/spaces");
      const list = Array.isArray(res.data) ? res.data : [];
      if (list.length === 0) return FALLBACK_SPACES;

      return list.map((s) => ({
        id: s.id,
        name: s.title,
        type: s.venueType || "banquet",
        description: s.translations?.[0]?.description || s.title,
        location: "Gulshan & Banani, Dhaka",
        hourlyRate: Number(s.hourlyPrice || 15000),
        dailyRate: Number(s.dailyPrice || 120000),
        capacity: s.capacityPax || 100,
        images: [
          s.slug?.includes("ballroom")
            ? "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163328/omnistay/travel/travel_grand_ballroom.jpg"
            : "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163329/omnistay/travel/travel_executive_boardroom.jpg",
        ],
        amenities: ["wifi", "ac", "parking", "projector", "catering"],
      }));
    } catch (err) {
      console.warn("Failed to fetch spaces from API, using fallback data:", err);
      return FALLBACK_SPACES;
    }
  },

  /**
   * Fetches single space by ID
   */
  async getSpaceById(id: string): Promise<SpaceItem | null> {
    try {
      const res = await apiClient.get<any>(`/spaces/${id}`);
      const s = res.data;
      if (!s) {
        return FALLBACK_SPACES.find((item) => item.id === id) || FALLBACK_SPACES[0];
      }
      return {
        id: s.id,
        name: s.title,
        type: s.venueType || "banquet",
        description: s.translations?.[0]?.description || s.title,
        location: "Gulshan & Banani, Dhaka",
        hourlyRate: Number(s.hourlyPrice || 15000),
        dailyRate: Number(s.dailyPrice || 120000),
        capacity: s.capacityPax || 100,
        images: [
          s.slug?.includes("ballroom")
            ? "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163328/omnistay/travel/travel_grand_ballroom.jpg"
            : "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163329/omnistay/travel/travel_executive_boardroom.jpg",
        ],
        amenities: ["wifi", "ac", "parking", "projector", "catering"],
      };
    } catch (err) {
      console.warn(`Failed to fetch space ${id}, using fallback:`, err);
      return FALLBACK_SPACES.find((item) => item.id === id) || FALLBACK_SPACES[0];
    }
  },

  /**
   * Fetches events, conferences, and galas from backend API (/api/v1/events)
   */
  async getEvents(): Promise<EventItem[]> {
    try {
      const res = await apiClient.get<any[]>("/events");
      const list = Array.isArray(res.data) ? res.data : [];
      if (list.length === 0) return FALLBACK_EVENTS;

      return list.map((e) => {
        const ticketTiers = Array.isArray(e.ticketTiers) && e.ticketTiers.length > 0
          ? e.ticketTiers.map((t: any) => ({
              id: t.id,
              name: t.name,
              price: Number(t.price || 5000),
              totalSeats: t.totalSeats || 100,
            }))
          : [
              { id: "std", name: "Standard Delegate Pass", price: 5000, totalSeats: 300 },
              { id: "vip", name: "VIP Executive All-Access Pass", price: 15000, totalSeats: 100 },
            ];

        const startingPrice = Math.min(...ticketTiers.map((t: any) => t.price));

        return {
          id: e.id,
          title: e.title,
          slug: e.slug,
          eventType: e.eventType || "Conference",
          venueAddress: e.venueAddress || "Grand Palace Convention Center, Dhaka",
          startDate: e.startDate || new Date().toISOString(),
          endDate: e.endDate || new Date().toISOString(),
          maxCapacity: e.maxCapacity || 300,
          description: e.translations?.[0]?.description || e.description || e.title,
          images: [
            e.slug?.includes("gala")
              ? "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163329/omnistay/travel/travel_executive_boardroom.jpg"
              : "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163328/omnistay/travel/travel_grand_ballroom.jpg",
          ],
          startingPrice,
          ticketTiers,
        };
      });
    } catch (err) {
      console.warn("Failed to fetch events from API, using fallback data:", err);
      return FALLBACK_EVENTS;
    }
  },

  /**
   * Fetches single event by ID or slug (/api/v1/events/:id)
   */
  async getEventById(id: string): Promise<EventItem | null> {
    try {
      const res = await apiClient.get<any>(`/events/${id}`);
      const e = res.data;
      if (!e) {
        return FALLBACK_EVENTS.find((item) => item.id === id || item.slug === id) || FALLBACK_EVENTS[0];
      }

      const ticketTiers = Array.isArray(e.ticketTiers) && e.ticketTiers.length > 0
        ? e.ticketTiers.map((t: any) => ({
            id: t.id,
            name: t.name,
            price: Number(t.price || 5000),
            totalSeats: t.totalSeats || 100,
          }))
        : [
            { id: "std", name: "Standard Delegate Pass", price: 5000, totalSeats: 300 },
            { id: "vip", name: "VIP Executive All-Access Pass", price: 15000, totalSeats: 100 },
          ];

      const startingPrice = Math.min(...ticketTiers.map((t: any) => t.price));

      return {
        id: e.id,
        title: e.title,
        slug: e.slug,
        eventType: e.eventType || "Conference",
        venueAddress: e.venueAddress || "Grand Palace Convention Center, Dhaka",
        startDate: e.startDate || new Date().toISOString(),
        endDate: e.endDate || new Date().toISOString(),
        maxCapacity: e.maxCapacity || 300,
        description: e.translations?.[0]?.description || e.description || e.title,
        images: [
          e.slug?.includes("gala")
            ? "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163329/omnistay/travel/travel_executive_boardroom.jpg"
            : "https://res.cloudinary.com/drrkr71o0/image/upload/v1794163328/omnistay/travel/travel_grand_ballroom.jpg",
        ],
        startingPrice,
        ticketTiers,
      };
    } catch (err) {
      console.warn(`Failed to fetch event ${id}, using fallback:`, err);
      return FALLBACK_EVENTS.find((item) => item.id === id || item.slug === id) || FALLBACK_EVENTS[0];
    }
  },
};
