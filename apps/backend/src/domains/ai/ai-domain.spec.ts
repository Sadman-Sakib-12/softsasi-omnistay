import { describe, expect, it, beforeEach } from 'vitest';
import {
  calculateSurgePricing,
  calculatePickupVelocity,
  calculate90DayForecast,
  detectExpenseAnomaly,
} from './domain/rules/dynamic-pricing.rule.js';
import {
  classifyIntent,
  detectLanguage,
  calculateTextOverlapScore,
  extractBookingIntentParams,
  generateConciergeReply,
} from './domain/rules/rag-concierge.rule.js';
import { AiConciergeService } from './application/services/ai-concierge.service.js';
import { InChatBookingService } from './application/services/in-chat-booking.service.js';
import { DynamicYieldPricingService } from './application/services/dynamic-pricing.service.js';
import { AiMarketingStudioService } from './application/services/ai-marketing.service.js';
import { AiPredictiveAnalyticsService } from './application/services/ai-predictive.service.js';
import { IAiRepository } from './domain/repositories/ai.repository.interface.js';

class MockAiRepository implements IAiRepository {
  configs = new Map<string, any>();
  conversations = new Map<string, any>();
  messages: any[] = [];
  knowledgeDocs: any[] = [];
  transactions = new Map<string, any>();
  pricingLogs: any[] = [];
  campaigns: any[] = [];
  forecasts: any[] = [];
  competitorScrapes: any[] = [];

  async findConfigByTenantId(tenantId: string) {
    return this.configs.get(tenantId) || null;
  }
  async upsertConfig(tenantId: string, data: any) {
    const config = { id: `cfg-${Date.now()}`, tenantId, ...data };
    this.configs.set(tenantId, config);
    return config;
  }
  async findConversationBySession(sessionId: string) {
    return this.conversations.get(sessionId) || null;
  }
  async createConversation(data: any) {
    const conv = { id: `conv-${Date.now()}`, ...data, messages: [], transactions: [] };
    this.conversations.set(data.sessionId, conv);
    return conv;
  }
  async addConversationMessage(data: any) {
    const msg = { id: `msg-${Date.now()}`, ...data, createdAt: new Date() };
    this.messages.push(msg);
    return msg;
  }
  async getConversationMessages(conversationId: string) {
    return this.messages.filter((m) => m.conversationId === conversationId);
  }
  async createKnowledgeDocument(data: any) {
    const doc = { id: `doc-${Date.now()}`, ...data, embeddings: [] };
    this.knowledgeDocs.push(doc);
    return doc;
  }
  async findKnowledgeDocuments(tenantId: string, category?: string) {
    return this.knowledgeDocs.filter(
      (d) => d.tenantId === tenantId && (!category || d.category === category),
    );
  }
  async searchKnowledgeDocuments(tenantId: string, query: string) {
    const q = query.toLowerCase();
    return this.knowledgeDocs.filter(
      (d) =>
        d.tenantId === tenantId &&
        (d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)),
    );
  }
  async createInChatTransaction(data: any) {
    const tx = { id: `tx-${Date.now()}`, ...data };
    this.transactions.set(tx.id, tx);
    return tx;
  }
  async updateInChatTransaction(id: string, data: any) {
    const tx = this.transactions.get(id);
    if (!tx) return null;
    const updated = { ...tx, ...data };
    this.transactions.set(id, updated);
    return updated;
  }
  async findInChatTransaction(id: string) {
    return this.transactions.get(id) || null;
  }
  async createDynamicPricingLog(data: any) {
    const log = { id: `log-${Date.now()}`, ...data, computedAt: new Date() };
    this.pricingLogs.push(log);
    return log;
  }
  async findDynamicPricingLogs(roomTypeId: string) {
    return this.pricingLogs.filter((l) => l.roomTypeId === roomTypeId);
  }
  async createMarketingCampaign(data: any) {
    const camp = { id: `camp-${Date.now()}`, ...data, createdAt: new Date() };
    this.campaigns.push(camp);
    return camp;
  }
  async findMarketingCampaigns(tenantId: string) {
    return this.campaigns.filter((c) => c.tenantId === tenantId);
  }
  async createPredictiveForecast(data: any) {
    const fc = { id: `fc-${Date.now()}`, ...data, createdAt: new Date() };
    this.forecasts.push(fc);
    return fc;
  }
  async findPredictiveForecasts(propertyId: string) {
    return this.forecasts.filter((f) => f.propertyId === propertyId);
  }
  async createCompetitorPriceScrape(data: any) {
    const sc = { id: `sc-${Date.now()}`, ...data, scrapedAt: new Date() };
    this.competitorScrapes.push(sc);
    return sc;
  }
  async findCompetitorPriceScrapes(propertyId: string) {
    return this.competitorScrapes.filter((s) => s.propertyId === propertyId);
  }
}

describe('Phase 8: AI Suite & Intelligent Automation', () => {
  describe('Domain Rules - Dynamic Yield Pricing & Predictive Math', () => {
    it('should maintain standard base rate when occupancy is normal (<70%) and arrival > 2 days', () => {
      const result = calculateSurgePricing(200, 50, 10);
      expect(result.suggestedRate).toBe(200);
      expect(result.surgeMultiplier).toBe(1.0);
      expect(result.isLastMinuteDiscount).toBe(false);
    });

    it('should apply 5% surge when occupancy is between 70% and 79%', () => {
      const result = calculateSurgePricing(200, 75, 10);
      expect(result.suggestedRate).toBe(210);
      expect(result.surgeMultiplier).toBe(1.05);
      expect(result.adjustmentReason).toContain('>=70%');
    });

    it('should apply 15% surge when occupancy is between 80% and 89%', () => {
      const result = calculateSurgePricing(200, 85, 10);
      expect(result.suggestedRate).toBe(230);
      expect(result.surgeMultiplier).toBe(1.15);
    });

    it('should apply 25% surge when occupancy is >= 90%', () => {
      const result = calculateSurgePricing(200, 95, 10);
      expect(result.suggestedRate).toBe(250);
      expect(result.surgeMultiplier).toBe(1.25);
    });

    it('should trigger tactical last-minute discount (15% off) when arrival <= 48 hours and occupancy < 60%', () => {
      const result = calculateSurgePricing(200, 45, 1);
      expect(result.suggestedRate).toBe(170);
      expect(result.surgeMultiplier).toBe(0.85);
      expect(result.isLastMinuteDiscount).toBe(true);
    });

    it('should calibrate to competitor benchmark ceiling if suggested rate exceeds competitor avg by >10%', () => {
      // 85% occupancy would normally surge to $230, but competitor avg is $190 (ceiling: $209)
      const result = calculateSurgePricing(200, 84, 10, 190);
      expect(result.suggestedRate).toBe(209);
      expect(result.adjustmentReason).toContain('competitor benchmark');
    });

    it('should calculate pickup velocity correctly', () => {
      const velocity = calculatePickupVelocity(40, 70, 5);
      expect(velocity).toBe(6.0); // (70 - 40) / 5 = 6% per day
    });

    it('should project 90-day occupancy and RevPAR', () => {
      const forecast = calculate90DayForecast(100, 65, 3000, 200, 90);
      expect(forecast.projectedOccupancy).toBeGreaterThan(0);
      expect(forecast.projectedRevenue).toBeGreaterThan(0);
      expect(forecast.projectedRevPAR).toBeGreaterThan(0);
    });

    it('should accurately detect expense anomalies', () => {
      const normal = detectExpenseAnomaly(1000, 1200, 1.5);
      expect(normal.isAnomaly).toBe(false);

      const anomaly = detectExpenseAnomaly(1000, 2500, 1.5);
      expect(anomaly.isAnomaly).toBe(true);
      expect(anomaly.deviationPct).toBe(150);
    });
  });

  describe('Domain Rules - RAG Concierge Intent & Multilingual Processing', () => {
    it('should classify intent accurately across hospitality domain requests', () => {
      expect(classifyIntent('Can I book a suite for this weekend?')).toBe('booking_inquiry');
      expect(classifyIntent('Which room do you recommend for elderly guests?')).toBe('room_recommendation');
      expect(classifyIntent('What is your Wi-Fi password and pool hours?')).toBe('amenity_query');
      expect(classifyIntent('Can I order food and breakfast to my room?')).toBe('dining_order');
      expect(classifyIntent('I want to pay and confirm reservation')).toBe('checkout_payment');
      expect(classifyIntent('Hello there')).toBe('general_faq');
    });

    it('should detect languages using multilingual heuristics (Bengali, Spanish, Arabic, etc.)', () => {
      expect(detectLanguage('আমি একটি রুম বুক করতে চাই')).toBe('bn');
      expect(detectLanguage('Hola, quisiera reservar una habitacion')).toBe('es');
      expect(detectLanguage('مرحبا اريد حجز غرفة')).toBe('ar');
      expect(detectLanguage('Can you help me?')).toBe('en');
    });

    it('should compute text overlap score for RAG retrieval matching', () => {
      const score = calculateTextOverlapScore('ocean view pool', 'This room offers a stunning ocean view and private pool.');
      expect(score).toBe(1.0);
    });

    it('should extract booking intent parameters from freeform query', () => {
      const params = extractBookingIntentParams('I need a deluxe suite for 2 adults and 3 nights');
      expect(params.adults).toBe(2);
      expect(params.nights).toBe(3);
      expect(params.roomType).toBe('Deluxe Suite');
    });

    it('should generate localized concierge replies', () => {
      const bnReply = generateConciergeReply('booking_inquiry', 'bn');
      expect(bnReply.reply).toContain('বিলাসবহুল');

      const enReply = generateConciergeReply('room_recommendation', 'en');
      expect(enReply.suggestedActions.length).toBeGreaterThan(0);
    });
  });

  describe('Application Services Integration', () => {
    let mockRepo: MockAiRepository;
    let conciergeService: AiConciergeService;
    let inChatBookingService: InChatBookingService;
    let dynamicPricingService: DynamicYieldPricingService;
    let marketingService: AiMarketingStudioService;
    let predictiveService: AiPredictiveAnalyticsService;

    beforeEach(() => {
      mockRepo = new MockAiRepository();
      conciergeService = new AiConciergeService(mockRepo);
      inChatBookingService = new InChatBookingService(mockRepo);
      dynamicPricingService = new DynamicYieldPricingService(mockRepo);
      marketingService = new AiMarketingStudioService(mockRepo);
      predictiveService = new AiPredictiveAnalyticsService(mockRepo);
    });

    it('should configure AI concierge and handle RAG chat messages', async () => {
      await conciergeService.configureConcierge('tenant-1', {
        agentName: 'AuraBot',
        systemPrompt: 'You are a luxury resort concierge.',
      });

      await conciergeService.addKnowledgeDocument('tenant-1', {
        title: 'Infinity Pool Hours',
        content: 'The heated infinity pool is open 24/7 with towel service.',
        category: 'amenities',
      });

      const response = await conciergeService.handleChatMessage({
        tenantId: 'tenant-1',
        sessionId: 'session-xyz',
        message: 'What are the pool hours?',
      });

      expect(response.conversationId).toBeDefined();
      expect(response.intent).toBe('amenity_query');
      expect(response.reply).toContain('infinity pool');
    });

    it('should initiate in-chat booking and confirm payment', async () => {
      const conv = await mockRepo.createConversation({
        tenantId: 'tenant-1',
        sessionId: 'sess-book-1',
        channel: 'web',
      });

      const initResult = await inChatBookingService.initiateInChatBooking({
        tenantId: 'tenant-1',
        conversationId: conv.id,
        guestId: 'usr-1',
        propertyId: 'prop-1',
        roomTypeId: 'room-type-1',
        checkInDate: '2026-11-01',
        checkOutDate: '2026-11-03',
        adults: 2,
      });

      expect(initResult.transactionId).toBeDefined();
      expect(initResult.bookingCode).toContain('CHAT-');
      expect(initResult.amount).toBe(440); // 2 nights * $220

      const confirmed = await inChatBookingService.confirmInChatPayment(initResult.transactionId);
      expect(confirmed.status).toBe('completed');
    });

    it('should evaluate dynamic yield rates and persist logs', async () => {
      const pricing = await dynamicPricingService.evaluateRate({
        roomTypeId: 'room-101',
        baseRate: 300,
        currentOccupancyPct: 92,
        daysUntilArrival: 5,
      });

      expect(pricing.suggestedRate).toBe(375); // 25% surge
      expect(pricing.surgeMultiplier).toBe(1.25);

      const logs = await dynamicPricingService.getPricingLogs('room-101');
      expect(logs.length).toBe(1);
    });

    it('should generate creative marketing copywriting for multi-channel campaigns', async () => {
      const copy = await marketingService.generateMarketingCopy({
        tenantId: 'tenant-1',
        title: 'Azure Maldives Resort',
        targetAudience: 'Couples and Honeymooners',
        tone: 'Romantic',
        channel: 'email',
        highlights: ['Private overwater bungalow', 'Sunset champagne cruise'],
      });

      expect(copy.suggestedSubjectLine).toContain('Romantic');
      expect(copy.generatedCopy).toContain('overwater bungalow');
      expect(copy.campaignId).toBeDefined();
    });

    it('should calculate 90-day predictive forecasts and detect expense anomalies', async () => {
      const forecast = await predictiveService.generateForecast({
        propertyId: 'prop-azure',
        totalRooms: 80,
        historicalOccupancyRate: 70,
        confirmedBookingsCount: 3500,
        averageDailyRate: 250,
      });

      expect(forecast.forecastOccupancy).toBeGreaterThan(0);
      expect(forecast.projectedRevPAR).toBeGreaterThan(0);

      const anomaly = await predictiveService.checkExpenseAnomaly({
        historicalAverageExpense: 5000,
        currentExpense: 9000,
      });

      expect(anomaly.isAnomaly).toBe(true);
    });
  });
});
