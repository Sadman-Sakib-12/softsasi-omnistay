import { api } from '@/lib/api/client';

export interface NewsArticleItem {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  views: number;
  status: string;
  content?: string;
}

export interface CustomPageItem {
  id: string;
  title: string;
  slug: string;
  template: string;
  updated: string;
  status: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface MediaAssetItem {
  id: string;
  name: string;
  size: string;
  path: string;
  date: string;
}

export interface NavigationMenuItem {
  id: string;
  title: string;
  url: string;
  target: string;
  order?: number;
  location?: 'header' | 'footer' | 'guest';
  isActive?: boolean;
}

export interface PopupModalItem {
  id: string;
  title: string;
  trigger: string;
  impressions: number;
  status: string;
}

export interface ThemeConfig {
  activeThemeId: string;
  primaryColor: string;
  mode: 'light' | 'dark' | 'system';
}

export interface ThemeCatalogItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  author: string;
  version: string;
  screenshotUrl: string;
  primaryColor: string;
  accentColor: string;
  secondaryColor?: string;
  backgroundColor?: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: string;
  isCustom?: boolean;
  isActive?: boolean;
  bannerUrl?: string;
  createdAt: string;
}

export interface WebsiteCustomizerConfig {
  activeThemeId: string;
  primaryColor: string;
  accentColor: string;
  mode: 'light' | 'dark' | 'system';
  siteTitle: string;
  siteTagline: string;
  logoUrl: string;
  logoDarkUrl: string;
  headerSticky: boolean;
  headerCtaText: string;
  headerCtaLink: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBannerUrl: string;
  heroOverlayOpacity: number;
  searchTabs: string[];
  searchButtonText: string;
  searchButtonColor: string;
  featureCard1: {
    badge: string;
    title: string;
    bg: string;
    imageUrl: string;
  };
  featureCard2: {
    title: string;
    bg: string;
    icon: string;
  };
  featureCard3: {
    title: string;
    bg: string;
    icon: string;
  };
  sections: {
    hero: boolean;
    featureCards: boolean;
    featuredStays: boolean;
    trendingTours: boolean;
    verticals: boolean;
    newsletter: boolean;
  };
  footerAboutText: string;
  footerCopyright: string;
  socialLinks: Record<string, string>;
}

export const contentService = {
  // News
  getNews: async (): Promise<NewsArticleItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/system/news');
      return Array.isArray(res) ? res : res?.data || [];
    } catch (error) {
      return [];
    }
  },

  createNews: async (dto: Partial<NewsArticleItem>): Promise<NewsArticleItem> => {
    return await api.post<NewsArticleItem>('/api/v1/system/news', dto);
  },

  updateNews: async (id: string, dto: Partial<NewsArticleItem>): Promise<NewsArticleItem> => {
    return await api.patch<NewsArticleItem>(`/api/v1/system/news/${id}`, dto);
  },

  deleteNews: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/system/news/${id}`);
  },

  // Pages
  getPages: async (): Promise<CustomPageItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/system/pages');
      return Array.isArray(res) ? res : res?.data || [];
    } catch (error) {
      return [];
    }
  },

  getPageBySlug: async (slug: string): Promise<CustomPageItem | null> => {
    try {
      const cleanSlug = encodeURIComponent(slug);
      return await api.get<CustomPageItem>(`/api/v1/system/pages/${cleanSlug}`);
    } catch (error) {
      return null;
    }
  },

  createPage: async (dto: Partial<CustomPageItem>): Promise<CustomPageItem> => {
    return await api.post<CustomPageItem>('/api/v1/system/pages', dto);
  },

  updatePage: async (id: string, dto: Partial<CustomPageItem>): Promise<CustomPageItem> => {
    return await api.patch<CustomPageItem>(`/api/v1/system/pages/${id}`, dto);
  },

  deletePage: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/system/pages/${id}`);
  },

  // Media
  getMedia: async (): Promise<MediaAssetItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/system/media');
      return Array.isArray(res) ? res : res?.data || [];
    } catch (error) {
      return [];
    }
  },

  uploadMedia: async (data: { name: string; size: string; path: string }): Promise<MediaAssetItem> => {
    return await api.post<MediaAssetItem>('/api/v1/system/media/upload', data);
  },

  deleteMedia: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/system/media/${id}`);
  },

  // Menus
  getMenus: async (location?: 'header' | 'footer' | 'guest'): Promise<NavigationMenuItem[]> => {
    try {
      const url = location ? `/api/v1/system/menus?location=${location}` : '/api/v1/system/menus';
      const res = await api.get<any>(url);
      return Array.isArray(res) ? res : res?.data || [];
    } catch (error) {
      return [];
    }
  },

  createMenuItem: async (item: Partial<NavigationMenuItem>): Promise<NavigationMenuItem> => {
    return await api.post<NavigationMenuItem>('/api/v1/system/menus', item);
  },

  updateMenuItem: async (id: string, item: Partial<NavigationMenuItem>): Promise<NavigationMenuItem> => {
    return await api.patch<NavigationMenuItem>(`/api/v1/system/menus/${id}`, item);
  },

  reorderMenuItems: async (items: { id: string; order: number }[]): Promise<NavigationMenuItem[]> => {
    return await api.post<NavigationMenuItem[]>('/api/v1/system/menus/reorder', { items });
  },

  deleteMenuItem: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/system/menus/${id}`);
  },

  // Popups
  getPopups: async (): Promise<PopupModalItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/system/popups');
      return Array.isArray(res) ? res : res?.data || [];
    } catch (error) {
      return [];
    }
  },

  createPopup: async (dto: Partial<PopupModalItem>): Promise<PopupModalItem> => {
    return await api.post<PopupModalItem>('/api/v1/system/popups', dto);
  },

  updatePopup: async (id: string, dto: Partial<PopupModalItem>): Promise<PopupModalItem> => {
    return await api.patch<PopupModalItem>(`/api/v1/system/popups/${id}`, dto);
  },

  togglePopupStatus: async (id: string): Promise<any> => {
    return await api.patch(`/api/v1/system/popups/${id}/status`);
  },

  deletePopup: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/system/popups/${id}`);
  },

  // Themes
  getThemeConfig: async (): Promise<ThemeConfig> => {
    try {
      return await api.get<ThemeConfig>('/api/v1/system/themes');
    } catch (error) {
      return {
        activeThemeId: 'enterprise-blue',
        primaryColor: '#00a8ff',
        mode: 'light',
      };
    }
  },

  updateThemeConfig: async (config: Partial<ThemeConfig>): Promise<ThemeConfig> => {
    return await api.put<ThemeConfig>('/api/v1/system/themes', config);
  },

  // WordPress-Style Themes Catalog & Creator
  getThemeCatalog: async (): Promise<ThemeCatalogItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/system/themes/catalog');
      return Array.isArray(res) ? res : res?.data || [];
    } catch {
      return [];
    }
  },

  createTheme: async (dto: Partial<ThemeCatalogItem>): Promise<ThemeCatalogItem> => {
    return await api.post<ThemeCatalogItem>('/api/v1/system/themes/catalog', dto);
  },

  activateTheme: async (id: string): Promise<{ success: boolean; activeTheme: ThemeCatalogItem }> => {
    return await api.post(`/api/v1/system/themes/catalog/${id}/activate`);
  },

  duplicateTheme: async (id: string, name?: string): Promise<ThemeCatalogItem> => {
    return await api.post<ThemeCatalogItem>(`/api/v1/system/themes/catalog/${id}/duplicate`, { name });
  },

  deleteTheme: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/system/themes/catalog/${id}`);
  },

  // Website Customizer (WordPress / Shopify-style Live Visual Builder)
  getWebsiteCustomizer: async (): Promise<WebsiteCustomizerConfig> => {
    return await api.get<WebsiteCustomizerConfig>('/api/v1/system/website-customizer');
  },

  updateWebsiteCustomizer: async (data: Partial<WebsiteCustomizerConfig>): Promise<WebsiteCustomizerConfig> => {
    return await api.put<WebsiteCustomizerConfig>('/api/v1/system/website-customizer', data);
  },
};
