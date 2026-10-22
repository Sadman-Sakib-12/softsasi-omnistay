import { Inject, Injectable } from '@nestjs/common';
import type { IAiRepository } from '../../domain/repositories/ai.repository.interface.js';
import { AI_REPOSITORY_TOKEN } from '../../domain/repositories/ai.repository.interface.js';
import {
  classifyIntent,
  detectLanguage,
  generateConciergeReply,
} from '../../domain/rules/rag-concierge.rule.js';
import {
  ChatConciergeRequest,
  ChatConciergeResponse,
} from '@omnistay/shared-types';

@Injectable()
export class AiConciergeService {
  constructor(
    @Inject(AI_REPOSITORY_TOKEN)
    private readonly aiRepo: IAiRepository,
  ) {}

  async configureConcierge(tenantId: string, data: {
    agentName: string;
    systemPrompt: string;
    modelProvider?: string;
    modelName?: string;
    temperature?: number;
    isEnabled?: boolean;
  }) {
    return this.aiRepo.upsertConfig(tenantId, data);
  }

  async getConfig(tenantId: string) {
    return this.aiRepo.findConfigByTenantId(tenantId);
  }

  async addKnowledgeDocument(tenantId: string, data: {
    title: string;
    content: string;
    category?: 'property_info' | 'amenities' | 'policies' | 'dining_menu' | 'local_attractions';
  }) {
    return this.aiRepo.createKnowledgeDocument({
      tenantId,
      title: data.title,
      content: data.content,
      category: data.category || 'property_info',
    });
  }

  async getKnowledgeDocuments(tenantId: string, category?: string) {
    return this.aiRepo.findKnowledgeDocuments(tenantId, category);
  }

  async handleChatMessage(req: ChatConciergeRequest): Promise<ChatConciergeResponse> {
    // 1. Get or create conversation session
    let conversation = await this.aiRepo.findConversationBySession(req.sessionId);
    const lang = req.preferredLanguage || detectLanguage(req.message);

    if (!conversation) {
      conversation = await this.aiRepo.createConversation({
        tenantId: req.tenantId,
        guestId: req.guestId || null,
        sessionId: req.sessionId,
        channel: req.channel || 'web',
        language: lang,
      });
    }

    // 2. Persist guest message
    await this.aiRepo.addConversationMessage({
      conversationId: conversation.id,
      sender: 'guest',
      content: req.message,
    });

    // 3. Classify intent
    const intent = classifyIntent(req.message);

    // 4. Retrieve RAG knowledge snippets
    const matchedDocs = await this.aiRepo.searchKnowledgeDocuments(req.tenantId, req.message);
    const matchedSnippet = matchedDocs.length > 0 ? matchedDocs[0].content : undefined;

    // 5. Generate synthesized response & suggested next actions
    const responsePayload = generateConciergeReply(intent, lang, matchedSnippet);

    // 6. Persist agent reply
    await this.aiRepo.addConversationMessage({
      conversationId: conversation.id,
      sender: 'agent',
      content: responsePayload.reply,
      metadata: {
        intent,
        language: lang,
        suggestedActions: responsePayload.suggestedActions,
      },
    });

    return {
      conversationId: conversation.id,
      sessionId: req.sessionId,
      reply: responsePayload.reply,
      language: lang,
      intent,
      suggestedActions: responsePayload.suggestedActions,
      inChatCheckoutEligible: intent === 'booking_inquiry' || intent === 'checkout_payment',
    };
  }

  async getConversationHistory(sessionId: string) {
    const conversation = await this.aiRepo.findConversationBySession(sessionId);
    if (!conversation) return [];
    return this.aiRepo.getConversationMessages(conversation.id);
  }
}
