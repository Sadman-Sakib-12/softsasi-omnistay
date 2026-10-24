'use client';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  permissions?: string[];
}

const TOKEN_KEY = 'omnistay_access_token';
const REFRESH_TOKEN_KEY = 'omnistay_refresh_token';
const TENANT_KEY = 'omnistay_tenant_id';
const USER_KEY = 'omnistay_user_session';

export const auth = {
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
    if (typeof window === 'undefined') {
      return '0646902b-6163-4729-9901-6282ad7236e3';
    }
    return (
      localStorage.getItem(TENANT_KEY) ||
      '0646902b-6163-4729-9901-6282ad7236e3'
    );
  },

  setTenantId(tenantId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TENANT_KEY, tenantId);
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

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },

  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
  },

  parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  },
};
