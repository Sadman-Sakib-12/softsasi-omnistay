import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
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

export const DEFAULT_THEME_CATALOG: ThemeCatalogItem[] = [
  {
    id: 'enterprise-blue',
    name: 'Enterprise Royal Blue',
    slug: 'enterprise-royal-blue',
    description: 'Corporate luxury 5-star hotel theme with clean white layout and royal blue highlights.',
    author: 'OmniStay Core Team',
    version: '2.4.0',
    screenshotUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    primaryColor: '#00a8ff',
    accentColor: '#0097e6',
    secondaryColor: '#f8fafc',
    backgroundColor: '#ffffff',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    borderRadius: 'rounded-xl',
    isCustom: false,
    isActive: true,
    bannerUrl: 'https://images.unsplash.com/photo-1489058535093-8f530d789c3b?auto=format&fit=crop&w=2200&q=85',
    createdAt: '2026-01-01',
  },
  {
    id: 'emerald-luxury',
    name: 'Emerald Eco-Resort & Safari',
    slug: 'emerald-eco-resort',
    description: 'Organic rainforest & beachfront retreat theme with emerald green and champagne gold accents.',
    author: 'OmniStay Tropical Studio',
    version: '1.9.2',
    screenshotUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    primaryColor: '#10b981',
    accentColor: '#059669',
    secondaryColor: '#f0fdf4',
    backgroundColor: '#ffffff',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    borderRadius: 'rounded-2xl',
    isCustom: false,
    isActive: false,
    bannerUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=85',
    createdAt: '2026-02-15',
  },
  {
    id: 'gold-boutique',
    name: 'Gold Boutique Heritage Palace',
    slug: 'gold-boutique-heritage',
    description: 'Opulent imperial gold design for royal 5-star palace hotels and VIP boutique suites.',
    author: 'OmniStay Royal Heritage',
    version: '2.1.0',
    screenshotUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
    primaryColor: '#f59e0b',
    accentColor: '#d97706',
    secondaryColor: '#fffbeb',
    backgroundColor: '#ffffff',
    headingFont: 'Cinzel',
    bodyFont: 'Inter',
    borderRadius: 'rounded-lg',
    isCustom: false,
    isActive: false,
    bannerUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=2200&q=85',
    createdAt: '2026-03-10',
  },
  {
    id: 'midnight-dark',
    name: 'Midnight Executive Dark',
    slug: 'midnight-executive-dark',
    description: 'High-contrast luxury dark mode designed for modern urban penthouses and executive travel.',
    author: 'OmniStay Dark Labs',
    version: '3.0.0',
    screenshotUrl: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80',
    primaryColor: '#3b82f6',
    accentColor: '#2563eb',
    secondaryColor: '#0f172a',
    backgroundColor: '#020617',
    headingFont: 'Montserrat',
    bodyFont: 'Inter',
    borderRadius: 'rounded-xl',
    isCustom: false,
    isActive: false,
    bannerUrl: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=2200&q=85',
    createdAt: '2026-04-01',
  },
  {
    id: 'rose-romance',
    name: 'Rose Romance & Honeymoon Villa',
    slug: 'rose-romance-villa',
    description: 'Charming blush crimson & romantic aesthetic tailored for luxury wedding and honeymoon villas.',
    author: 'OmniStay Romance',
    version: '1.2.0',
    screenshotUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    primaryColor: '#e11d48',
    accentColor: '#be123c',
    secondaryColor: '#fff1f2',
    backgroundColor: '#ffffff',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    borderRadius: 'rounded-2xl',
    isCustom: false,
    isActive: false,
    bannerUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2200&q=85',
    createdAt: '2026-05-12',
  },
  {
    id: 'nordic-chalet',
    name: 'Nordic Alpine Chalet & Sanctuary',
    slug: 'nordic-alpine-chalet',
    description: 'Minimalist wood & slate design for snowy mountain lodges and eco-sanctuary cabins.',
    author: 'OmniStay Alpine',
    version: '1.5.0',
    screenshotUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
    primaryColor: '#0f766e',
    accentColor: '#115e59',
    secondaryColor: '#f0fdfa',
    backgroundColor: '#ffffff',
    headingFont: 'Poppins',
    bodyFont: 'Inter',
    borderRadius: 'rounded-lg',
    isCustom: false,
    isActive: false,
    bannerUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2200&q=85',
    createdAt: '2026-06-20',
  },
];

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
  
  // Hero (Figure 5.1 in Master PDF)
  heroTitle: string;
  heroSubtitle: string;
  heroBannerUrl: string;
  heroOverlayOpacity: number;
  searchTabs: string[];
  searchButtonText: string;
  searchButtonColor: string;
  
  // Feature Cards
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

  // Section Visibility
  sections: {
    hero: boolean;
    featureCards: boolean;
    featuredStays: boolean;
    trendingTours: boolean;
    verticals: boolean;
    newsletter: boolean;
  };

  // Footer & Social
  footerAboutText: string;
  footerCopyright: string;
  socialLinks: Record<string, string>;
}

export const DEFAULT_CUSTOMIZER_CONFIG: WebsiteCustomizerConfig = {
  activeThemeId: 'enterprise-blue',
  primaryColor: '#00a8ff',
  accentColor: '#0097e6',
  mode: 'light',
  siteTitle: 'OmniStay 360',
  siteTagline: 'Curated Luxury Stays & Handcrafted Travel Experiences',
  logoUrl: '/images/omnistay-logo.png',
  logoDarkUrl: '/images/omnistay-logo-dark.png',
  headerSticky: true,
  headerCtaText: 'Become a Partner',
  headerCtaLink: '/auth/register',
  heroTitle: 'Find Your Next Extraordinary Stay',
  heroSubtitle: 'Book handpicked 5-star suites, private beachfront villas, and bespoke journeys across 45+ premier destinations worldwide.',
  heroBannerUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=85',
  heroOverlayOpacity: 0.25,
  searchTabs: ['hotel', 'space', 'tour', 'car', 'event', 'flight', 'boat'],
  searchButtonText: 'Search Availability',
  searchButtonColor: '#00a8ff',
  featureCard1: {
    badge: 'SPECIAL OFFER · UP TO 35% OFF',
    title: 'Winter Sun & Overwater Escapes',
    bg: '#0f172a',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
  },
  featureCard2: {
    title: 'Private Villas & Alpine Chalets',
    bg: '#0f172a',
    icon: 'Home',
  },
  featureCard3: {
    title: 'Yacht Charters & VIP Chauffeurs',
    bg: '#0f172a',
    icon: 'Compass',
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

export interface AuditLogItem {
  id: string;
  action: string;
  user: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  timestamp: string;
}

const DEFAULT_NEWS: NewsArticleItem[] = [
  {
    id: 'art-001',
    title: 'OmniStay 360 Announces Next-Gen Hospitality AI & Cloud PMS Integration',
    category: 'Company News',
    author: 'Sakib Al Hasan',
    date: '2026-10-25',
    views: 1420,
    status: 'Published',
    content: 'We are thrilled to roll out our latest Cloud PMS architecture featuring automated USALI night auditing, dynamic yield management, and contactless guest experiences.',
  },
  {
    id: 'art-002',
    title: 'Top 10 Luxury Eco-Resorts Redefining Sustainable Travel in 2026',
    category: 'Travel Guides',
    author: 'Editorial Desk',
    date: '2026-10-28',
    views: 980,
    status: 'Published',
    content: 'Discover hand-picked sustainable getaways combining five-star luxury with carbon-neutral operations.',
  },
];

const DEFAULT_PAGES: CustomPageItem[] = [
  {
    id: 'page-001',
    title: 'About Us',
    slug: '/about',
    template: 'Standard Template',
    updated: '2026-10-20',
    status: 'Published',
    metaTitle: 'About OmniStay 360 & Softsasi Enterprise',
    metaDescription: 'Learn about our next-generation hospitality PMS and travel marketplace.',
    content: `# Next-Generation Autonomous Hospitality Cloud

Softsasi OmniStay 360 is Bangladesh's premier unified multi-vertical travel ecosystem, empowering guests with frictionless booking across luxury resorts, guided wildlife expeditions, executive car fleets, and private yacht charters.

### Core Capabilities
- **7+ Travel Verticals**: Stays, Tours, Cars, Boats, Spaces, Events, Flights.
- **100% Contactless Check-In**: Encrypted digital room keycards with mobile check-in.
- **24/7 AI Concierge**: Real-time travel assistant with autonomous recommendation and booking capabilities.
- **Bank-Grade Encryption**: 256-bit SSL, PCI-DSS Level 1 compliance for secure payments.`,
  },
  {
    id: 'page-002',
    title: 'Privacy Policy',
    slug: '/privacy',
    template: 'Legal Template',
    updated: '2026-10-20',
    status: 'Published',
    metaTitle: 'Privacy Policy | OmniStay 360',
    metaDescription: 'Global hospitality data protection policy complying with GDPR & CCPA.',
    content: `# Global Privacy Policy & Data Protection

### 1. Information We Collect
We collect personal identification information including full name, verified email address, phone number, and passport/NID documents required for contactless hospitality check-in.

### 2. How We Protect Your Data
All guest data and payment tokens are stored using AES-256 encryption. We strictly enforce multi-tenant cryptographic isolation.

### 3. Third-Party Sharing
We never sell guest information to marketing brokers. Data is only shared with verified property hosts to fulfill confirmed hotel room reservations and travel bookings.`,
  },
  {
    id: 'page-003',
    title: 'Terms of Service',
    slug: '/terms',
    template: 'Legal Template',
    updated: '2026-10-20',
    status: 'Published',
    metaTitle: 'Terms of Service & Guest Agreement | OmniStay 360',
    metaDescription: 'Platform terms governing booking cancellations, folios, and deposits.',
    content: `# Terms of Service & Guest Booking Agreement

### 1. Platform Services
Softsasi OmniStay 360 acts as a modern enterprise marketplace connecting registered travelers with certified hospitality properties, licensed tour operators, vehicle rental fleets, and private vessel operators.

### 2. Guest Verification & Safety
For security and regulatory compliance, guests accessing contactless check-in must provide valid government-issued photographic identification. Digital room keys and QR access tokens are strictly non-transferable.

### 3. Digital Stored-Value Wallet
Funds deposited into the OmniStay Stored-Value Wallet are held securely and may be redeemed against any confirmed travel reservation across our platform. Stored balances are non-interest bearing.

### 4. Cancellation & Refund Policy
Standard room reservations may be cancelled without penalty up to 48 hours prior to check-in. Non-refundable promotional rates and customized yacht charter bookings are governed by specific cancellation clauses displayed at checkout.`,
  },
  {
    id: 'page-004',
    title: 'Frequently Asked Questions',
    slug: '/faq',
    template: 'Standard Template',
    updated: '2026-10-20',
    status: 'Published',
    metaTitle: 'Help Center & FAQs | OmniStay 360',
    metaDescription: 'Instant answers to booking, check-in, and payment questions.',
    content: `# Frequently Asked Questions

### How does Contactless Self Check-In work?
Once your booking is confirmed, navigate to your Guest Portal and complete digital ID verification. Your encrypted dynamic QR code and smart digital room keycard will be activated upon scheduled check-in time.

### Can I book multi-vertical itineraries in one checkout?
Yes! OmniStay 360 features a Universal Cross-Vertical Cart allowing you to combine luxury hotel suites, airport chauffeur transfers, and guided safari tours in a single consolidated transaction.

### What payment methods are supported?
We support bKash, Nagad, Visa, MasterCard, American Express, direct bank transfers, and our zero-fee OmniStay Digital Wallet.`,
  },
  {
    id: 'page-005',
    title: 'Contact Concierge',
    slug: '/contact',
    template: 'Standard Template',
    updated: '2026-10-20',
    status: 'Published',
    metaTitle: 'Contact Concierge & Customer Care | OmniStay 360',
    metaDescription: 'Get in touch with our 24/7 hospitality concierge team.',
    content: `# Contact Concierge & VIP Guest Support

### Headquarters
Softsasi Enterprise Technologies  
Plot 42, Silicon Bay Commercial Zone  
Dhaka, Bangladesh  

### 24/7 Guest Helpline
- **Phone**: +880 1700-000000
- **Email**: concierge@softsasi.com
- **Live AI Concierge**: Accessible via the chat bubble in your guest portal.`,
  },
];

const DEFAULT_MENUS: NavigationMenuItem[] = [
  // Header Navigation Links
  { id: 'menu-001', title: 'Home', url: '/', target: '_self', order: 1, location: 'header', isActive: true },
  { id: 'menu-002', title: 'Hotel', url: '/stays', target: '_self', order: 2, location: 'header', isActive: true },
  { id: 'menu-003', title: 'Tours', url: '/tours', target: '_self', order: 3, location: 'header', isActive: true },
  { id: 'menu-004', title: 'Space', url: '/spaces', target: '_self', order: 4, location: 'header', isActive: true },
  { id: 'menu-005', title: 'Car', url: '/cars', target: '_self', order: 5, location: 'header', isActive: true },
  { id: 'menu-006', title: 'Event', url: '/events', target: '_self', order: 6, location: 'header', isActive: true },
  { id: 'menu-007', title: 'Flight', url: '/flights', target: '_self', order: 7, location: 'header', isActive: true },
  { id: 'menu-008', title: 'Boat', url: '/boats', target: '_self', order: 8, location: 'header', isActive: true },
  { id: 'menu-009', title: 'Pages', url: '/about', target: '_self', order: 9, location: 'header', isActive: true },

  // Footer Navigation Links
  { id: 'menu-010', title: 'Hotels & Resorts', url: '/stays', target: '_self', order: 1, location: 'footer', isActive: true },
  { id: 'menu-011', title: 'Guided Tours & Safaris', url: '/tours', target: '_self', order: 2, location: 'footer', isActive: true },
  { id: 'menu-012', title: 'Chauffeur Fleet Rental', url: '/cars', target: '_self', order: 3, location: 'footer', isActive: true },
  { id: 'menu-013', title: 'Yacht & Boat Charters', url: '/boats', target: '_self', order: 4, location: 'footer', isActive: true },
  { id: 'menu-014', title: 'Banquet & Coworking', url: '/spaces', target: '_self', order: 5, location: 'footer', isActive: true },
  { id: 'menu-015', title: 'About Softsasi 360', url: '/about', target: '_self', order: 6, location: 'footer', isActive: true },
  { id: 'menu-016', title: 'Terms of Service', url: '/terms', target: '_self', order: 7, location: 'footer', isActive: true },
  { id: 'menu-017', title: 'Privacy Policy', url: '/privacy', target: '_self', order: 8, location: 'footer', isActive: true },
  { id: 'menu-018', title: 'Help & FAQ Center', url: '/faq', target: '_self', order: 9, location: 'footer', isActive: true },
  { id: 'menu-019', title: 'Contact Concierge', url: '/contact', target: '_self', order: 10, location: 'footer', isActive: true },
];

@Injectable()
export class SystemContentService implements OnModuleInit {
  private readonly logger = new Logger(SystemContentService.name);

  private newsArticles: NewsArticleItem[] = [...DEFAULT_NEWS];
  private staticPages: CustomPageItem[] = [...DEFAULT_PAGES];
  private mediaAssets: MediaAssetItem[] = [];
  private navMenus: NavigationMenuItem[] = [...DEFAULT_MENUS];
  private popups: PopupModalItem[] = [];
  private auditLogs: AuditLogItem[] = [];

  private themeConfig: ThemeConfig = {
    activeThemeId: 'enterprise-blue',
    primaryColor: '#00a8ff',
    mode: 'light',
  };

  private themeCatalog: ThemeCatalogItem[] = [...DEFAULT_THEME_CATALOG];

  private customizerConfig: WebsiteCustomizerConfig = { ...DEFAULT_CUSTOMIZER_CONFIG };

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.loadPersistedContent();
  }

  private async loadPersistedContent() {
    try {
      if (!this.prisma.systemSetting) return;

      const settings = await this.prisma.systemSetting.findMany({
        where: { group: 'cms_content' },
      });

      const settingMap = new Map(settings.map((s) => [s.key, s.value]));

      if (settingMap.has('cms_news')) {
        this.newsArticles = JSON.parse(settingMap.get('cms_news')!);
      } else {
        await this.persistSetting('cms_news', this.newsArticles);
      }

      if (settingMap.has('cms_pages')) {
        const loadedPages = JSON.parse(settingMap.get('cms_pages')!);
        if (Array.isArray(loadedPages) && loadedPages.length > 0) {
          this.staticPages = loadedPages;
          for (const defP of DEFAULT_PAGES) {
            if (!this.staticPages.some((p) => p.slug === defP.slug)) {
              this.staticPages.push(defP);
            }
          }
        } else {
          this.staticPages = [...DEFAULT_PAGES];
        }
      } else {
        await this.persistSetting('cms_pages', this.staticPages);
      }

      if (settingMap.has('cms_media')) {
        this.mediaAssets = JSON.parse(settingMap.get('cms_media')!);
      }

      if (settingMap.has('cms_menus')) {
        const loadedMenus = JSON.parse(settingMap.get('cms_menus')!);
        if (Array.isArray(loadedMenus) && loadedMenus.length > 0) {
          this.navMenus = loadedMenus.map((m: any, idx: number) => ({
            ...m,
            location: m.location || 'header',
            order: m.order !== undefined ? m.order : idx + 1,
            isActive: m.isActive !== undefined ? m.isActive : true,
          }));
          const hasFooter = this.navMenus.some((m) => m.location === 'footer');
          if (!hasFooter) {
            const footerItems = DEFAULT_MENUS.filter((m) => m.location === 'footer');
            this.navMenus.push(...footerItems);
          }
        } else {
          this.navMenus = [...DEFAULT_MENUS];
        }
      } else {
        await this.persistSetting('cms_menus', this.navMenus);
      }

      if (settingMap.has('cms_popups')) {
        this.popups = JSON.parse(settingMap.get('cms_popups')!);
      }

      if (settingMap.has('cms_theme')) {
        this.themeConfig = JSON.parse(settingMap.get('cms_theme')!);
      }

      if (settingMap.has('cms_theme_catalog')) {
        const loadedCatalog = JSON.parse(settingMap.get('cms_theme_catalog')!);
        if (Array.isArray(loadedCatalog) && loadedCatalog.length > 0) {
          this.themeCatalog = loadedCatalog;
          for (const defT of DEFAULT_THEME_CATALOG) {
            if (!this.themeCatalog.some((t) => t.id === defT.id)) {
              this.themeCatalog.push(defT);
            }
          }
        }
      } else {
        await this.persistSetting('cms_theme_catalog', this.themeCatalog);
      }

      if (settingMap.has('cms_website_customizer')) {
        this.customizerConfig = {
          ...DEFAULT_CUSTOMIZER_CONFIG,
          ...JSON.parse(settingMap.get('cms_website_customizer')!),
        };
      } else {
        await this.persistSetting('cms_website_customizer', this.customizerConfig);
      }
    } catch (err: any) {
      this.logger.warn(`Could not load CMS settings from database: ${err.message}`);
    }
  }

  private persistSetting(key: string, data: any) {
    if (!this.prisma.systemSetting) return;
    const value = JSON.stringify(data);
    this.prisma.systemSetting
      .upsert({
        where: { key },
        update: { value, updatedAt: new Date() },
        create: {
          key,
          value,
          group: 'cms_content',
          description: `Persistent CMS storage for ${key}`,
        },
      })
      .catch((err) => {
        this.logger.warn(`Failed persisting CMS key ${key}: ${err.message}`);
      });
  }

  // --- News Articles ---
  getNewsArticles(): NewsArticleItem[] {
    return this.newsArticles;
  }

  createNewsArticle(data: Partial<NewsArticleItem>): NewsArticleItem {
    const newArticle: NewsArticleItem = {
      id: `art-${Date.now()}`,
      title: data.title || '',
      category: data.category || 'General',
      author: data.author || 'OmniStay Editor',
      date: new Date().toISOString().split('T')[0],
      views: 0,
      status: data.status || 'Published',
      content: data.content || '',
    };
    this.newsArticles.unshift(newArticle);
    this.persistSetting('cms_news', this.newsArticles);
    return newArticle;
  }

  updateNewsArticle(id: string, data: Partial<NewsArticleItem>): NewsArticleItem | null {
    const item = this.newsArticles.find((a) => a.id === id);
    if (item) {
      Object.assign(item, data);
      this.persistSetting('cms_news', this.newsArticles);
      return item;
    }
    return null;
  }

  deleteNewsArticle(id: string): boolean {
    const idx = this.newsArticles.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.newsArticles.splice(idx, 1);
      this.persistSetting('cms_news', this.newsArticles);
      return true;
    }
    return false;
  }

  // --- Pages ---
  getPages(): CustomPageItem[] {
    return this.staticPages;
  }

  getPageByIdOrSlug(idOrSlug: string): CustomPageItem | null {
    const clean = idOrSlug.startsWith('/') ? idOrSlug : `/${idOrSlug}`;
    return (
      this.staticPages.find(
        (p) =>
          p.id === idOrSlug ||
          p.slug === idOrSlug ||
          p.slug === clean ||
          p.slug.replace(/^\//, '') === idOrSlug
      ) || null
    );
  }

  createPage(data: Partial<CustomPageItem>): CustomPageItem {
    const rawSlug = data.slug || (data.title ? `/${data.title.toLowerCase().replace(/\s+/g, '-')}` : '');
    const cleanSlug = rawSlug.startsWith('/') ? rawSlug : `/${rawSlug}`;

    const newPage: CustomPageItem = {
      id: `p-${Date.now()}`,
      title: data.title || '',
      slug: cleanSlug,
      template: data.template || 'Standard Template',
      updated: new Date().toISOString().split('T')[0],
      status: data.status || 'Published',
      content: data.content || '',
      metaTitle: data.metaTitle || data.title || '',
      metaDescription: data.metaDescription || '',
    };
    this.staticPages.push(newPage);
    this.persistSetting('cms_pages', this.staticPages);
    return newPage;
  }

  updatePage(id: string, data: Partial<CustomPageItem>): CustomPageItem | null {
    const item = this.staticPages.find((p) => p.id === id);
    if (item) {
      if (data.slug && !data.slug.startsWith('/')) {
        data.slug = `/${data.slug}`;
      }
      Object.assign(item, data);
      item.updated = new Date().toISOString().split('T')[0];
      this.persistSetting('cms_pages', this.staticPages);
      return item;
    }
    return null;
  }

  deletePage(id: string): boolean {
    const idx = this.staticPages.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.staticPages.splice(idx, 1);
      this.persistSetting('cms_pages', this.staticPages);
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
    this.persistSetting('cms_media', this.mediaAssets);
    return asset;
  }

  deleteMediaAsset(id: string): boolean {
    const idx = this.mediaAssets.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.mediaAssets.splice(idx, 1);
      this.persistSetting('cms_media', this.mediaAssets);
      return true;
    }
    return false;
  }

  // --- Navigation Menus ---
  getMenus(location?: 'header' | 'footer' | 'guest'): NavigationMenuItem[] {
    let list = this.navMenus.map((m, idx) => ({
      ...m,
      location: m.location || 'header',
      order: m.order !== undefined ? m.order : idx + 1,
      isActive: m.isActive !== undefined ? m.isActive : true,
    }));
    if (location) {
      list = list.filter((m) => (m.location || 'header') === location);
    }
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  createMenuItem(item: Partial<NavigationMenuItem>): NavigationMenuItem {
    const loc = item.location || 'header';
    const currentLocItems = this.navMenus.filter((m) => (m.location || 'header') === loc);
    const maxOrder = currentLocItems.reduce((max, i) => Math.max(max, i.order || 0), 0);

    const newMenu: NavigationMenuItem = {
      id: `menu-${Date.now()}`,
      title: item.title || 'New Link',
      url: item.url || '/',
      target: item.target || '_self',
      order: item.order !== undefined ? item.order : maxOrder + 1,
      location: loc,
      isActive: item.isActive !== undefined ? item.isActive : true,
    };
    this.navMenus.push(newMenu);
    this.persistSetting('cms_menus', this.navMenus);
    return newMenu;
  }

  updateMenuItem(id: string, item: Partial<NavigationMenuItem>): NavigationMenuItem | null {
    const existing = this.navMenus.find((m) => m.id === id);
    if (existing) {
      Object.assign(existing, item);
      this.persistSetting('cms_menus', this.navMenus);
      return existing;
    }
    return null;
  }

  reorderMenus(items: { id: string; order: number }[]): NavigationMenuItem[] {
    for (const update of items) {
      const menu = this.navMenus.find((m) => m.id === update.id);
      if (menu) {
        menu.order = update.order;
      }
    }
    this.persistSetting('cms_menus', this.navMenus);
    return this.navMenus.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  deleteMenuItem(id: string): boolean {
    const idx = this.navMenus.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.navMenus.splice(idx, 1);
      this.persistSetting('cms_menus', this.navMenus);
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
    this.persistSetting('cms_popups', this.popups);
    return newPopup;
  }

  updatePopup(id: string, data: Partial<PopupModalItem>): PopupModalItem | null {
    const popup = this.popups.find((p) => p.id === id);
    if (popup) {
      Object.assign(popup, data);
      this.persistSetting('cms_popups', this.popups);
      return popup;
    }
    return null;
  }

  togglePopupStatus(id: string): PopupModalItem | null {
    const popup = this.popups.find((p) => p.id === id);
    if (popup) {
      popup.status = popup.status === 'Active' ? 'Paused' : 'Active';
      this.persistSetting('cms_popups', this.popups);
      return popup;
    }
    return null;
  }

  deletePopup(id: string): boolean {
    const idx = this.popups.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.popups.splice(idx, 1);
      this.persistSetting('cms_popups', this.popups);
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
    this.persistSetting('cms_theme', this.themeConfig);
    return this.themeConfig;
  }

  getThemeCatalog(): ThemeCatalogItem[] {
    const activeId = this.customizerConfig.activeThemeId || this.themeConfig.activeThemeId || 'enterprise-blue';
    return this.themeCatalog.map((t) => ({
      ...t,
      isActive: t.id === activeId,
    }));
  }

  createTheme(dto: Partial<ThemeCatalogItem>): ThemeCatalogItem {
    const slug = (dto.name || 'custom-theme')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const id = dto.id || `theme-${Date.now()}`;

    const newTheme: ThemeCatalogItem = {
      id,
      name: dto.name || 'Custom Theme',
      slug,
      description: dto.description || 'Custom crafted luxury theme for OmniStay 360',
      author: dto.author || 'OmniStay Hotel Owner',
      version: dto.version || '1.0.0',
      screenshotUrl:
        dto.screenshotUrl ||
        dto.bannerUrl ||
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      primaryColor: dto.primaryColor || '#00a8ff',
      accentColor: dto.accentColor || '#0097e6',
      secondaryColor: dto.secondaryColor || '#f8fafc',
      backgroundColor: dto.backgroundColor || '#ffffff',
      headingFont: dto.headingFont || 'Inter',
      bodyFont: dto.bodyFont || 'Inter',
      borderRadius: dto.borderRadius || 'rounded-xl',
      isCustom: true,
      isActive: Boolean(dto.isActive),
      bannerUrl:
        dto.bannerUrl ||
        'https://images.unsplash.com/photo-1489058535093-8f530d789c3b?auto=format&fit=crop&w=2200&q=85',
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (newTheme.isActive) {
      this.themeCatalog.forEach((t) => (t.isActive = false));
      this.customizerConfig.activeThemeId = newTheme.id;
      this.customizerConfig.primaryColor = newTheme.primaryColor;
      this.customizerConfig.accentColor = newTheme.accentColor;
      if (newTheme.bannerUrl) {
        this.customizerConfig.heroBannerUrl = newTheme.bannerUrl;
      }
      this.themeConfig.activeThemeId = newTheme.id;
      this.themeConfig.primaryColor = newTheme.primaryColor;
      this.persistSetting('cms_website_customizer', this.customizerConfig);
      this.persistSetting('cms_theme', this.themeConfig);
    }

    this.themeCatalog.unshift(newTheme);
    this.persistSetting('cms_theme_catalog', this.themeCatalog);
    return newTheme;
  }

  activateTheme(id: string): { success: boolean; activeTheme: ThemeCatalogItem } {
    const theme = this.themeCatalog.find((t) => t.id === id);
    if (!theme) {
      throw new NotFoundException(`Theme with id '${id}' not found`);
    }

    this.themeCatalog.forEach((t) => (t.isActive = t.id === id));
    this.customizerConfig.activeThemeId = theme.id;
    this.customizerConfig.primaryColor = theme.primaryColor;
    this.customizerConfig.accentColor = theme.accentColor;
    if (theme.bannerUrl) {
      this.customizerConfig.heroBannerUrl = theme.bannerUrl;
    }

    this.themeConfig.activeThemeId = theme.id;
    this.themeConfig.primaryColor = theme.primaryColor;

    this.persistSetting('cms_theme_catalog', this.themeCatalog);
    this.persistSetting('cms_website_customizer', this.customizerConfig);
    this.persistSetting('cms_theme', this.themeConfig);

    return { success: true, activeTheme: theme };
  }

  duplicateTheme(id: string, newName?: string): ThemeCatalogItem {
    const original = this.themeCatalog.find((t) => t.id === id);
    if (!original) {
      throw new NotFoundException(`Theme with id '${id}' not found`);
    }

    const name = newName || `${original.name} (Copy)`;
    const newId = `theme-copy-${Date.now()}`;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const clone: ThemeCatalogItem = {
      ...original,
      id: newId,
      name,
      slug,
      isCustom: true,
      isActive: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    this.themeCatalog.push(clone);
    this.persistSetting('cms_theme_catalog', this.themeCatalog);
    return clone;
  }

  deleteTheme(id: string): boolean {
    const idx = this.themeCatalog.findIndex((t) => t.id === id);
    if (idx !== -1) {
      const target = this.themeCatalog[idx];
      if (target.isCustom) {
        this.themeCatalog.splice(idx, 1);
        this.persistSetting('cms_theme_catalog', this.themeCatalog);
        return true;
      }
    }
    return false;
  }

  // --- Website Customizer (WordPress-Style CMS Builder) ---
  getWebsiteCustomizerConfig(): WebsiteCustomizerConfig {
    return this.customizerConfig;
  }

  setWebsiteCustomizerConfig(config: Partial<WebsiteCustomizerConfig>): WebsiteCustomizerConfig {
    this.customizerConfig = {
      ...this.customizerConfig,
      ...config,
      sections: {
        ...this.customizerConfig.sections,
        ...(config.sections || {}),
      },
      featureCard1: {
        ...this.customizerConfig.featureCard1,
        ...(config.featureCard1 || {}),
      },
      featureCard2: {
        ...this.customizerConfig.featureCard2,
        ...(config.featureCard2 || {}),
      },
      featureCard3: {
        ...this.customizerConfig.featureCard3,
        ...(config.featureCard3 || {}),
      },
      socialLinks: {
        ...this.customizerConfig.socialLinks,
        ...(config.socialLinks || {}),
      },
    };

    if (config.primaryColor) {
      this.themeConfig.primaryColor = config.primaryColor;
    }
    if (config.activeThemeId) {
      this.themeConfig.activeThemeId = config.activeThemeId;
    }
    if (config.mode) {
      this.themeConfig.mode = config.mode;
    }

    this.persistSetting('cms_website_customizer', this.customizerConfig);
    this.persistSetting('cms_theme', this.themeConfig);
    return this.customizerConfig;
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

  // --- Multi-Currency & Real-Time Dynamic Currency Conversion (Chapter 6.3) ---
  getExchangeRates() {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    return {
      baseCurrency: 'USD',
      rateLockExpiresAt: expiresAt,
      guaranteeWindowMinutes: 15,
      spreadPercentage: 1.5,
      rates: {
        USD: 1.0,
        EUR: 0.92,
        GBP: 0.78,
        BDT: 119.5,
        CAD: 1.36,
        AUD: 1.52,
        JPY: 154.2,
        SGD: 1.33,
        SAR: 3.75,
        AED: 3.67,
        INR: 83.5,
        CHF: 0.88,
        CNY: 7.24,
      },
    };
  }
}
