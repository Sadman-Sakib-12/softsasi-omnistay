import { apiClient, ApiClient } from './client.js';

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

export function createAiApi(client: ApiClient = apiClient) {
  return {
    async chat(payload: AiChatMessage): Promise<any> {
      return client.post('/api/v1/ai/concierge/chat', {
        tenantId: payload.tenantId || client.getTenantId(),
        ...payload,
      });
    },

    async getConfig(): Promise<AiConfigDto> {
      return client.get('/api/v1/ai/concierge/config');
    },

    async updateConfig(config: AiConfigDto): Promise<any> {
      return client.post('/api/v1/ai/concierge/config', config);
    },

    async addKnowledge(data: { title: string; content: string; category?: string }): Promise<any> {
      return client.post('/api/v1/ai/concierge/knowledge', data);
    },

    async getKnowledge(category?: string): Promise<any[]> {
      return client.get('/api/v1/ai/concierge/knowledge', { category });
    },
  };
}

export const aiApi = createAiApi(apiClient);

