export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  organizationName?: string;
  organizationSlug?: string;
  permissions: string[];
}

const TOKEN_KEY = 'omnistay_access_token';
const REFRESH_TOKEN_KEY = 'omnistay_refresh_token';
const TENANT_KEY = 'omnistay_tenant_id';
const USER_KEY = 'omnistay_user_session';

export const sessionManager = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  getTenantId(): string {
    if (typeof window === 'undefined') return '';
    const stored = localStorage.getItem(TENANT_KEY);
    if (stored && stored !== '0646902b-6163-4729-9901-6282ad7236e3') {
      return stored;
    }
    const user = this.getUser();
    return user?.tenantId || '';
  },

  setTenantId(tenantId: string): void {
    if (typeof window === 'undefined') return;
    if (tenantId) {
      localStorage.setItem(TENANT_KEY, tenantId);
    } else {
      localStorage.removeItem(TENANT_KEY);
    }
  },

  getUser(): UserSession | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setUser(user: UserSession): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },
};
