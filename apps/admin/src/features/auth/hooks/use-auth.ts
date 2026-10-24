'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService, LoginResponse } from '../services/auth.service';
import { LoginFormData, ForgotPasswordFormData, ResetPasswordFormData, Verify2faFormData } from '../schemas/login.schema';
import { sessionManager } from '@/lib/auth/session';
import { useTenantStore } from '@/stores/tenant-store';
import { useUiStore } from '@/stores/ui-store';
import { Role } from '@/lib/auth/permissions';

export function useAuth() {
  const router = useRouter();
  const { setTenantId } = useTenantStore();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      try {
        return await authService.login(data);
      } catch (err: any) {
        // If backend is unreachable or in standalone demo mode, synthesize session based on email
        if (!err.response || err.response.status >= 500 || err.code === 'ERR_NETWORK') {
          const emailLower = data.email.toLowerCase();
          let detectedRole = Role.COMPANY_OWNER_GM;
          if (emailLower.includes('superadmin') || emailLower === 'admin@omnistay.com') {
            detectedRole = Role.PLATFORM_SUPERADMIN;
          } else if (emailLower.includes('frontdesk')) {
            detectedRole = Role.FRONT_DESK_AGENT;
          } else if (emailLower.includes('finance') || emailLower.includes('accountant') || emailLower.includes('cfo')) {
            detectedRole = Role.CFO_ACCOUNTANT;
          } else if (emailLower.includes('housekeep')) {
            detectedRole = Role.HOUSEKEEPING_SUPERVISOR;
          } else if (emailLower.includes('pos') || emailLower.includes('cashier')) {
            detectedRole = Role.POS_CASHIER;
          } else if (emailLower.includes('hr')) {
            detectedRole = Role.HR_DIRECTOR;
          }

          return {
            accessToken: 'demo-jwt-token-' + Date.now(),
            refreshToken: 'demo-refresh-token-' + Date.now(),
            requires2FA: false,
            user: {
              id: 'usr-' + Date.now(),
              email: data.email,
              name: data.email.split('@')[0].toUpperCase(),
              role: detectedRole,
              tenantId: 'tenant-1',
            },
          } as LoginResponse;
        }
        throw err;
      }
    },
    onSuccess: (res: LoginResponse) => {
      if (res.requires2FA) {
        if (res.challengeToken) {
          sessionManager.setToken(res.challengeToken);
        }
        router.push('/verify-2fa');
        return;
      }

      const activeRole = (res.user.role as Role) || Role.PLATFORM_SUPERADMIN;

      sessionManager.setToken(res.accessToken, res.refreshToken);
      sessionManager.setUser({
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        role: activeRole,
        tenantId: res.user.tenantId,
        permissions: ['*'],
      });

      setTenantId(res.user.tenantId);
      useUiStore.getState().setActiveRole(activeRole);
      router.push('/dashboard');
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordFormData) => authService.forgotPassword(data),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ data, token }: { data: ResetPasswordFormData; token: string }) =>
      authService.resetPassword(data, token),
    onSuccess: () => {
      router.push('/login');
    },
  });

  const verify2faMutation = useMutation({
    mutationFn: (data: Verify2faFormData) => authService.verify2fa(data),
    onSuccess: (res: LoginResponse) => {
      sessionManager.setToken(res.accessToken, res.refreshToken);
      sessionManager.setUser({
        id: res.user.id,
        email: res.user.email,
        name: res.user.name,
        role: res.user.role || Role.PLATFORM_SUPERADMIN,
        tenantId: res.user.tenantId,
        permissions: ['*'],
      });
      router.push('/dashboard');
    },
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    forgotPassword: forgotPasswordMutation.mutate,
    isForgotPasswordLoading: forgotPasswordMutation.isPending,
    resetPassword: resetPasswordMutation.mutate,
    isResetPasswordLoading: resetPasswordMutation.isPending,
    verify2fa: verify2faMutation.mutate,
    isVerifying2fa: verify2faMutation.isPending,
  };
}
