export const USER_REPOSITORY_TOKEN = Symbol('IUserRepository');

export interface IUserRepository {
  findProfileById(userId: string): Promise<any | null>;
  updateUser(userId: string, data: Record<string, any>): Promise<any>;
  findTenantMemberships(organizationId: string): Promise<any[]>;
}
