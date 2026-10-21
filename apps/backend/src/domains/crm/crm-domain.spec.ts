import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateLeadScore } from './domain/rules/lead-scoring.rule.js';
import { determineVipTier } from './domain/rules/vip-tier.rule.js';
import { LeadApplicationService } from './application/services/lead.application-service.js';
import { DealApplicationService } from './application/services/deal.application-service.js';
import { FormApplicationService } from './application/services/form.application-service.js';
import { Guest360ApplicationService } from './application/services/guest360.application-service.js';
import { SupportApplicationService } from './application/services/support.application-service.js';
import { ILeadRepository } from './domain/repositories/lead.repository.interface.js';
import { IDealRepository } from './domain/repositories/deal.repository.interface.js';
import { IFormRepository } from './domain/repositories/form.repository.interface.js';
import { IGuest360Repository } from './domain/repositories/guest360.repository.interface.js';
import { ISupportRepository } from './domain/repositories/support.repository.interface.js';

describe('CRM Domain — Clean Architecture & DDD Pilot Test Suite', () => {
  describe('Domain Rules (Pure Logic - Zero Mocks / DB Required)', () => {
    it('calculateLeadScore: should evaluate lead score according to commercial potential', () => {
      // High-budget wedding
      const scoreHigh = calculateLeadScore(60000, 250, 4);
      expect(scoreHigh).toBe(100);

      // Mid-tier corporate meeting
      const scoreMid = calculateLeadScore(12000, 20, 2);
      expect(scoreMid).toBe(55);

      // Baseline walk-in inquiry
      const scoreLow = calculateLeadScore(1000, 2, 1);
      expect(scoreLow).toBe(45);
    });

    it('determineVipTier: should map nights and spend to tiered VIP loyalty statuses', () => {
      expect(determineVipTier(2, 500)).toBe('Silver');
      expect(determineVipTier(15, 6000)).toBe('Gold');
      expect(determineVipTier(30, 12000)).toBe('Platinum');
      expect(determineVipTier(55, 30000)).toBe('VIP Black');
    });
  });

  describe('Application Services & Repository Orchestration', () => {
    let mockLeadRepo: ILeadRepository;
    let mockDealRepo: IDealRepository;
    let mockFormRepo: IFormRepository;
    let mockGuestRepo: IGuest360Repository;
    let mockSupportRepo: ISupportRepository;

    let leadService: LeadApplicationService;
    let dealService: DealApplicationService;
    let formService: FormApplicationService;
    let guestService: Guest360ApplicationService;
    let supportService: SupportApplicationService;

    beforeEach(() => {
      mockLeadRepo = {
        createStage: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'stage-1', ...data })),
        findStages: vi.fn().mockResolvedValue([{ id: 'stage-1', name: 'Discovery' }]),
        findFirstStage: vi.fn().mockResolvedValue({ id: 'stage-default', name: 'New Inquiries' }),
        createLead: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'lead-1', ...data })),
        findLeads: vi.fn().mockResolvedValue([{ id: 'lead-1', title: 'Wedding Gala' }]),
        findLeadById: vi.fn().mockImplementation((id) =>
          id === 'lead-1' ? Promise.resolve({ id: 'lead-1', title: 'Wedding Gala', tenantId: 't-1' }) : Promise.resolve(null),
        ),
        countOpenLeadsForUser: vi.fn().mockImplementation((_tenantId, userId) =>
          userId === 'mgr-busy' ? Promise.resolve(10) : Promise.resolve(2),
        ),
        updateLead: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
        addCallLog: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'call-1', ...data })),
        addNote: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'note-1', ...data })),
      };

      mockDealRepo = {
        createStage: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'deal-stage-1', ...data })),
        findStages: vi.fn().mockResolvedValue([{ id: 'deal-stage-1', name: 'Proposal Sent' }]),
        findFirstStage: vi.fn().mockResolvedValue({ id: 'deal-stage-default', name: 'Negotiation' }),
        createDeal: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'deal-1', ...data })),
        findDeals: vi.fn().mockResolvedValue([{ id: 'deal-1', dealName: 'Tech Summit' }]),
        findDealById: vi.fn().mockImplementation((id) =>
          id === 'deal-1' ? Promise.resolve({ id: 'deal-1', dealName: 'Tech Summit', dealValue: 85000 }) : Promise.resolve(null),
        ),
        updateDeal: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
        createProposal: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'prop-1', ...data })),
        createBanquetContract: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'contract-1', ...data })),
        findContractById: vi.fn().mockImplementation((id) =>
          id === 'contract-1' ? Promise.resolve({ id: 'contract-1', contractNumber: 'CTR-001', isSigned: false }) : Promise.resolve(null),
        ),
        createSignature: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'sig-1', ...data })),
        updateContract: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
      };

      mockFormRepo = {
        createForm: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'form-1', ...data })),
        findForms: vi.fn().mockResolvedValue([{ id: 'form-1', formName: 'Inquiry Form' }]),
        findFormById: vi.fn().mockImplementation((id) =>
          id === 'form-1' ? Promise.resolve({ id: 'form-1', tenantId: 't-1', formName: 'Inquiry Form' }) : Promise.resolve(null),
        ),
        createResponse: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'resp-1', ...data })),
        findResponses: vi.fn().mockResolvedValue([{ id: 'resp-1' }]),
      };

      mockGuestRepo = {
        findProfileByUserId: vi.fn().mockImplementation((userId) =>
          userId === 'user-existing'
            ? Promise.resolve({ id: 'prof-1', userId: 'user-existing', lifetimeSpend: 4000, totalNights: 8, vipTier: 'Silver' })
            : Promise.resolve(null),
        ),
        createProfile: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'prof-new', ...data })),
        updateProfile: vi.fn().mockImplementation((userId, data) => Promise.resolve({ id: 'prof-1', userId, ...data })),
        addPreference: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'pref-1', ...data })),
        addDietary: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'diet-1', ...data })),
        createSurvey: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'survey-1', ...data })),
      };

      mockSupportRepo = {
        countTickets: vi.fn().mockResolvedValue(5),
        createTicket: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'tck-1', ...data })),
        findTickets: vi.fn().mockResolvedValue([{ id: 'tck-1', ticketCode: 'TCK-0006' }]),
        findTicketById: vi.fn().mockImplementation((id) =>
          id === 'tck-1' ? Promise.resolve({ id: 'tck-1', ticketCode: 'TCK-0006', status: 'open' }) : Promise.resolve(null),
        ),
        addReply: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'reply-1', ...data })),
        updateTicket: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
        createCannedResponse: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'canned-1', ...data })),
        findCannedResponses: vi.fn().mockResolvedValue([{ id: 'canned-1', shortcut: '!wifi' }]),
        createKnowledgeBase: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'kb-1', ...data })),
        findKnowledgeBase: vi.fn().mockResolvedValue([{ id: 'kb-1', question: 'Check-in times' }]),
      };

      leadService = new LeadApplicationService(mockLeadRepo);
      dealService = new DealApplicationService(mockDealRepo);
      formService = new FormApplicationService(mockFormRepo, leadService);
      guestService = new Guest360ApplicationService(mockGuestRepo);
      supportService = new SupportApplicationService(mockSupportRepo);
    });

    it('LeadApplicationService: should create lead with evaluated score and assign round-robin', async () => {
      const lead = await leadService.createLead('t-1', {
        title: 'Vanderbilt Wedding',
        contactName: 'Catherine Vanderbilt',
        budget: 55000,
        guestCount: 200,
        durationDays: 3,
      });

      expect(lead.leadScore).toBe(100);
      expect(mockLeadRepo.createLead).toHaveBeenCalled();

      const assigned = await leadService.assignLeadRoundRobin('t-1', 'lead-1', ['mgr-busy', 'mgr-free']);
      expect(assigned.assignedTo).toBe('mgr-free');
    });

    it('DealApplicationService: should handle proposal creation and digital contract execution', async () => {
      const deal = await dealService.createDeal('t-1', {
        dealName: 'Tech Summit',
        dealValue: 85000,
      });
      expect(deal.dealValue).toBe(85000);

      const contract = await dealService.createBanquetContract('deal-1', {
        contractNumber: 'CTR-001',
        termsContent: 'Master Terms',
      });
      expect(contract.contractNumber).toBe('CTR-001');

      const sig = await dealService.signContract('contract-1', {
        signerName: 'Eleanor Roosevelt',
        signerIp: '192.168.1.1',
        signatureImg: 'data:image/png;base64,sample',
      });
      expect(sig.signerName).toBe('Eleanor Roosevelt');
      expect(mockDealRepo.updateContract).toHaveBeenCalledWith('contract-1', { isSigned: true });
    });

    it('FormApplicationService: should submit response and auto-convert to CRM Lead', async () => {
      const resp = await formService.submitResponse('form-1', {
        formData: {
          fullName: 'Alexander Hamilton',
          email: 'alexander@treasury.gov',
          budget: 50000,
          headcount: 200,
        },
      });

      expect(resp).toBeDefined();
      expect(mockLeadRepo.createLead).toHaveBeenCalled();
    });

    it('Guest360ApplicationService: should record stay and update VIP tier using domain rule', async () => {
      // 8 nights + 30 = 38 nights, $4000 + $8000 = $12000 -> Platinum
      const updated = await guestService.recordStayAndSpend('user-existing', 30, 8000);
      expect(updated.vipTier).toBe('Platinum');
    });

    it('SupportApplicationService: should generate support tickets and replies', async () => {
      const ticket = await supportService.createTicket('t-1', {
        guestName: 'Lady Catherine',
        subject: 'HVAC repair',
      });
      expect(ticket.ticketCode).toContain('TCK-');

      const reply = await supportService.replyTicket('tck-1', {
        senderType: 'staff',
        message: 'Technician dispatched.',
      });
      expect(reply.message).toBe('Technician dispatched.');
    });
  });
});
