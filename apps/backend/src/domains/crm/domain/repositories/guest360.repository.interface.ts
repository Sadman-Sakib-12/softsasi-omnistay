export const GUEST360_REPOSITORY_TOKEN = Symbol('IGuest360Repository');

export interface IGuest360Repository {
  findProfileByUserId(userId: string): Promise<any | null>;
  createProfile(data: {
    userId: string;
    lifetimeSpend: number;
    totalNights: number;
    vipTier: string;
  }): Promise<any>;
  updateProfile(userId: string, data: Record<string, any>): Promise<any>;
  addPreference(data: { profileId: string; preferenceKey: string; preferenceVal: string }): Promise<any>;
  addDietary(data: { profileId: string; restriction: string; notes?: string }): Promise<any>;
  createSurvey(data: {
    bookingId: string;
    ratingScore: number;
    comments?: string;
    answers?: Array<{ question: string; answerText: string }>;
  }): Promise<any>;
}
