const DEFAULT_REMOTE_URL = "https://omnistay-backend.onrender.com";

export const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? DEFAULT_REMOTE_URL : "http://localhost:4000");

export const VERTICALS = [
  { id: "stays", label: "Hotels & Stays", icon: "🏨", path: "/stays" },
  { id: "tours", label: "Tours", icon: "🗺️", path: "/tours" },
  { id: "cars", label: "Car Rental", icon: "🚗", path: "/cars" },
  { id: "boats", label: "Boats & Yachts", icon: "⛵", path: "/boats" },
  { id: "spaces", label: "Spaces", icon: "🏢", path: "/spaces" },
  { id: "events", label: "Events", icon: "🎪", path: "/events" },
  { id: "flights", label: "Flights", icon: "✈️", path: "/flights" },
] as const;

export type VerticalId = (typeof VERTICALS)[number]["id"];

export const CURRENCIES = [
  { code: "BDT", symbol: "৳", label: "Bangladeshi Taka" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham" },
  { code: "SGD", symbol: "S$", label: "Singapore Dollar" },
] as const;

export const AMENITY_ICONS: Record<string, string> = {
  wifi: "📶",
  pool: "🏊",
  gym: "💪",
  spa: "💆",
  restaurant: "🍽️",
  parking: "🅿️",
  ac: "❄️",
  tv: "📺",
  kitchen: "🍳",
  laundry: "👔",
  beach: "🏖️",
  bar: "🍸",
  concierge: "🛎️",
  elevator: "🛗",
  rooftop: "🌆",
  garden: "🌿",
  fireplace: "🔥",
  pet_friendly: "🐾",
  airport_shuttle: "🚌",
  breakfast: "🥐",
};

export const PROPERTY_TYPES = [
  "Hotel",
  "Resort",
  "Villa",
  "Apartment",
  "Hostel",
  "Guesthouse",
  "Boutique Hotel",
  "Eco Lodge",
  "Heritage Property",
] as const;

export const STAR_RATINGS = [1, 2, 3, 4, 5] as const;

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CHECKED_IN: "Checked In",
  CHECKED_OUT: "Checked Out",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  CHECKED_IN: "bg-green-100 text-green-800",
  CHECKED_OUT: "bg-slate-100 text-slate-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-orange-100 text-orange-800",
};

export const PAYMENT_METHODS = [
  { id: "card", label: "Credit / Debit Card", icon: "💳" },
  { id: "bkash", label: "bKash", icon: "💰" },
  { id: "nagad", label: "Nagad", icon: "💰" },
  { id: "bank", label: "Bank Transfer", icon: "🏦" },
] as const;

export const GUEST_TOKEN_KEY = "omnistay_guest_token";
export const GUEST_USER_KEY = "omnistay_guest_user";

export const DEFAULT_CHECK_IN_HOUR = 14; // 2 PM
export const DEFAULT_CHECK_OUT_HOUR = 12; // 12 PM

export const MAX_GUESTS_PER_ROOM = 10;
export const MAX_ROOMS_PER_BOOKING = 10;

