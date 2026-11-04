import apiClient from "@/lib/api-client";

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

export const DEFAULT_CUSTOMIZER_CONFIG: WebsiteCustomizerConfig = {
  activeThemeId: 'enterprise-blue',
  primaryColor: '#00a8ff',
  accentColor: '#0097e6',
  mode: 'light',
  siteTitle: 'SOFTSASI',
  siteTagline: 'Unified Hospitality PMS & Travel Marketplace',
  logoUrl: '/images/omnistay-logo.png',
  logoDarkUrl: '/images/omnistay-logo-dark.png',
  headerSticky: true,
  headerCtaText: 'BOOK NOW',
  headerCtaLink: '/stays',
  heroTitle: 'PRIVATE SEASIDE SANCTUARY',
  heroSubtitle: 'Experience unhurried luxury where contemporary elegance meets timeless hospitality across the world’s most breathtaking sanctuaries.',
  heroBannerUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=2400&q=85',
  heroOverlayOpacity: 0.55,
  searchTabs: ['hotel', 'space', 'tour', 'car', 'event', 'flight', 'boat'],
  searchButtonText: 'SEARCH',
  searchButtonColor: '#2577e3',
  featureCard1: {
    badge: 'HOLIDAY SALE',
    title: 'Special Offers',
    bg: '#00a2e8',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
  },
  featureCard2: {
    title: 'Newsletters',
    bg: '#3576ea',
    icon: 'Mail',
  },
  featureCard3: {
    title: 'Travel Tips',
    bg: '#e5b025',
    icon: 'Sun',
  },
  sections: {
    hero: true,
    featureCards: true,
    featuredStays: true,
    trendingTours: true,
    verticals: true,
    newsletter: true,
  },
  footerAboutText: 'OmniStay 360 is an enterprise multi-tenant PMS and travel engine powering luxury hotels, resorts, villas, and travel verticals worldwide.',
  footerCopyright: '© 2026 Softsasi OmniStay 360 Enterprise Suite. All Rights Reserved.',
  socialLinks: {
    facebook: 'https://facebook.com/softsasi',
    twitter: 'https://twitter.com/softsasi',
    instagram: 'https://instagram.com/softsasi',
    linkedin: 'https://linkedin.com/company/softsasi',
  },
};

export const CustomizerService = {
  async getConfig(): Promise<WebsiteCustomizerConfig> {
    try {
      const res = await apiClient.get<WebsiteCustomizerConfig>('/system/website-customizer');
      if (res.data && res.data.heroTitle) {
        return res.data;
      }
      return DEFAULT_CUSTOMIZER_CONFIG;
    } catch (e) {
      return DEFAULT_CUSTOMIZER_CONFIG;
    }
  },
};

