import axios from "axios";
import { GUEST_TOKEN_KEY } from "./constants";

const DEFAULT_REMOTE_URL = "https://omnistay-backend.onrender.com";

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? DEFAULT_REMOTE_URL : "http://localhost:4000");

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach guest JWT if present
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(GUEST_TOKEN_KEY);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor — handle 401 gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(GUEST_TOKEN_KEY);
        // Redirect to login only if on a protected page
        const protectedPaths = ["/guest", "/checkout", "/cart"];
        const isProtected = protectedPaths.some((p) =>
          window.location.pathname.startsWith(p)
        );
        if (isProtected) {
          window.location.href = "/auth/login?redirect=" + encodeURIComponent(window.location.pathname);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

