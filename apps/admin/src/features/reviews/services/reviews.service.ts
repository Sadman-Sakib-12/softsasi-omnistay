import { api } from '@/lib/api/client';

export interface ReviewItem {
  id: string;
  guestName: string;
  property: string;
  rating: number;
  criteria: {
    cleanliness: number;
    location: number;
    service: number;
    value: number;
  };
  comment: string;
  verifiedStay: boolean;
  date: string;
  status: string;
  hostReply?: {
    text: string;
    date: string;
  };
}

export const reviewsService = {
  getAll: async (): Promise<ReviewItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/marketplace/reviews');
      const data = Array.isArray(res) ? res : res?.data || [];
      return data.map((r: any) => ({
        id: r.id,
        guestName: r.guestName || r.authorName || '',
        property: r.propertyName || r.booking?.property?.name || '',
        rating: Number(r.rating || 0),
        criteria: {
          cleanliness: Number(r.cleanlinessRating || 0),
          location: Number(r.locationRating || 0),
          service: Number(r.serviceRating || 0),
          value: Number(r.valueRating || 0),
        },
        comment: r.content || r.comment || '',
        verifiedStay: r.isVerifiedStay !== false,
        date: r.createdAt ? r.createdAt.split('T')[0] : '',
        status: r.status || 'Approved',
        hostReply: r.hostReply ? { text: r.hostReply, date: r.repliedAt || '' } : undefined,
      }));
    } catch (error) {
      return [];
    }
  },

  reply: async (id: string, replyText: string): Promise<any> => {
    return await api.post(`/api/v1/marketplace/reviews/${id}/reply`, {
      reply: replyText,
    });
  },
};
