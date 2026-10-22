/**
 * AI Suite and Intelligent Automation Type Definitions
 * Covers RAG Concierge, In-Chat Commerce, Dynamic Pricing, Marketing Copy & Predictive Analytics
 */

export interface AiConciergeConfigDto {
  id?: string;
  tenantId: string;
  agentName: string;
  systemPrompt: string;
  modelProvider?: string;
  modelName?: string;
  temperature?: number;
  isEnabled?: boolean;
}

export interface AiConversationDto {
  id?: string;
  tenantId: string;
  guestId?: string | null;
  sessionId: string;
  channel?: string;
  language?: string;
  createdAt?: Date;
}

export interface AiConversationMessageDto {
  id?: string;
  conversationId: string;
  sender: 'guest' | 'agent' | 'system';
  content: string;
  metadata?: Record<string, any> | null;
  createdAt?: Date;
}

export interface AiKnowledgeDocumentDto {
  id?: string;
  tenantId: string;
  title: string;
  content: string;
  category: 'property_info' | 'amenities' | 'policies' | 'dining_menu' | 'local_attractions';
  createdAt?: Date;
}

export interface AiInChatTransactionDto {
  id?: string;
  conversationId: string;
  bookingId?: string | null;
  amount: number;
  status: 'initiated' | 'pending_payment' | 'completed' | 'failed';
  createdAt?: Date;
}

export interface AiDynamicPricingLogDto {
  id?: string;
  roomTypeId: string;
  originalRate: number;
  suggestedRate: number;
  appliedRate: number;
  occupancyPct: number;
  computedAt?: Date;
}

export interface AiMarketingCampaignDto {
  id?: string;
  tenantId: string;
  title: string;
  generatedAd: string;
  targetAudience: string;
  channel: string;
  createdAt?: Date;
}

export interface AiPredictiveForecastDto {
  id?: string;
  propertyId: string;
  forecastDate: Date | string;
  forecastOccupancy: number;
  forecastRevenue: number;
  createdAt?: Date;
}

export interface CompetitorPriceScrapeDto {
  id?: string;
  propertyId: string;
  competitorName: string;
  roomCategory: string;
  rateObserved: number;
  scrapedAt?: Date;
}

export interface ChatConciergeRequest {
  tenantId: string;
  sessionId: string;
  guestId?: string;
  message: string;
  channel?: 'web' | 'mobile' | 'whatsapp' | 'in_room_tablet';
  preferredLanguage?: string;
}

export interface ChatConciergeResponse {
  conversationId: string;
  sessionId: string;
  reply: string;
  language: string;
  intent: 'booking_inquiry' | 'room_recommendation' | 'amenity_query' | 'dining_order' | 'checkout_payment' | 'general_faq';
  recommendedRoomIds?: string[];
  suggestedActions?: Array<{ label: string; action: string; payload?: Record<string, any> }>;
  inChatCheckoutEligible?: boolean;
}

export interface InChatBookingRequest {
  tenantId: string;
  conversationId: string;
  guestId: string;
  propertyId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children?: number;
  paymentMethod?: string;
}

export interface InChatBookingResult {
  transactionId: string;
  bookingId: string;
  bookingCode: string;
  amount: number;
  status: string;
  paymentToken: string;
  confirmationVoucherUrl: string;
}

export interface EvaluateDynamicPricingRequest {
  roomTypeId: string;
  baseRate: number;
  currentOccupancyPct: number;
  daysUntilArrival: number;
  historicalPacingFactor?: number;
  competitorAverageRate?: number;
}

export interface DynamicPricingResult {
  roomTypeId: string;
  originalRate: number;
  suggestedRate: number;
  appliedRate: number;
  surgeMultiplier: number;
  adjustmentReason: string;
  isLastMinuteDiscount: boolean;
}

export interface GenerateMarketingCopyRequest {
  tenantId: string;
  title: string;
  targetAudience: string;
  tone: 'Luxury' | 'Romantic' | 'Family' | 'Business';
  channel: 'email' | 'sms' | 'social_instagram' | 'social_facebook' | 'seo_description';
  highlights: string[];
}

export interface MarketingCopyResult {
  title: string;
  campaignId: string;
  generatedCopy: string;
  suggestedSubjectLine?: string;
  characterCount: number;
  tone: string;
}

export interface PredictiveForecastRequest {
  propertyId: string;
  totalRooms: number;
  historicalOccupancyRate: number;
  confirmedBookingsCount: number;
  projectedDays?: number;
  averageDailyRate: number;
}

export interface PredictiveForecastResult {
  propertyId: string;
  forecastDate: string;
  forecastOccupancy: number;
  forecastRevenue: number;
  projectedRevPAR: number;
  anomalyDetected?: boolean;
  anomalyDetails?: string;
}
