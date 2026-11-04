import apiClient from "@/lib/api-client";

export interface Property {
  id: string;
  name: string;
  slug?: string;
  code?: string;
  description?: string;
  propertyType: string;
  starRating?: number;
  address: string;
  city: string;
  country: string;
  images: string[];
  amenities: string[];
  lowestPrice?: number;
  featured?: boolean;
  status?: string;
  rooms?: RoomType[];
}

export interface RoomType {
  id: string;
  propertyId: string;
  name: string;
  slug?: string;
  description?: string;
  basePrice: number;
  maxOccupancy: number;
  bedType: string;
  sizeSquareMeters?: number;
  images: string[];
  amenities: string[];
  availableCount?: number;
}

export const PropertiesService = {
  /**
   * Fetches real properties from backend API (/api/v1/properties)
   */
  async getAll(params?: { city?: string; search?: string }): Promise<Property[]> {
    try {
      const response = await apiClient.get<any[]>("/properties", { params });
      const rawData = Array.isArray(response.data) ? response.data : [];

      return rawData.map((p) => {
        const photos = (p.photos && p.photos.length > 0)
          ? p.photos.map((ph: any) => ph.url)
          : ["https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80"];

        const description = p.translations?.[0]?.description || p.name;
        const lowestRoomPrice = p.roomTypes?.length > 0
          ? Math.min(...p.roomTypes.map((r: any) => Number(r.basePrice || 0)).filter((price: number) => price > 0))
          : 12000;

        // Smart parse address or location
        let city = "New York";
        let country = "United States";
        if (p.address) {
          const parts = p.address.split(",").map((s: string) => s.trim());
          if (parts.length >= 3) {
            city = parts[parts.length - 2];
            country = parts[parts.length - 1];
          } else if (parts.length === 2) {
            city = parts[0];
            country = parts[1];
          } else {
            city = p.address;
            country = "United States";
          }
        }

        const facilities = p.facilities?.map((f: any) => f.facility?.icon || f.facility?.name) || [
          "wifi", "pool", "spa", "restaurant", "beach"
        ];

        return {
          id: p.id,
          name: p.name,
          slug: p.code?.toLowerCase() || p.id,
          code: p.code,
          description,
          propertyType: p.propertyType || "Hotels",
          starRating: p.starRating || 5,
          address: p.address || "Regal Cinemas Battery Park",
          city,
          country,
          images: photos,
          amenities: facilities,
          lowestPrice: lowestRoomPrice,
          featured: true,
          status: p.status || "active",
          rooms: p.roomTypes?.map((rt: any) => ({
            id: rt.id,
            propertyId: p.id,
            name: rt.title,
            slug: rt.slug,
            basePrice: Number(rt.basePrice || 12000),
            maxOccupancy: (rt.maxAdults || 2) + (rt.maxChildren || 0),
            bedType: "King Bed",
            sizeSquareMeters: rt.squareMeters || 45,
            images: photos,
            amenities: facilities,
            availableCount: 3,
          })) || [],
        };
      });
    } catch (err) {
      console.error("Failed to fetch real properties from API:", err);
      return [];
    }
  },

  /**
   * Fetches real property details by ID from backend API (/api/v1/properties/:id)
   */
  async getById(id: string): Promise<Property | null> {
    try {
      const response = await apiClient.get<any>(`/properties/${id}`);
      const p = response.data;
      if (!p) return null;

      const photos = (p.photos && p.photos.length > 0)
        ? p.photos.map((ph: any) => ph.url)
        : ["https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80"];

      const description = p.translations?.[0]?.description || p.name;
      const facilities = p.facilities?.map((f: any) => f.facility?.icon || f.facility?.name) || [
        "wifi", "pool", "spa", "restaurant", "beach"
      ];

      let city = "New York";
      let country = "United States";
      if (p.address) {
        const parts = p.address.split(",").map((s: string) => s.trim());
        if (parts.length >= 3) {
          city = parts[parts.length - 2];
          country = parts[parts.length - 1];
        } else if (parts.length === 2) {
          city = parts[0];
          country = parts[1];
        } else {
          city = p.address;
          country = "United States";
        }
      }

      return {
        id: p.id,
        name: p.name,
        slug: p.code?.toLowerCase() || p.id,
        code: p.code,
        description,
        propertyType: p.propertyType || "Hotels",
        starRating: p.starRating || 5,
        address: p.address || "Regal Cinemas Battery Park",
        city,
        country,
        images: photos,
        amenities: facilities,
        lowestPrice: p.roomTypes?.length > 0 ? Number(p.roomTypes[0].basePrice) : 350,
        featured: true,
        status: p.status || "active",
        rooms: p.roomTypes?.map((rt: any) => ({
          id: rt.id,
          propertyId: p.id,
          name: rt.title,
          slug: rt.slug,
          description: `Luxurious ${rt.title} with panoramic landscape views, en-suite bathroom, and premium room service.`,
          basePrice: Number(rt.basePrice || 350),
          maxOccupancy: (rt.maxAdults || 2) + (rt.maxChildren || 0),
          bedType: rt.roomBeds?.[0]?.bedType ? `${rt.roomBeds[0].quantity}x ${rt.roomBeds[0].bedType}` : "1x King Size Bed",
          sizeSquareMeters: rt.squareMeters || 50,
          images: photos,
          amenities: facilities,
          availableCount: rt._count?.rooms || 4,
        })) || [],
      };
    } catch (err) {
      console.error(`Failed to fetch property ${id} from API:`, err);
      return null;
    }
  },

  /**
   * Fetches real room categories from backend API (/api/v1/properties/:id/room-types)
   */
  async getRooms(propertyId: string): Promise<RoomType[]> {
    try {
      const response = await apiClient.get<any[]>(`/properties/${propertyId}/room-types`);
      const rawRooms = Array.isArray(response.data) ? response.data : [];

      return rawRooms.map((rt) => ({
        id: rt.id,
        propertyId,
        name: rt.title,
        slug: rt.slug,
        description: `Luxurious ${rt.title} with high-speed Wi-Fi, air conditioning, and 24/7 dedicated room service.`,
        basePrice: Number(rt.basePrice || 350),
        maxOccupancy: (rt.maxAdults || 2) + (rt.maxChildren || 0),
        bedType: rt.roomBeds?.[0]?.bedType ? `${rt.roomBeds[0].quantity}x ${rt.roomBeds[0].bedType}` : "1 King Bed",
        sizeSquareMeters: rt.squareMeters || 50,
        images: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80"],
        amenities: ["wifi", "ac", "tv", "breakfast", "beach"],
        availableCount: rt._count?.rooms || 3,
      }));
    } catch (err) {
      console.error(`Failed to fetch rooms for property ${propertyId} from API:`, err);
      return [];
    }
  },
};
