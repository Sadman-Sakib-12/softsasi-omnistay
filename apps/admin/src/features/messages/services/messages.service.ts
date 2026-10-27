import { api } from '@/lib/api/client';

export interface ChatMessageItem {
  id: string;
  sender: string;
  text: string;
  time: string;
  isStaff: boolean;
  channelId?: string;
}

export interface ChatChannelItem {
  id: string;
  channelName: string;
  isPrivate: boolean;
}

export interface SendMessageDto {
  toId?: string;
  channelId?: string;
  body: string;
}

export const messagesService = {
  getChannels: async (): Promise<ChatChannelItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/communications/chat/channels');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((c: any) => ({
        id: c.id,
        channelName: c.channelName || c.name || '',
        isPrivate: !!c.isPrivate,
      }));
    } catch (error) {
      return [];
    }
  },

  getMessages: async (channelId: string): Promise<ChatMessageItem[]> => {
    try {
      const res = await api.get<any>(`/api/v1/communications/chat/channels/${channelId}/messages`);
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((m: any) => ({
        id: m.id,
        sender: m.fromUser?.name || m.senderName || '',
        text: m.body || m.text || '',
        time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        isStaff: !!m.isStaff,
        channelId: m.channelId,
      }));
    } catch (error) {
      return [];
    }
  },

  sendMessage: async (dto: SendMessageDto): Promise<ChatMessageItem> => {
    const res = await api.post<any>('/api/v1/communications/chat/messages', dto);
    return {
      id: res.id || `msg-${Date.now()}`,
      sender: 'Front Desk Agent (You)',
      text: dto.body,
      time: 'Just now',
      isStaff: true,
      channelId: dto.channelId,
    };
  },
};
