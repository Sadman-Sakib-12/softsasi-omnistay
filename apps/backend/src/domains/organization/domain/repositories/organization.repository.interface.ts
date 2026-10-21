export const ORGANIZATION_REPOSITORY_TOKEN = Symbol('IOrganizationRepository');

export interface IOrganizationRepository {
  findUserMemberships(userId: string): Promise<any[]>;
  findMembership(organizationId: string, userId: string): Promise<any | null>;
  findOrganizationById(orgId: string): Promise<any | null>;
  findOrganizationBySlug(slug: string): Promise<any | null>;
  createOrganizationWithDefaults(data: {
    name: string;
    slug: string;
    creatorUserId: string;
    defaultPermissions: string[];
  }): Promise<any>;
}
