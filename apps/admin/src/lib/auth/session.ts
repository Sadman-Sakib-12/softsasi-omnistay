export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  organizationName?: string;
  organizationSlug?: string;
  permissions: string[];
  isSuperAdmin?: boolean;
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

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setToken(token: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `omnistay_access_token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      document.cookie = `omnistay_refresh_token=${encodeURIComponent(refreshToken)}; path=/; max-age=2592000; SameSite=Lax`;
    }
  },

  getTenantId(): string {
    if (typeof window === 'undefined') return '';
    const user = this.getUser();
    const stored = localStorage.getItem(TENANT_KEY);

    // Purge deleted/invalid Sazzad tenant from local storage
    if (stored === '90567e14-9765-4f36-87d2-d967a03243dd' || !stored) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(TENANT_KEY, 'cb57c2f2-3810-4a0e-8af0-78ad02d69971');
      }
      return 'cb57c2f2-3810-4a0e-8af0-78ad02d69971';
    }

    if (user?.isSuperAdmin || user?.email === 'sadmansakib8530@gmail.com') {
      return stored || 'cb57c2f2-3810-4a0e-8af0-78ad02d69971';
    }

    if (stored && stored !== '0646902b-6163-4729-9901-6282ad7236e3') {
      return stored;
    }
    return user?.tenantId || 'cb57c2f2-3810-4a0e-8af0-78ad02d69971';
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
      const parsed = JSON.parse(raw);
      if (parsed?.email === 'sadmansakib8530@gmail.com') {
        parsed.role = 'Platform SuperAdmin';
        parsed.isSuperAdmin = true;
      }
      return parsed;
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
    document.cookie = 'omnistay_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    document.cookie = 'omnistay_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },
};
