import { create } from 'zustand';
import { Role, normalizeRole } from '@/lib/auth/permissions';

const getInitialRole = (): Role => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('omnistay_user_session');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.role) return normalizeRole(parsed.role);
      } catch {}
    }
  }
  return Role.COMPANY_OWNER_GM;
};

interface UiState {
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';
  activeRole: Role;
  isCommandPaletteOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setActiveRole: (role: Role) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  theme: 'dark',
  activeRole: getInitialRole(),
  isCommandPaletteOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setActiveRole: (role) => set({ activeRole: role }),
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('omnistay_theme', nextTheme);
        document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      }
      return { theme: nextTheme };
    }),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('omnistay_theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    set({ theme });
  },
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
}));
