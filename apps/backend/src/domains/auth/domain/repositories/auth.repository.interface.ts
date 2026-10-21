export const AUTH_REPOSITORY_TOKEN = Symbol('IAuthRepository');

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<any | null>;
  findUserById(userId: string): Promise<any | null>;
  updateUser(userId: string, data: Record<string, any>): Promise<any>;
  createRefreshToken(data: any): Promise<any>;
  findRefreshToken(tokenHash: string): Promise<any | null>;
  revokeRefreshToken(id: string): Promise<any>;
  revokeAllUserRefreshTokens(userId: string): Promise<any>;
}
