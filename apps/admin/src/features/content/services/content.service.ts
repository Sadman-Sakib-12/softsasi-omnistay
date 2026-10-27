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

  createPage: async (dto: Partial<CustomPageItem>): Promise<CustomPageItem> => {
    return await api.post<CustomPageItem>('/api/v1/system/pages', dto);
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
  getMenus: async (): Promise<NavigationMenuItem[]> => {
    try {
      const res = await api.get<any>('/api/v1/system/menus');
      return Array.isArray(res) ? res : res?.data || [];
    } catch (error) {
      return [];
    }
  },

  createMenuItem: async (item: Partial<NavigationMenuItem>): Promise<NavigationMenuItem> => {
    return await api.post<NavigationMenuItem>('/api/v1/system/menus', item);
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
};
