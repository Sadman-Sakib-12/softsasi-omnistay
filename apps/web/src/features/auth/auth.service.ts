import apiClient from "@/lib/api-client";
import { GUEST_TOKEN_KEY, GUEST_USER_KEY } from "@/lib/constants";

export interface GuestUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  walletBalance?: number;
  loyaltyTier?: "Bronze Explorer" | "Silver Voyager" | "Gold Elite" | "Platinum Ambassador";
  loyaltyPoints?: number;
}

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

export const GuestAuthService = {
  /**
   * Guest Login via real backend API (/api/v1/auth/login)
   */
  async login(data: { email: string; password: string }): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/login", data);
    const { accessToken, user } = response.data;

    if (typeof window !== "undefined") {
      localStorage.setItem(GUEST_TOKEN_KEY, accessToken);
      localStorage.setItem(GUEST_USER_KEY, JSON.stringify(user));
    }

    return response.data;
  },

  /**
   * Guest Registration via real backend API (/api/v1/auth/register)
   */
  async register(data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<any> {
    const response = await apiClient.post("/auth/register", {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      companyName: `${data.fullName}'s Travel Account`,
      phone: data.phone,
      propertyType: "Guest",
    });

    return response.data;
  },

  /**
   * Verify email via 6-digit code (/api/v1/auth/verify-email)
   */
  async verifyEmail(email: string, code: string): Promise<any> {
    const response = await apiClient.post("/auth/verify-email", {
      email,
      code,
    });

    if (response.data?.accessToken && typeof window !== "undefined") {
      localStorage.setItem(GUEST_TOKEN_KEY, response.data.accessToken);
      if (response.data.user) {
        localStorage.setItem(GUEST_USER_KEY, JSON.stringify(response.data.user));
      }
    }

    return response.data;
  },

  /**
   * Resend activation code (/api/v1/auth/resend-verification)
   */
  async resendVerification(email: string): Promise<any> {
    const response = await apiClient.post("/auth/resend-verification", { email });
    return response.data;
  },

  /**
   * Password reset request (/api/v1/auth/password-reset/request)
   */
  async forgotPassword(email: string): Promise<any> {
    const response = await apiClient.post("/auth/password-reset/request", { email });
    return response.data;
  },

  /**
   * Password reset confirm (/api/v1/auth/password-reset/confirm)
   */
  async resetPassword(token: string, newPassword: string): Promise<any> {
    const response = await apiClient.post("/auth/password-reset/confirm", {
      token,
      newPassword,
    });
    return response.data;
  },

  /**
   * Get currently logged-in guest user from localStorage
   */
  getStoredUser(): GuestUser | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(GUEST_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if guest is authenticated
   */
  isLoggedIn(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(GUEST_TOKEN_KEY);
  },

  /**
   * Log out guest
   */
  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(GUEST_TOKEN_KEY);
      localStorage.removeItem(GUEST_USER_KEY);
      window.location.href = "/";
    }
  },
};
