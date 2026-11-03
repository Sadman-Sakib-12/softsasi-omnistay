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

export const TravelService = {
  /**
   * Fetches real tours from backend API (/api/v1/tours)
   */
  async getTours(): Promise<TourItem[]> {
    try {
      const res = await apiClient.get<any[]>("/tours");
      const list = Array.isArray(res.data) ? res.data : [];
      return list.map((t) => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        description: t.translations?.[0]?.description || t.title,
        location: t.slug.includes("sundarbans") ? "Sundarbans, Khulna" : "Saint Martin's Island",
        durationHours: t.durationHours || (t.durationDays ? t.durationDays * 24 : 24),
        pricePerPerson: Number(t.basePriceAdult || 15000),
        maxParticipants: t.maxPax || 16,
        images: [
          t.slug.includes("sundarbans")
            ? "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80"
            : "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80"
        ],
        inclusions: t.inclusions?.map((inc: any) => inc.content) || ["English-speaking naturalist guide", "AC cabin aboard vessel", "Buffet meals"],
        itinerary: t.itineraries?.map((it: any) => ({
          title: `Day ${it.dayNumber}: ${it.title}`,
          description: it.description || "",
        })) || [],
      }));
    } catch (err) {
      console.error("Failed to fetch tours from API:", err);
      return [];
    }
  },

  /**
   * Fetches real tour detail by ID from backend API (/api/v1/tours/:id)
   */
  async getTourById(id: string): Promise<TourItem | null> {
    try {
      const res = await apiClient.get<any>(`/tours/${id}`);
      const t = res.data;
      if (!t) return null;

      return {
        id: t.id,
        title: t.title,
        slug: t.slug,
        description: t.translations?.[0]?.description || t.title,
        location: t.slug.includes("sundarbans") ? "Sundarbans, Khulna" : "Saint Martin's Island",
        durationHours: t.durationHours || (t.durationDays ? t.durationDays * 24 : 24),
        pricePerPerson: Number(t.basePriceAdult || 15000),
        maxParticipants: t.maxPax || 16,
        images: [
          t.slug.includes("sundarbans")
            ? "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80"
            : "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80"
        ],
        inclusions: t.inclusions?.map((inc: any) => inc.content) || ["English-speaking naturalist guide", "AC cabin aboard vessel", "Buffet meals"],
        itinerary: t.itineraries?.map((it: any) => ({
          title: `Day ${it.dayNumber}: ${it.title}`,
          description: it.description || "",
        })) || [],
      };
    } catch (err) {
      console.error(`Failed to fetch tour ${id} from API:`, err);
      return null;
    }
  },

  /**
   * Fetches real cars from backend API (/api/v1/cars)
   */
  async getCars(): Promise<CarItem[]> {
    try {
      const res = await apiClient.get<any[]>("/cars");
      const list = Array.isArray(res.data) ? res.data : [];
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
          c.title.includes("Mercedes")
            ? "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80"
            : "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80"
        ],
      }));
    } catch (err) {
      console.error("Failed to fetch cars from API:", err);
      return [];
    }
  },

  /**
   * Fetches single car by ID
   */
  async getCarById(id: string): Promise<CarItem | null> {
    try {
      const res = await apiClient.get<any>(`/cars/${id}`);
      const c = res.data;
      if (!c) return null;
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
          c.title.includes("Mercedes")
            ? "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80"
            : "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80"
        ],
      };
    } catch (err) {
      console.error(`Failed to fetch car ${id}:`, err);
      return null;
    }
  },

  /**
   * Fetches real boats & yachts from backend API (/api/v1/boats)
   */
  async getBoats(): Promise<BoatItem[]> {
    try {
      const res = await apiClient.get<any[]>("/boats");
      const list = Array.isArray(res.data) ? res.data : [];
      return list.map((b) => ({
        id: b.id,
        name: b.title,
        type: b.vesselType || "Luxury Yacht",
        capacity: b.guestCapacity || 18,
        pricePerHour: Math.round(Number(b.dailyPrice || 95000) / 8),
        pricePerDay: Number(b.dailyPrice || 95000),
        location: "Cox's Bazar Marina / Bay of Bengal",
        description: b.translations?.[0]?.description || b.title,
        includesCaptain: b.charterType === "fully_crewed" || true,
        images: [
          "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1000&q=80"
        ],
      }));
    } catch (err) {
      console.error("Failed to fetch boats from API:", err);
      return [];
    }
  },

  /**
   * Fetches single boat by ID
   */
  async getBoatById(id: string): Promise<BoatItem | null> {
    try {
      const res = await apiClient.get<any>(`/boats/${id}`);
      const b = res.data;
      if (!b) return null;
      return {
        id: b.id,
        name: b.title,
        type: b.vesselType || "Luxury Yacht",
        capacity: b.guestCapacity || 18,
        pricePerHour: Math.round(Number(b.dailyPrice || 95000) / 8),
        pricePerDay: Number(b.dailyPrice || 95000),
        location: "Cox's Bazar Marina / Bay of Bengal",
        description: b.translations?.[0]?.description || b.title,
        includesCaptain: b.charterType === "fully_crewed" || true,
        images: [
          "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1000&q=80"
        ],
      };
    } catch (err) {
      console.error(`Failed to fetch boat ${id}:`, err);
      return null;
    }
  },

  /**
   * Fetches real spaces & venues from backend API (/api/v1/spaces)
   */
  async getSpaces(): Promise<SpaceItem[]> {
    try {
      const res = await apiClient.get<any[]>("/spaces");
      const list = Array.isArray(res.data) ? res.data : [];
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
          s.slug.includes("ballroom")
            ? "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80"
            : "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80"
        ],
        amenities: ["wifi", "ac", "parking", "projector", "catering"],
      }));
    } catch (err) {
      console.error("Failed to fetch spaces from API:", err);
      return [];
    }
  },

  /**
   * Fetches single space by ID
   */
  async getSpaceById(id: string): Promise<SpaceItem | null> {
    try {
      const res = await apiClient.get<any>(`/spaces/${id}`);
      const s = res.data;
      if (!s) return null;
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
          s.slug.includes("ballroom")
            ? "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80"
            : "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80"
        ],
        amenities: ["wifi", "ac", "parking", "projector", "catering"],
      };
    } catch (err) {
      console.error(`Failed to fetch space ${id}:`, err);
      return null;
    }
  },
};
