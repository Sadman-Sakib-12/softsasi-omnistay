import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';

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

export interface AuditLogItem {
  id: string;
  action: string;
  user: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  timestamp: string;
}

@Injectable()
export class SystemContentService {
  constructor(private readonly prisma: PrismaService) {}

  // Content collections backed by system service (empty by default; populated via Admin UI or DB)
  private newsArticles: NewsArticleItem[] = [];
  private staticPages: CustomPageItem[] = [];
  private mediaAssets: MediaAssetItem[] = [];
  private navMenus: NavigationMenuItem[] = [];
  private popups: PopupModalItem[] = [];
  private auditLogs: AuditLogItem[] = [];

  private themeConfig: ThemeConfig = {
    activeThemeId: 'enterprise-blue',
    primaryColor: '#00a8ff',
    mode: 'light',
  };

  // --- News Articles ---
  getNewsArticles(): NewsArticleItem[] {
    return this.newsArticles;
  }

  createNewsArticle(data: Partial<NewsArticleItem>): NewsArticleItem {
    const newArticle: NewsArticleItem = {
      id: `art-${Date.now()}`,
      title: data.title || '',
      category: data.category || 'General',
      author: data.author || '',
      date: new Date().toISOString().split('T')[0],
      views: 0,
      status: data.status || 'Published',
      content: data.content || '',
    };
    this.newsArticles.unshift(newArticle);
    return newArticle;
  }

  deleteNewsArticle(id: string): boolean {
    const idx = this.newsArticles.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.newsArticles.splice(idx, 1);
      return true;
    }
    return false;
  }

  // --- Pages ---
  getPages(): CustomPageItem[] {
    return this.staticPages;
  }

  createPage(data: Partial<CustomPageItem>): CustomPageItem {
    const newPage: CustomPageItem = {
      id: `p-${Date.now()}`,
      title: data.title || '',
      slug: data.slug || (data.title ? `/${data.title.toLowerCase().replace(/\s+/g, '-')}` : ''),
      template: data.template || 'Standard Template',
      updated: new Date().toISOString().split('T')[0],
      status: data.status || 'Published',
      content: data.content || '',
    };
    this.staticPages.push(newPage);
    return newPage;
  }

  deletePage(id: string): boolean {
    const idx = this.staticPages.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.staticPages.splice(idx, 1);
      return true;
    }
    return false;
  }

  // --- Media Assets ---
  getMediaAssets(): MediaAssetItem[] {
    return this.mediaAssets;
  }

  uploadMediaAsset(name: string, size: string, path: string): MediaAssetItem {
    const asset: MediaAssetItem = {
      id: `m-${Date.now()}`,
      name,
      size,
      path: path || '/images/hotel-banner.jpg',
      date: new Date().toISOString().split('T')[0],
    };
    this.mediaAssets.unshift(asset);
    return asset;
  }

  deleteMediaAsset(id: string): boolean {
    const idx = this.mediaAssets.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.mediaAssets.splice(idx, 1);
      return true;
    }
    return false;
  }

  // --- Navigation Menus ---
  getMenus(): NavigationMenuItem[] {
    return this.navMenus;
  }

  createMenuItem(item: Partial<NavigationMenuItem>): NavigationMenuItem {
    const newMenu: NavigationMenuItem = {
      id: `menu-${Date.now()}`,
      title: item.title || 'New Link',
      url: item.url || '/',
      target: item.target || '_self',
    };
    this.navMenus.push(newMenu);
    return newMenu;
  }

  deleteMenuItem(id: string): boolean {
    const idx = this.navMenus.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.navMenus.splice(idx, 1);
      return true;
    }
    return false;
  }

  // --- Popups ---
  getPopups(): PopupModalItem[] {
    return this.popups;
  }

  createPopup(data: Partial<PopupModalItem>): PopupModalItem {
    const newPopup: PopupModalItem = {
      id: `pop-${Date.now()}`,
      title: data.title || 'New Marketing Popup',
      trigger: data.trigger || 'On Load',
      impressions: 0,
      status: 'Active',
    };
    this.popups.unshift(newPopup);
    return newPopup;
  }

  togglePopupStatus(id: string): PopupModalItem | null {
    const popup = this.popups.find((p) => p.id === id);
    if (popup) {
      popup.status = popup.status === 'Active' ? 'Paused' : 'Active';
      return popup;
    }
    return null;
  }

  deletePopup(id: string): boolean {
    const idx = this.popups.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.popups.splice(idx, 1);
      return true;
    }
    return false;
  }

  // --- Themes ---
  getThemeConfig(): ThemeConfig {
    return this.themeConfig;
  }

  setThemeConfig(config: Partial<ThemeConfig>): ThemeConfig {
    this.themeConfig = { ...this.themeConfig, ...config };
    return this.themeConfig;
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLogItem[] {
    return this.auditLogs;
  }

  recordAuditLog(
    action: string,
    user: string,
    ipAddress = '127.0.0.1',
    status: 'SUCCESS' | 'WARNING' | 'FAILED' = 'SUCCESS',
  ): AuditLogItem {
    const item: AuditLogItem = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      user,
      ipAddress,
      status,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(item);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
    return item;
  }
}
