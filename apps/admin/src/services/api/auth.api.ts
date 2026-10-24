import { apiClient } from './client';

export interface LoginDto {
  email: string;
  password?: string;
  pin?: string;
  rememberMe?: boolean;
}

export interface Verify2faDto {
  challengeToken: string;
  code: string;
}

export const authApi = {
  async login(dto: LoginDto): Promise<any> {
    const res = await apiClient.post<any>('/api/v1/auth/login', dto);
    if (res.accessToken) {
      apiClient.setToken(res.accessToken);
    }
    return res;
  },

  async verify2fa(dto: Verify2faDto): Promise<any> {
    const res = await apiClient.post<any>('/api/v1/auth/2fa/verify', dto);
    if (res.accessToken) {
      apiClient.setToken(res.accessToken);
    }
    return res;
  },

  async getProfile(): Promise<any> {
    return apiClient.get('/api/v1/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } finally {
      apiClient.setToken(null);
    }
  },
};
