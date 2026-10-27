import { api } from '@/lib/api/client';
import { sessionManager } from '@/lib/auth/session';
import { LoginFormData, ForgotPasswordFormData, ResetPasswordFormData, Verify2faFormData } from '../schemas/login.schema';

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  requires2FA?: boolean;
  challengeToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
  };
}

export const authService = {
  register: async (data: {
    fullName: string;
    email: string;
    password: string;
    companyName: string;
    phone?: string;
    propertyType?: string;
  }): Promise<any> => {
    return await api.post<any>('/api/v1/auth/register', data);
  },

  login: async (data: LoginFormData): Promise<LoginResponse> => {
    return await api.post<LoginResponse>('/api/v1/auth/login', {
      email: data.email,
      password: data.password,
    });
  },

  forgotPassword: async (data: ForgotPasswordFormData): Promise<{ message: string }> => {
    return await api.post<{ message: string }>('/api/v1/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordFormData, token: string): Promise<{ message: string }> => {
    return await api.post<{ message: string }>('/api/v1/auth/reset-password', {
      ...data,
      token,
    });
  },

  verify2fa: async (data: Verify2faFormData & { tempToken?: string }): Promise<any> => {
    const tempToken = data.tempToken || sessionManager.getToken();
    return await api.post<any>('/api/v1/auth/2fa/verify', {
      tempToken,
      code: data.code,
    });
  },

  getProfile: async (): Promise<LoginResponse['user']> => {
    return await api.get<LoginResponse['user']>('/api/v1/auth/me');
  },
};
