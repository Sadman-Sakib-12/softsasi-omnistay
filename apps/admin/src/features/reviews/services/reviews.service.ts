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
      return data.map((r: any) => {
        const findScore = (dim: string) => {
          const item = r.ratings?.find((x: any) => x.dimension?.toLowerCase().includes(dim.toLowerCase()));
          return item ? Number(item.score) : 5;
        };
        const hostReply = r.hostReplies?.[0]?.replyText || r.hostReply?.text || (typeof r.hostReply === 'string' ? r.hostReply : undefined);
        return {
          id: r.id,
          guestName: r.guestName || r.authorName || 'Verified Guest',
          property: r.propertyName || r.booking?.property?.name || 'OmniStay Grand Resort',
          rating: Number(r.overallScore || r.rating || 5),
          criteria: {
            cleanliness: r.cleanlinessRating ? Number(r.cleanlinessRating) : findScore('clean'),
            location: r.locationRating ? Number(r.locationRating) : findScore('loc'),
            service: r.serviceRating ? Number(r.serviceRating) : findScore('serv'),
            value: r.valueRating ? Number(r.valueRating) : findScore('val'),
          },
          comment: r.content || r.comment || '',
          verifiedStay: r.isVerifiedStay !== false,
          date: r.createdAt ? r.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          status: r.status || 'Approved',
          hostReply: hostReply
            ? { text: hostReply, date: r.hostReplies?.[0]?.repliedAt || r.repliedAt || '' }
            : undefined,
        };
      });
    } catch (error) {
      return [];
    }
  },

  reply: async (id: string, replyText: string): Promise<any> => {
    return await api.post(`/api/v1/marketplace/reviews/${id}/reply`, {
      replyText: replyText,
      reply: replyText,
    });
  },
};
