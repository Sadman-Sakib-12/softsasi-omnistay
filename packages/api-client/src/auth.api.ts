import { apiClient, ApiClient } from './client.js';

export interface LoginDto {
  email: string;
  password?: string;
  pin?: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  phone?: string;
  propertyType?: string;
}

export interface Verify2faDto {
  challengeToken: string;
  code: string;
}

export function createAuthApi(client: ApiClient = apiClient) {
  return {
    async register(dto: RegisterDto): Promise<any> {
      const res = await client.post<any>('/api/v1/auth/register', dto);
      if (res?.accessToken) {
        client.setToken(res.accessToken);
      }
      return res;
    },

    async login(dto: LoginDto): Promise<any> {
      const res = await client.post<any>('/api/v1/auth/login', dto);
      if (res?.accessToken) {
        client.setToken(res.accessToken);
      }
      return res;
    },

    async verify2fa(dto: Verify2faDto): Promise<any> {
      const res = await client.post<any>('/api/v1/auth/2fa/verify', dto);
      if (res?.accessToken) {
        client.setToken(res.accessToken);
      }
      return res;
    },

    async getProfile(): Promise<any> {
      return client.get('/api/v1/auth/me');
    },

    async logout(): Promise<void> {
      try {
        await client.post('/api/v1/auth/logout');
      } finally {
        client.setToken(null);
      }
    },
  };
}

export const authApi = createAuthApi(apiClient);

