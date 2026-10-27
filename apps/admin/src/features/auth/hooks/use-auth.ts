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
      return await authService.login(data);
    },
    onSuccess: (res: any) => {
      if (res.requires2fa || res.requires2FA) {
        const token = res.tempToken || res.challengeToken || res.accessToken;
        if (token) {
          sessionManager.setToken(token);
        }
        router.push('/verify-2fa');
        return;
      }

      const activeRole = (res.role as Role) || (res.user?.role as Role) || Role.PLATFORM_SUPERADMIN;
      const tenantId = res.organization?.id || res.user?.tenantId || '';

      sessionManager.setToken(res.accessToken, res.refreshToken);
      sessionManager.setUser({
        id: res.user?.id || '',
        email: res.user?.email || '',
        name: res.user?.name || '',
        role: activeRole,
        tenantId: tenantId,
        organizationName: res.organization?.name || '',
        organizationSlug: res.organization?.slug || '',
        permissions: res.permissions || res.user?.permissions || [],
      });

      if (tenantId) {
        setTenantId(tenantId);
      }
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
    onSuccess: (res: any) => {
      const activeRole = (res.role as Role) || (res.user?.role as Role) || Role.PLATFORM_SUPERADMIN;
      const tenantId = res.organization?.id || res.user?.tenantId || '';

      sessionManager.setToken(res.accessToken, res.refreshToken);
      sessionManager.setUser({
        id: res.user?.id || '',
        email: res.user?.email || '',
        name: res.user?.name || '',
        role: activeRole,
        tenantId: tenantId,
        permissions: res.permissions || ['*'],
      });

      if (tenantId) {
        setTenantId(tenantId);
      }
      useUiStore.getState().setActiveRole(activeRole);
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
