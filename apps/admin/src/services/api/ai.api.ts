import { apiClient } from './client';

export interface AiChatMessage {
  tenantId?: string;
  sessionId: string;
  message: string;
  channel?: 'web' | 'mobile' | 'whatsapp' | 'in_room_tablet';
  preferredLanguage?: string;
}

export interface AiConfigDto {
  agentName: string;
  systemPrompt: string;
  modelProvider?: string;
  modelName?: string;
  temperature?: number;
  isEnabled?: boolean;
}

export const aiApi = {
  async chat(payload: AiChatMessage): Promise<any> {
    return apiClient.post('/api/v1/ai/concierge/chat', {
      tenantId: payload.tenantId || apiClient.getTenantId(),
      ...payload,
    });
  },

  async getConfig(): Promise<AiConfigDto> {
    return apiClient.get('/api/v1/ai/concierge/config');
  },

  async updateConfig(config: AiConfigDto): Promise<any> {
    return apiClient.post('/api/v1/ai/concierge/config', config);
  },

  async addKnowledge(data: { title: string; content: string; category?: string }): Promise<any> {
    return apiClient.post('/api/v1/ai/concierge/knowledge', data);
  },

  async getKnowledge(category?: string): Promise<any[]> {
    return apiClient.get('/api/v1/ai/concierge/knowledge', { category });
  },
};
