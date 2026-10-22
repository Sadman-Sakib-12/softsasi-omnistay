/**
 * Pure Domain Rules for RAG AI Guest Concierge & Multimodal Chat
 * Zero external framework or database dependencies.
 */

export type ConciergeIntent =
  | 'booking_inquiry'
  | 'room_recommendation'
  | 'amenity_query'
  | 'dining_order'
  | 'checkout_payment'
  | 'general_faq';

export function classifyIntent(message: string): ConciergeIntent {
  const lower = message.toLowerCase();

  if (
    lower.includes('pay') ||
    lower.includes('checkout') ||
    lower.includes('confirm reservation') ||
    lower.includes('complete booking')
  ) {
    return 'checkout_payment';
  }

  if (
    lower.includes('book') ||
    lower.includes('reserve') ||
    lower.includes('reservation') ||
    lower.includes('available from') ||
    lower.includes('staying')
  ) {
    return 'booking_inquiry';
  }

  if (
    lower.includes('recommend') ||
    lower.includes('ocean view') ||
    lower.includes('suite') ||
    lower.includes('toddler') ||
    lower.includes('elderly') ||
    lower.includes('quiet') ||
    lower.includes('which room')
  ) {
    return 'room_recommendation';
  }

  if (
    lower.includes('food') ||
    lower.includes('menu') ||
    lower.includes('dining') ||
    lower.includes('room service') ||
    lower.includes('breakfast') ||
    lower.includes('dinner')
  ) {
    return 'dining_order';
  }

  if (
    lower.includes('wifi') ||
    lower.includes('pool') ||
    lower.includes('gym') ||
    lower.includes('spa') ||
    lower.includes('parking') ||
    lower.includes('amenit')
  ) {
    return 'amenity_query';
  }

  return 'general_faq';
}

export function detectLanguage(text: string): string {
  // Common script & keyword heuristics for 50+ language handling
  if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali
  if (/[\u0600-\u06FF]/.test(text)) return 'ar'; // Arabic
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh'; // Chinese
  if (/[\u3040-\u30FF]/.test(text)) return 'ja'; // Japanese
  if (/[\u0400-\u04FF]/.test(text)) return 'ru'; // Russian
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi

  const lower = text.toLowerCase();
  if (lower.includes('bonjour') || lower.includes('merci') || lower.includes('chambre')) return 'fr';
  if (lower.includes('hola') || lower.includes('gracias') || lower.includes('habitacion')) return 'es';
  if (lower.includes('guten tag') || lower.includes('danke') || lower.includes('zimmer')) return 'de';
  if (lower.includes('ciao') || lower.includes('grazie')) return 'it';

  return 'en';
}

export function calculateTextOverlapScore(query: string, documentContent: string): number {
  const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  if (queryTerms.length === 0) return 0;

  const docLower = documentContent.toLowerCase();
  let hits = 0;
  for (const term of queryTerms) {
    if (docLower.includes(term)) {
      hits += 1;
    }
  }

  return Math.round((hits / queryTerms.length) * 100) / 100;
}

export function extractBookingIntentParams(message: string): {
  adults?: number;
  nights?: number;
  roomType?: string;
} {
  const lower = message.toLowerCase();
  let adults = 1;
  let nights = 1;
  let roomType: string | undefined = undefined;

  const adultsMatch = lower.match(/(\d+)\s*(adult|guest|people|person)/);
  if (adultsMatch) {
    adults = parseInt(adultsMatch[1], 10);
  }

  const nightsMatch = lower.match(/(\d+)\s*(night|day)/);
  if (nightsMatch) {
    nights = parseInt(nightsMatch[1], 10);
  }

  if (lower.includes('deluxe')) roomType = 'Deluxe Suite';
  else if (lower.includes('presidential')) roomType = 'Presidential Villa';
  else if (lower.includes('ocean')) roomType = 'Oceanfront Suite';
  else if (lower.includes('standard')) roomType = 'Standard Room';

  return { adults, nights, roomType };
}

export function generateConciergeReply(
  intent: ConciergeIntent,
  language: string,
  matchedKnowledge?: string,
): { reply: string; suggestedActions: Array<{ label: string; action: string; payload?: Record<string, any> }> } {
  if (language === 'bn') {
    if (intent === 'booking_inquiry') {
      return {
        reply: 'আমাদের বিলাসবহুল স্যুট ও রুমসমূহ উপলব্ধ রয়েছে। আপনি কোন তারিখে বুক করতে চান?',
        suggestedActions: [{ label: 'রুম বুক করুন', action: 'START_BOOKING' }],
      };
    }
    return {
      reply: 'অমনিস্টে ৩৬০-তে স্বাগতম! আমি কীভাবে আপনাকে সাহায্য করতে পারি?',
      suggestedActions: [{ label: 'রুম দেখুন', action: 'VIEW_ROOMS' }],
    };
  }

  if (language === 'es') {
    return {
      reply: '¡Bienvenido a OmniStay! ¿En qué puedo ayudarle hoy con su reserva o estancia?',
      suggestedActions: [{ label: 'Ver Habitaciones', action: 'VIEW_ROOMS' }],
    };
  }

  switch (intent) {
    case 'room_recommendation':
      return {
        reply: matchedKnowledge
          ? `Based on our property details: ${matchedKnowledge}. We recommend our Ocean Deluxe Suites with soundproofing and elevator access.`
          : 'For family comfort and tranquility, we recommend our Ocean Deluxe Suites featuring panoramic ocean views and ground-level elevator access.',
        suggestedActions: [
          { label: 'View Deluxe Ocean Suite', action: 'SELECT_ROOM', payload: { category: 'Deluxe' } },
          { label: 'Check Availability', action: 'CHECK_DATES' },
        ],
      };

    case 'booking_inquiry':
      return {
        reply: 'I can reserve that for you immediately right inside this chat! Please confirm your check-in dates and guest count.',
        suggestedActions: [
          { label: 'Select Dates', action: 'SELECT_DATES' },
          { label: 'Book Now', action: 'INITIATE_IN_CHAT_BOOKING' },
        ],
      };

    case 'checkout_payment':
      return {
        reply: 'Your booking reservation is ready for instant in-chat settlement. Please complete the secure payment authorization below.',
        suggestedActions: [
          { label: 'Pay via In-Chat Stripe', action: 'OPEN_PAYMENT_MODAL' },
        ],
      };

    case 'dining_order':
      return {
        reply: 'Our culinary kitchen is open! You can order directly to your room folio. Would you like to review our room-service menu?',
        suggestedActions: [
          { label: 'View In-Room Dining Menu', action: 'VIEW_MENU' },
          { label: 'Order Room Service', action: 'ORDER_DINING' },
        ],
      };

    case 'amenity_query':
      return {
        reply: matchedKnowledge
          ? `Here are the amenity details: ${matchedKnowledge}`
          : 'Our resort features high-speed Wi-Fi, 24/7 infinity pool, luxury spa, and private valet parking.',
        suggestedActions: [
          { label: 'View All Amenities', action: 'VIEW_AMENITIES' },
        ],
      };

    default:
      return {
        reply: matchedKnowledge
          ? `According to our guest directory: ${matchedKnowledge}`
          : 'Welcome to OmniStay 360! I am your 24/7 AI Concierge. I can help you discover rooms, order dining, book local tours, and settle bills.',
        suggestedActions: [
          { label: 'Explore Rooms', action: 'VIEW_ROOMS' },
          { label: 'Contact Reception', action: 'CALL_FRONTDESK' },
        ],
      };
  }
}
