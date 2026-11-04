'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  LayoutGrid,
  Columns3,
  Heading,
  Image as ImageIcon,
  FileText,
  PlaySquare,
  MousePointerClick,
  Minus,
  MoveVertical,
  MapPin,
  Sparkles,
  Star,
  Search,
  Calendar,
  BedDouble,
  Compass,
  Gift,
  Mail,
  Layers,
  Settings,
  History,
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  EyeOff,
  Save,
  Plus,
  Copy,
  Edit3,
  Palette,
  Check,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ShieldCheck,
  Building,
  Maximize2,
  Minimize2,
  ArrowRight,
  ArrowLeft,
  Paintbrush,
  Heart,
  CheckCheck,
  Award,
  Trash2,
  Globe,
  FileCode,
  FolderPlus,
  Home,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  contentService,
  WebsiteCustomizerConfig,
  ThemeCatalogItem,
  CustomPageItem,
} from '@/features/content/services/content.service';
import { UnifiedRichEditor } from '@/components/editor/unified-rich-editor';

export const THEME_PRESETS = [
  {
    id: 'enterprise-blue',
    name: 'Enterprise Royal Blue',
    primary: '#00a8ff',
    accent: '#0097e6',
    desc: 'Standard luxury white corporate PMS theme',
  },
  {
    id: 'emerald-luxury',
    name: 'Emerald Eco-Resort',
    primary: '#10b981',
    accent: '#059669',
    desc: 'Curated for tropical villas and safari retreats',
  },
  {
    id: 'gold-boutique',
    name: 'Gold Boutique Heritage',
    primary: '#f59e0b',
    accent: '#d97706',
    desc: 'Opulent gold accents for 5-star palace hotels',
  },
  {
    id: 'midnight-dark',
    name: 'Midnight Executive Dark',
    primary: '#3b82f6',
    accent: '#2563eb',
    desc: 'High-contrast dark mode for luxury executives',
  },
];

export function applyThemeStyles(themeId: string) {
  if (typeof document === 'undefined') return;
  const preset = THEME_PRESETS.find((t) => t.id === themeId) || THEME_PRESETS[0];
  document.documentElement.style.setProperty('--brand-primary', preset.primary);
  document.documentElement.style.setProperty('--primary', preset.primary);
  document.documentElement.style.setProperty('--ring', preset.primary);

  if (preset.id === 'midnight-dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.style.setProperty('--foreground', '#f8fafc');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.setProperty('--foreground', '#0f172a');
  }
}

const PRESET_BANNERS = [
  {
    name: 'Tropical Coastline & Beachfront Sanctuary',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=85',
  },
  {
    name: 'Oceanfront Infinity Pool & Sunset Overwater Villa',
    url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=2200&q=85',
  },
  {
    name: 'Swiss Alpine Mountain Chalet & Pine Retreat',
    url: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=2200&q=85',
  },
  {
    name: 'Amalfi Coast Luxury Cliffside Resort',
    url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=2200&q=85',
  },
  {
    name: 'Urban Penthouse Skyline & Luxury Suites',
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2200&q=85',
  },
];

const SEARCH_TAB_OPTIONS = [
  { id: 'hotel', label: 'Hotel & Resorts', icon: '🏨' },
  { id: 'space', label: 'Private Villas', icon: '🏡' },
  { id: 'tour', label: 'Curated Tours', icon: '🗺️' },
  { id: 'car', label: 'Chauffeur & Car', icon: '🚗' },
  { id: 'event', label: 'VIP Events', icon: '🎟️' },
  { id: 'flight', label: 'Private Jet', icon: '✈️' },
  { id: 'boat', label: 'Yacht Charter', icon: '🛥️' },
];

type ViewMode = 'builder' | 'directory';
type ElementorTab = 'elements' | 'global' | 'seo';
type InspectorTab = 'content' | 'style' | 'advanced';

export type ActiveElementKey =
  | 'heading'
  | 'subheading'
  | 'search_bar'
  | 'search_button'
  | 'hero_section'
  | 'card_1'
  | 'card_2'
  | 'card_3'
  | 'feature_cards'
  | 'featured_stays'
  | 'trending_tours'
  | 'verticals'
  | 'newsletter'
  | 'header_nav'
  | 'page_title'
  | 'page_subtitle'
  | 'page_content'
  | 'page_hero'
  | 'page_features'
  | 'page_cta'
  | null;

type ActiveSectionKey =
  | 'hero'
  | 'featureCards'
  | 'featuredStays'
  | 'trendingTours'
  | 'verticals'
  | 'newsletter'
  | 'pageHero'
  | 'pageContent'
  | 'pageFeatures'
  | 'pageCta'
  | null;

function renderMarkdownPreview(rawContent: string) {
  if (!rawContent) {
    return (
      <div className="py-10 text-center text-slate-400 italic text-xs">
        No content entered yet. Click anywhere in this box to edit, or use the quick insert buttons below.
      </div>
    );
  }

  if (rawContent.startsWith('{') && rawContent.includes('"blocks"')) {
    try {
      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed.blocks)) {
        return parsed.blocks.map((b: any, i: number) => {
          if (b.type === 'header') {
            const level = b.data?.level || 2;
            if (level === 1) {
              return <h1 key={i} className="text-2xl font-black text-slate-900 mt-4 mb-2">{b.data?.text}</h1>;
            }
            if (level === 2) {
              return <h2 key={i} className="text-xl font-bold text-slate-900 mt-4 mb-2">{b.data?.text}</h2>;
            }
            return <h3 key={i} className="text-lg font-bold text-slate-900 mt-3 mb-1.5">{b.data?.text}</h3>;
          }
          if (b.type === 'list') {
            return (
              <ul key={i} className="list-disc list-inside space-y-1 my-2 text-slate-700">
                {(b.data?.items || []).map((item: string, j: number) => (
                  <li key={j} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ul>
            );
          }
          return <p key={i} className="my-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: b.data?.text || '' }} />;
        });
      }
    } catch {
      // fallback to markdown
    }
  }

  const lines = rawContent.split('\n');
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1.5 my-3 text-slate-700 pl-2">
          {listBuffer.map((item, idx) => (
            <li
              key={idx}
              dangerouslySetInnerHTML={{
                __html: formatInline(item),
              }}
            />
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  const formatInline = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-[#00a8ff] px-1.5 py-0.5 rounded text-[11px] font-mono">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-[#00a8ff] underline font-semibold hover:text-[#0097e6]">$1</a>');
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listBuffer.push(trimmed.substring(2));
      return;
    }

    flushList();

    if (!trimmed) {
      return;
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={index} className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-6 mb-3">
          {trimmed.substring(2)}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-5 mb-2.5">
          {trimmed.substring(3)}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="text-lg font-bold text-slate-900 tracking-tight mt-4 mb-2">
          {trimmed.substring(4)}
        </h3>
      );
    } else if (trimmed.startsWith('---')) {
      elements.push(<hr key={index} className="my-6 border-slate-200" />);
    } else if (trimmed.startsWith('![')) {
      const match = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        elements.push(
          <div key={index} className="my-4 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
            <img src={match[2]} alt={match[1]} className="w-full h-56 object-cover" />
            {match[1] && <div className="p-2 bg-slate-50 text-[11px] text-slate-500 italic text-center">{match[1]}</div>}
          </div>
        );
      }
    } else {
      elements.push(
        <p
          key={index}
          className="my-2 leading-relaxed text-slate-700"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
        />
      );
    }
  });

  flushList();
  return elements;
}

export default function ElementorWhiteWebsiteBuilderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Mode: Visual Builder vs WordPress Themes Directory
  const [viewMode, setViewMode] = useState<ViewMode>('builder');

  // Studio Fullscreen Mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Builder Viewport & State
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<ElementorTab>('elements');
  const [searchWidgetQuery, setSearchWidgetQuery] = useState('');
  const [themeSearchQuery, setThemeSearchQuery] = useState('');
  const [activeElement, setActiveElement] = useState<ActiveElementKey>(null);
  const [selectedSection, setSelectedSection] = useState<ActiveSectionKey>('hero');
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('content');
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateThemeModalOpen, setIsCreateThemeModalOpen] = useState(false);
  const [activeTabPreview, setActiveTabPreview] = useState('hotel');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Multi-Page CMS Builder State
  const [activePageId, setActivePageId] = useState<string>('home');
  const [activePageDraft, setActivePageDraft] = useState<CustomPageItem | null>(null);
  const [isPageSelectorOpen, setIsPageSelectorOpen] = useState(false);
  const [pageSearchQuery, setPageSearchQuery] = useState('');
  const [isCreatePageModalOpen, setIsCreatePageModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New Page Modal Form State
  const [newPageForm, setNewPageForm] = useState({
    title: '',
    slug: '',
    template: 'Standard Template',
    status: 'Published',
    starterLayout: 'service',
    metaTitle: '',
    metaDescription: '',
  });

  // Two-way interactive selection: Clicking an element on canvas opens inspector on the left panel
  const handleSelectElement = (el: ActiveElementKey) => {
    setActiveElement(el);
    if (el) {
      if (
        el === 'heading' ||
        el === 'subheading' ||
        el === 'search_bar' ||
        el === 'search_button' ||
        el === 'hero_section'
      ) {
        setSelectedSection('hero');
      } else if (
        el === 'card_1' ||
        el === 'card_2' ||
        el === 'card_3' ||
        el === 'feature_cards'
      ) {
        setSelectedSection('featureCards');
      } else if (el === 'featured_stays') {
        setSelectedSection('featuredStays');
      } else if (el === 'newsletter') {
        setSelectedSection('newsletter');
      } else if (el === 'page_title' || el === 'page_subtitle' || el === 'page_hero') {
        setSelectedSection('pageHero');
      } else if (el === 'page_content') {
        setSelectedSection('pageContent');
      } else if (el === 'page_features') {
        setSelectedSection('pageFeatures');
      } else if (el === 'page_cta') {
        setSelectedSection('pageCta');
      }
    } else {
      setSelectedSection(null);
    }
  };

  // New Custom Theme Form State (WordPress Style)
  const [newTheme, setNewTheme] = useState<{
    name: string;
    description: string;
    author: string;
    primaryColor: string;
    accentColor: string;
    secondaryColor: string;
    backgroundColor: string;
    headingFont: string;
    bodyFont: string;
    borderRadius: string;
    bannerUrl: string;
  }>({
    name: '',
    description: '',
    author: 'OmniStay Host',
    primaryColor: '#00a8ff',
    accentColor: '#0097e6',
    secondaryColor: '#f8fafc',
    backgroundColor: '#ffffff',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    borderRadius: 'rounded-xl',
    bannerUrl: PRESET_BANNERS[0].url,
  });

  // Load live customizer config from backend
  const { data: serverConfig, isLoading: isConfigLoading } = useQuery<WebsiteCustomizerConfig>({
    queryKey: ['websiteCustomizerConfig'],
    queryFn: () => contentService.getWebsiteCustomizer(),
  });

  // Load WordPress-style theme catalog
  const { data: themeCatalog = [] } = useQuery<ThemeCatalogItem[]>({
    queryKey: ['themeCatalog'],
    queryFn: () => contentService.getThemeCatalog(),
  });

  // Load system CMS pages from backend
  const { data: customPages = [], isLoading: isPagesLoading } = useQuery<CustomPageItem[]>({
    queryKey: ['systemPages'],
    queryFn: () => contentService.getPages(),
  });

  const [formState, setFormState] = useState<WebsiteCustomizerConfig | null>(null);

  useEffect(() => {
    if (serverConfig && !formState) {
      setFormState(serverConfig);
    }
  }, [serverConfig, formState]);

  // Synchronize active page draft when switching pages or when pages list updates
  useEffect(() => {
    if (activePageId !== 'home') {
      const found = customPages.find((p) => p.id === activePageId);
      if (found) {
        if (!activePageDraft || activePageDraft.id !== found.id) {
          setActivePageDraft({ ...found });
        }
      }
    } else {
      setActivePageDraft(null);
    }
  }, [activePageId, customPages]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: Partial<WebsiteCustomizerConfig>) =>
      contentService.updateWebsiteCustomizer(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['websiteCustomizerConfig'], updated);
      queryClient.invalidateQueries({ queryKey: ['themeCatalog'] });
      setFormState(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    },
  });

  const activateThemeMutation = useMutation({
    mutationFn: (themeId: string) => contentService.activateTheme(themeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themeCatalog'] });
      queryClient.invalidateQueries({ queryKey: ['websiteCustomizerConfig'] });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
  });

  const createThemeMutation = useMutation({
    mutationFn: (dto: Partial<ThemeCatalogItem>) => contentService.createTheme(dto),
    onSuccess: (newT) => {
      queryClient.invalidateQueries({ queryKey: ['themeCatalog'] });
      queryClient.invalidateQueries({ queryKey: ['websiteCustomizerConfig'] });
      setIsCreateThemeModalOpen(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
  });

  const duplicateThemeMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      contentService.duplicateTheme(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themeCatalog'] });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
  });

  // Custom Page Mutations
  const createPageMutation = useMutation({
    mutationFn: (dto: Partial<CustomPageItem>) => contentService.createPage(dto),
    onSuccess: (newPage) => {
      queryClient.invalidateQueries({ queryKey: ['systemPages'] });
      setActivePageId(newPage.id);
      setActivePageDraft(newPage);
      setIsCreatePageModalOpen(false);
      setNewPageForm({
        title: '',
        slug: '',
        template: 'Standard Template',
        status: 'Published',
        starterLayout: 'service',
        metaTitle: '',
        metaDescription: '',
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomPageItem> }) =>
      contentService.updatePage(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['systemPages'] });
      if (updated) {
        setActivePageDraft(updated);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: (id: string) => contentService.deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemPages'] });
      setActivePageId('home');
      setActivePageDraft(null);
      setDeleteConfirmId(null);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
  });

  // Handlers
  const handleSave = () => {
    if (activePageId === 'home') {
      if (!formState) return;
      updateMutation.mutate(formState);
    } else if (activePageDraft) {
      updatePageMutation.mutate({
        id: activePageDraft.id,
        data: activePageDraft,
      });
    }
  };

  const generateSlug = (title: string) => {
    const clean = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return clean ? `/${clean}` : '';
  };

  const getStarterContent = (layout: string, title: string) => {
    switch (layout) {
      case 'service':
        return `# ${title || 'Luxury Travel Experience'}\n\nExperience world-class hospitality and tailored concierge services across premier global destinations.\n\n### Exclusive Privileges\n- **Private Jet & Yacht Charters**: Tailored departure schedules and onboard fine dining.\n- **Dedicated Butler & Concierge**: 24/7 personalized itinerary management.\n- **Contactless Smart Keycards**: Direct suite access via your smartphone.\n\n### Reservation & Inquiries\nContact our VIP desk or book directly online with bank-grade secure checkout.\n`;
      case 'legal':
        return `# ${title || 'Legal & Compliance Policy'}\n\n### 1. General Provisions\nThis document sets forth the terms, conditions, and operational standards applicable to all guests and partners.\n\n### 2. Privacy & Data Security\nAll transactions and guest identities are protected under international hospitality compliance frameworks.\n\n### 3. Contact & Inquiries\nFor formal inquiries, please contact our compliance department at legal@softsasi.com.\n`;
      case 'showcase':
        return `# ${title || 'Destination Showcase'}\n\nDiscover breathtaking vistas, private beachfront villas, and handpicked resort suites.\n\n![Destination View](https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80)\n\n### What's Included\n- Handcrafted excursions and private tour guides\n- Daily breakfast buffet and champagne toast\n- Priority access to wellness spa and infinity pools\n`;
      case 'blank':
      default:
        return `# ${title || 'New Page Title'}\n\nEnter your page content, headings, and multimedia blocks here.\n`;
    }
  };

  const getPreviewUrl = () => {
    if (activePageId === 'home' || !activePageDraft) {
      return 'http://localhost:3000';
    }
    const slug = activePageDraft.slug || '';
    if (slug === '/about' || slug === '/privacy' || slug === '/terms' || slug === '/faq' || slug === '/contact') {
      return `http://localhost:3000${slug}`;
    }
    if (slug.startsWith('/page/')) {
      return `http://localhost:3000${slug}`;
    }
    const clean = slug.startsWith('/') ? slug.substring(1) : slug;
    return `http://localhost:3000/page/${clean}`;
  };

  const handleInsertWidgetToPage = (widgetType: string) => {
    if (!activePageDraft) return;
    let snippet = '';
    switch (widgetType) {
      case 'heading':
        snippet = `\n\n## New Section Heading\nType your subheading or introductory content here.\n`;
        break;
      case 'text_editor':
        snippet = `\n\n### Overview & Features\nSoftsasi OmniStay provides curated luxury experiences designed with bank-grade security, frictionless check-in, and 24/7 dedicated concierge assistance.\n`;
        break;
      case 'image':
        snippet = `\n\n![Luxury Sanctuary View](https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80)\n*Caption: Panoramic view of luxury beachfront estate.*\n`;
        break;
      case 'button':
        snippet = `\n\n[Book Your VIP Reservation →](/booking)\n`;
        break;
      case 'divider':
        snippet = `\n\n---\n`;
        break;
      case 'icon_box':
        snippet = `\n\n- **VIP Fast-Track Check-In**: Instant biometric and QR-code room key provisioning.\n- **Private Chauffeur Service**: Executive airport meet-and-greet.\n- **Complimentary Breakfast**: Daily gourmet buffet for all registered guests.\n`;
        break;
      case 'guarantees':
        snippet = `\n\n### Trust & Safety Guarantees\n- 100% Verified Five-Star Properties\n- Zero Cancellation Fee within 48 Hours\n- Instant Folio & Invoicing System\n`;
        break;
      default:
        snippet = `\n\n### Additional Highlight\nCustom block inserted from Elementor widget palette.\n`;
    }
    setActivePageDraft({
      ...activePageDraft,
      content: (activePageDraft.content || '') + snippet,
    });
    handleSelectElement('page_content');
  };

  const handleSectionToggle = (sectionKey: keyof WebsiteCustomizerConfig['sections']) => {
    if (!formState) return;
    setFormState({
      ...formState,
      sections: {
        ...formState.sections,
        [sectionKey]: !formState.sections[sectionKey],
      },
    });
  };

  const handleCardChange = (
    cardKey: 'featureCard1' | 'featureCard2' | 'featureCard3',
    field: string,
    value: string,
  ) => {
    if (!formState) return;
    setFormState({
      ...formState,
      [cardKey]: {
        ...(formState[cardKey] as any),
        [field]: value,
      },
    });
  };

  if (isConfigLoading || !formState) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#00a8ff] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wide text-slate-600">
            Loading Elementor Visual Studio...
          </span>
        </div>
      </div>
    );
  }

  // Basic Widgets
  const basicWidgets = [
    {
      id: 'inner_section',
      name: 'Inner Section',
      icon: Columns3,
      action: () => (activePageId === 'home' ? handleSelectElement('hero_section') : handleInsertWidgetToPage('text_editor')),
    },
    {
      id: 'heading',
      name: 'Heading',
      icon: Heading,
      action: () => (activePageId === 'home' ? handleSelectElement('heading') : handleInsertWidgetToPage('heading')),
    },
    {
      id: 'image',
      name: 'Image',
      icon: ImageIcon,
      action: () => (activePageId === 'home' ? handleSelectElement('hero_section') : handleInsertWidgetToPage('image')),
    },
    {
      id: 'text_editor',
      name: 'Text Editor (Tiptap / Editor.js)',
      icon: FileText,
      action: () => (activePageId === 'home' ? handleSelectElement('subheading') : handleInsertWidgetToPage('text_editor')),
    },
    {
      id: 'video',
      name: 'Video',
      icon: PlaySquare,
      action: () => (activePageId === 'home' ? handleSelectElement('hero_section') : handleInsertWidgetToPage('text_editor')),
    },
    {
      id: 'button',
      name: 'Button',
      icon: MousePointerClick,
      action: () => (activePageId === 'home' ? handleSelectElement('search_button') : handleInsertWidgetToPage('button')),
    },
    {
      id: 'divider',
      name: 'Divider',
      icon: Minus,
      action: () => (activePageId === 'home' ? handleSelectElement('feature_cards') : handleInsertWidgetToPage('divider')),
    },
    {
      id: 'spacer',
      name: 'Spacer',
      icon: MoveVertical,
      action: () => (activePageId === 'home' ? handleSelectElement('feature_cards') : handleInsertWidgetToPage('divider')),
    },
    {
      id: 'google_maps',
      name: 'Google Maps',
      icon: MapPin,
      action: () => (activePageId === 'home' ? handleSelectElement('featured_stays') : handleInsertWidgetToPage('text_editor')),
    },
    {
      id: 'icon_box',
      name: 'Icon Box',
      icon: Sparkles,
      action: () => (activePageId === 'home' ? handleSelectElement('card_1') : handleInsertWidgetToPage('icon_box')),
    },
  ];

  // Hospitality Pro Widgets
  const hospitalityWidgets = [
    {
      id: 'hero_search',
      name: 'Hero Search Engine',
      icon: Search,
      action: () => (activePageId === 'home' ? handleSelectElement('search_bar') : handleInsertWidgetToPage('button')),
    },
    {
      id: 'featured_stays',
      name: 'Featured Rooms Grid',
      icon: BedDouble,
      action: () => (activePageId === 'home' ? handleSelectElement('featured_stays') : handleInsertWidgetToPage('icon_box')),
    },
    {
      id: 'promo_cards',
      name: 'Promotional 3-Cards',
      icon: Gift,
      action: () => (activePageId === 'home' ? handleSelectElement('card_1') : handleInsertWidgetToPage('icon_box')),
    },
    {
      id: 'verticals',
      name: 'Experience Verticals',
      icon: Compass,
      action: () => (activePageId === 'home' ? handleSelectElement('verticals') : handleInsertWidgetToPage('icon_box')),
    },
    {
      id: 'guarantees',
      name: 'Trust & Guarantees',
      icon: ShieldCheck,
      action: () => (activePageId === 'home' ? handleSelectElement('featured_stays') : handleInsertWidgetToPage('guarantees')),
    },
    {
      id: 'reviews',
      name: 'Guest Reviews',
      icon: Star,
      action: () => (activePageId === 'home' ? handleSelectElement('newsletter') : handleInsertWidgetToPage('icon_box')),
    },
    {
      id: 'newsletter',
      name: 'Newsletter Club',
      icon: Mail,
      action: () => (activePageId === 'home' ? handleSelectElement('newsletter') : handleInsertWidgetToPage('button')),
    },
  ];

  const filteredBasicWidgets = basicWidgets.filter((w) =>
    w.name.toLowerCase().includes(searchWidgetQuery.toLowerCase()),
  );
  const filteredHospitalityWidgets = hospitalityWidgets.filter((w) =>
    w.name.toLowerCase().includes(searchWidgetQuery.toLowerCase()),
  );

  const filteredThemes = themeCatalog.filter(
    (t) =>
      t.name.toLowerCase().includes(themeSearchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(themeSearchQuery.toLowerCase()),
  );

  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-50 bg-[#eef2f6] text-slate-800 select-none overflow-hidden font-sans flex flex-col'
    : 'h-[calc(100vh-4.25rem)] -m-6 sm:-m-8 flex flex-col bg-[#eef2f6] text-slate-800 select-none overflow-hidden font-sans border-t border-slate-200';

  return (
    <div className={containerClasses}>
      {/* ======================================================== */}
      {/* 1. TOP ELEMENTOR WHITE APP BAR (Multi-Page Header) */}
      {/* ======================================================== */}
      <div className="h-14 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-xs">
        {/* Left: Exit/Dashboard, Elementor Crimson Badge & Mode Switcher */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (isFullscreen) {
                setIsFullscreen(false);
              } else {
                router.push('/dashboard');
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition border border-slate-200"
            title={isFullscreen ? 'Exit Fullscreen' : 'Dashboard'}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline font-bold">
              {isFullscreen ? 'Exit Studio' : 'Dashboard'}
            </span>
          </button>

          <div className="flex items-center gap-1.5 bg-[#92003b] text-white px-2.5 py-1.5 rounded-lg font-black text-xs tracking-wider shadow-xs">
            <span>E</span>
            <span className="text-[11px] font-bold tracking-tight hidden sm:inline">ELEMENTOR</span>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Mode Switcher: Visual Builder vs WordPress Themes Directory */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('builder')}
              className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'builder'
                  ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#00a8ff]" />
              <span className="hidden sm:inline">Visual Builder</span>
            </button>
            <button
              onClick={() => setViewMode('directory')}
              className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'directory'
                  ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Paintbrush className="w-3.5 h-3.5 text-[#92003b]" />
              <span className="hidden sm:inline">Themes</span>
            </button>
          </div>

          {/* Multi-Page Switcher Dropdown */}
          {viewMode === 'builder' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPageSelectorOpen(!isPageSelectorOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50/70 hover:bg-sky-100/80 border border-sky-200 text-xs font-bold text-slate-800 transition cursor-pointer shadow-2xs"
                title="Select or Create Website Page to Edit"
              >
                {activePageId === 'home' ? (
                  <>
                    <Home className="w-3.5 h-3.5 text-[#00a8ff]" />
                    <span className="max-w-[130px] truncate">Home (Front Page)</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-[#92003b]" />
                    <span className="max-w-[130px] truncate">{activePageDraft?.title || 'Custom Page'}</span>
                  </>
                )}
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {/* Page Selector Popover */}
              {isPageSelectorOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-1 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#00a8ff]" />
                      Select Page to Edit
                    </span>
                    <button
                      onClick={() => {
                        setIsPageSelectorOpen(false);
                        setIsCreatePageModalOpen(true);
                      }}
                      className="text-[11px] font-bold text-[#00a8ff] hover:text-[#0097e6] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> New Page
                    </button>
                  </div>

                  {/* Search Filter */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={pageSearchQuery}
                      onChange={(e) => setPageSearchQuery(e.target.value)}
                      placeholder="Filter pages..."
                      className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-[#00a8ff]"
                    />
                  </div>

                  {/* Pages List */}
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {/* Home Page Option */}
                    <div
                      onClick={() => {
                        setActivePageId('home');
                        handleSelectElement(null);
                        setIsPageSelectorOpen(false);
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition ${
                        activePageId === 'home'
                          ? 'bg-sky-50 text-[#00a8ff] font-bold border border-[#00a8ff]/40'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-[#00a8ff]" />
                        <div>
                          <span className="block font-bold">Home Page</span>
                          <span className="text-[10px] text-slate-400 font-mono">/ (Front Page)</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Published
                      </span>
                    </div>

                    {/* Custom Pages */}
                    {customPages
                      .filter(
                        (p) =>
                          p.title.toLowerCase().includes(pageSearchQuery.toLowerCase()) ||
                          p.slug.toLowerCase().includes(pageSearchQuery.toLowerCase())
                      )
                      .map((p) => {
                        const isSelected = activePageId === p.id;
                        const isPublished = p.status?.toLowerCase() === 'published';
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              setActivePageId(p.id);
                              setActivePageDraft({ ...p });
                              handleSelectElement(null);
                              setIsPageSelectorOpen(false);
                            }}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition ${
                              isSelected
                                ? 'bg-sky-50 text-[#00a8ff] font-bold border border-[#00a8ff]/40'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                              <div className="truncate">
                                <span className="block font-bold truncate">{p.title}</span>
                                <span className="text-[10px] text-slate-400 font-mono truncate">{p.slug}</span>
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                isPublished
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {p.status || 'Draft'}
                            </span>
                          </div>
                        );
                      })}
                  </div>

                  {/* Dropdown Footer: Create New Page Button */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsPageSelectorOpen(false);
                        setIsCreatePageModalOpen(true);
                      }}
                      className="w-full py-2 bg-[#92003b] hover:bg-[#7e0033] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Create New Page</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Publication Status Badge (Published / Draft toggle) */}
          {viewMode === 'builder' && activePageId !== 'home' && activePageDraft && (
            <button
              type="button"
              onClick={() => {
                const nextStatus = activePageDraft.status === 'Published' ? 'Draft' : 'Published';
                setActivePageDraft({ ...activePageDraft, status: nextStatus });
              }}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition border cursor-pointer ${
                activePageDraft.status === 'Published'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
              }`}
              title="Click to toggle publication status (Published / Draft)"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  activePageDraft.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span>{activePageDraft.status === 'Published' ? 'Published' : 'Draft'}</span>
            </button>
          )}

          {/* Quick Create Page Button */}
          {viewMode === 'builder' && (
            <button
              type="button"
              onClick={() => setIsCreatePageModalOpen(true)}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
              title="Create a New Website Page"
            >
              <Plus className="w-3.5 h-3.5 text-[#00a8ff]" />
              <span>New Page</span>
            </button>
          )}
        </div>

        {/* Center: Device Switcher (Desktop / Tablet / Mobile) */}
        {viewMode === 'builder' ? (
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setDeviceView('desktop')}
              className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition cursor-pointer ${
                deviceView === 'desktop'
                  ? 'bg-white text-[#00a8ff] font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Desktop</span>
            </button>
            <button
              onClick={() => setDeviceView('tablet')}
              className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition cursor-pointer ${
                deviceView === 'tablet'
                  ? 'bg-white text-[#00a8ff] font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tablet View"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tablet</span>
            </button>
            <button
              onClick={() => setDeviceView('mobile')}
              className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition cursor-pointer ${
                deviceView === 'mobile'
                  ? 'bg-white text-[#00a8ff] font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>
        ) : (
          <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            WordPress Appearance & Theme Studio
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {savedSuccess && (
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Saved Live</span>
            </div>
          )}

          <a
            href={getPreviewUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-200"
            title="Open Live Public Website"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#00a8ff]" />
            <span className="hidden sm:inline">Preview Live Site</span>
          </a>

          {/* Fullscreen Studio Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg transition border cursor-pointer ${
              isFullscreen
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-[#00a8ff]" />
                <span className="hidden lg:inline">Fullscreen</span>
              </>
            )}
          </button>

          {viewMode === 'builder' ? (
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending || updatePageMutation.isPending}
              className="bg-[#39b54a] hover:bg-[#32a242] text-white font-bold px-3.5 sm:px-4 py-1.5 rounded-lg text-xs shadow-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>
                {updateMutation.isPending || updatePageMutation.isPending
                  ? 'Saving...'
                  : activePageDraft?.status === 'Draft'
                  ? 'SAVE DRAFT'
                  : 'UPDATE'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setIsCreateThemeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#92003b] hover:bg-[#7e0033] text-white rounded-lg shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Theme</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN BODY: VIEW SWITCHER */}
      {/* ======================================================== */}
      {viewMode === 'directory' ? (
        // WORDPRESS THEMES DIRECTORY
        <div className="flex-1 overflow-y-auto bg-slate-50/70 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
                  <Paintbrush className="w-6 h-6 text-[#92003b]" />
                  Installed Themes
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Manage, preview, customize, or create custom luxury themes for your hotel website just like in WordPress.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={themeSearchQuery}
                    onChange={(e) => setThemeSearchQuery(e.target.value)}
                    placeholder="Search installed themes..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00a8ff]"
                  />
                </div>
                <button
                  onClick={() => setIsCreateThemeModalOpen(true)}
                  className="bg-[#92003b] hover:bg-[#7e0033] text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Theme
                </button>
              </div>
            </div>

            {/* Themes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {filteredThemes.map((theme) => {
                const isActive = theme.isActive || theme.id === formState.activeThemeId;
                return (
                  <div
                    key={theme.id}
                    className={`rounded-2xl overflow-hidden bg-white border transition-all duration-200 flex flex-col shadow-xs hover:shadow-md ${
                      isActive
                        ? 'border-[#00a8ff] ring-2 ring-[#00a8ff]/30'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="h-44 w-full relative overflow-hidden group bg-slate-100">
                      <img
                        src={theme.screenshotUrl || theme.bannerUrl}
                        alt={theme.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                        {isActive ? (
                          <button
                            onClick={() => setViewMode('builder')}
                            className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow cursor-pointer"
                          >
                            <Paintbrush className="w-3.5 h-3.5" /> Customize
                          </button>
                        ) : (
                          <button
                            onClick={() => activateThemeMutation.mutate(theme.id)}
                            className="bg-[#39b54a] hover:bg-[#32a242] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Activate
                          </button>
                        )}
                        <button
                          onClick={() => duplicateThemeMutation.mutate({ id: theme.id })}
                          className="bg-white/90 hover:bg-white text-slate-800 text-xs font-semibold p-2 rounded-lg shadow cursor-pointer"
                          title="Duplicate Theme"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {isActive && (
                        <div className="absolute top-3 left-3 bg-[#00a8ff] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                          Active
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-sm text-slate-900">{theme.name}</h3>
                          <span className="text-[10px] text-slate-400 font-mono">v{theme.version}</span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {theme.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
                        <span className="text-slate-400 text-[11px]">By {theme.author}</span>
                        {isActive ? (
                          <button
                            onClick={() => setViewMode('builder')}
                            className="text-xs font-bold text-[#00a8ff] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            Customize <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => activateThemeMutation.mutate(theme.id)}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                          >
                            Activate <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        // ========================================================
        // ELEMENTOR VISUAL BUILDER VIEW (Two-Way Click-to-Edit Inspector)
        // ========================================================
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* ======================================================== */}
          {/* LEFT SIDEBAR: DYNAMIC WIDGET GRID OR ELEMENT INSPECTOR */}
          {/* ======================================================== */}
          <div className="w-[330px] xl:w-[350px] bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 overflow-hidden shadow-md">
            {/* Top Elementor Header */}
            <div className="h-12 bg-white border-b border-slate-200 px-3 flex items-center justify-between shrink-0">
              {activeElement ? (
                <div className="flex items-center justify-between w-full">
                  <button
                    onClick={() => handleSelectElement(null)}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition cursor-pointer"
                    title="Back to Elementor Widgets"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#92003b]" />
                    <span>Elements</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Edit3 className="w-3.5 h-3.5 text-[#00a8ff]" />
                    <span className="capitalize">{activeElement.replace('_', ' ')}</span>
                  </div>

                  <button
                    onClick={() => handleSelectElement(null)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    title="Close Inspector"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition">
                      <Menu className="w-4 h-4" />
                    </button>
                    <span className="font-extrabold text-xs tracking-wider text-slate-800 uppercase">
                      ELEMENTOR
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-500">
                    <button
                      onClick={() => handleSelectElement(null)}
                      className="p-1.5 text-[#92003b] hover:bg-rose-50 rounded transition cursor-pointer"
                      title="Elements Palette"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* DYNAMIC PANEL CONTENT: INSPECTOR OR WIDGETS */}
            {activeElement ? (
              // Dedicated Element Inspector (Content | Style | Advanced)
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
                <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold shrink-0">
                  <button
                    onClick={() => setInspectorTab('content')}
                    className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer ${
                      inspectorTab === 'content'
                        ? 'border-[#92003b] text-slate-900 bg-white font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Content
                  </button>
                  <button
                    onClick={() => setInspectorTab('style')}
                    className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer ${
                      inspectorTab === 'style'
                        ? 'border-[#92003b] text-slate-900 bg-white font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Style
                  </button>
                  <button
                    onClick={() => setInspectorTab('advanced')}
                    className={`flex-1 py-2 text-center border-b-2 transition cursor-pointer ${
                      inspectorTab === 'advanced'
                        ? 'border-[#92003b] text-slate-900 bg-white font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Advanced
                  </button>
                </div>

                {/* Inspector Body Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                  {inspectorTab === 'content' && (
                    <div className="space-y-4">
                      {/* === CUSTOM PAGE INSPECTOR ELEMENTS === */}
                      {activePageId !== 'home' && activePageDraft && (
                        <>
                          {/* Page Title Inspector */}
                          {activeElement === 'page_title' && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-slate-700 font-bold mb-1">
                                  Page Title
                                </label>
                                <input
                                  type="text"
                                  value={activePageDraft.title}
                                  onChange={(e) =>
                                    setActivePageDraft({ ...activePageDraft, title: e.target.value })
                                  }
                                  placeholder="e.g. About Our Luxury Resort"
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-[#00a8ff] outline-none shadow-xs"
                                  autoFocus
                                />
                              </div>

                              <div>
                                <label className="block text-slate-700 font-bold mb-1">
                                  URL Slug
                                </label>
                                <input
                                  type="text"
                                  value={activePageDraft.slug}
                                  onChange={(e) =>
                                    setActivePageDraft({ ...activePageDraft, slug: e.target.value })
                                  }
                                  placeholder="e.g. /about"
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:border-[#00a8ff] outline-none shadow-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-slate-700 font-bold mb-1">
                                  Page Template
                                </label>
                                <select
                                  value={activePageDraft.template}
                                  onChange={(e) =>
                                    setActivePageDraft({ ...activePageDraft, template: e.target.value })
                                  }
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-[#00a8ff] outline-none shadow-xs"
                                >
                                  <option value="Standard Template">Standard Template</option>
                                  <option value="Landing Page">Landing Page</option>
                                  <option value="Legal Template">Legal Template</option>
                                  <option value="Full-Width Canvas">Full-Width Canvas</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-slate-700 font-bold mb-1">
                                  Publication Status
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActivePageDraft({ ...activePageDraft, status: 'Published' })
                                    }
                                    className={`p-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                      activePageDraft.status === 'Published'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-400/20'
                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span>Published</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActivePageDraft({ ...activePageDraft, status: 'Draft' })
                                    }
                                    className={`p-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                      activePageDraft.status === 'Draft'
                                        ? 'bg-amber-50 text-amber-800 border-amber-400 ring-2 ring-amber-400/20'
                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span>Draft</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Page Subtitle / Summary Inspector */}
                          {activeElement === 'page_subtitle' && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-slate-700 font-bold mb-1">
                                  Subtitle & Lead Summary
                                </label>
                                <textarea
                                  rows={4}
                                  value={activePageDraft.metaDescription || ''}
                                  onChange={(e) =>
                                    setActivePageDraft({ ...activePageDraft, metaDescription: e.target.value })
                                  }
                                  placeholder="Enter a brief summary or lead-in paragraph for this page..."
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:border-[#00a8ff] outline-none shadow-xs"
                                  autoFocus
                                />
                              </div>
                            </div>
                          )}

                          {/* Page Rich Text Content Inspector */}
                          {activeElement === 'page_content' && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                                <div>
                                  <span className="font-bold text-slate-800 text-xs block">
                                    Page Body Content
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    Powered by Tiptap, Editor.js & Markdown
                                  </span>
                                </div>
                                <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 font-bold px-2 py-0.5 rounded-full">
                                  Realtime Sync
                                </span>
                              </div>

                              <UnifiedRichEditor
                                label="Page Content"
                                value={activePageDraft.content || ''}
                                onChange={(content) =>
                                  setActivePageDraft({ ...activePageDraft, content })
                                }
                                placeholder="Type page content here... Supports Markdown, bold, headings, images, and lists."
                              />

                              {/* Quick Insert Snippet Buttons */}
                              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                                <span className="text-[11px] font-bold text-slate-700 block">
                                  Quick Insert Snippets:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleInsertWidgetToPage('heading')}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition"
                                  >
                                    + Heading
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleInsertWidgetToPage('text_editor')}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition"
                                  >
                                    + Paragraph
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleInsertWidgetToPage('icon_box')}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition"
                                  >
                                    + Highlights
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleInsertWidgetToPage('button')}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition"
                                  >
                                    + CTA Button
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleInsertWidgetToPage('image')}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition"
                                  >
                                    + Image
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Hero Section / Styling */}
                          {activeElement === 'page_hero' && (
                            <div className="space-y-3">
                              <label className="block text-slate-700 font-bold">
                                Hero Template Styling
                              </label>
                              <p className="text-[11px] text-slate-500">
                                This page uses the luxury gradient backdrop. You can edit the title and subtitle by clicking directly on them in the canvas.
                              </p>
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() => handleSelectElement('page_title')}
                                  className="w-full py-2 bg-sky-50 text-[#00a8ff] font-bold rounded-lg border border-sky-200 text-xs"
                                >
                                  Edit Page Title
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Features Section */}
                          {activeElement === 'page_features' && (
                            <div className="space-y-3">
                              <label className="block text-slate-700 font-bold">
                                3-Column Highlights Grid
                              </label>
                              <p className="text-[11px] text-slate-500">
                                Displays Bank-Grade Security, Curated 5-Star Standards, and 24/7 VIP Concierge.
                              </p>
                            </div>
                          )}

                          {/* CTA Section */}
                          {activeElement === 'page_cta' && (
                            <div className="space-y-3">
                              <label className="block text-slate-700 font-bold">
                                Call to Action Banner
                              </label>
                              <p className="text-[11px] text-slate-500">
                                High-converting luxury booking banner linking guests directly to reservation folios.
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      {/* === HOMEPAGE INSPECTOR ELEMENTS === */}
                      {activePageId === 'home' && (
                        <>
                          {/* Heading Inspector */}
                          {activeElement === 'heading' && (
                            <div className="space-y-3">
                              <label className="block text-slate-700 font-bold">
                                Hero Main Title
                              </label>
                              <input
                                type="text"
                                value={formState.heroTitle}
                                onChange={(e) =>
                                  setFormState({ ...formState, heroTitle: e.target.value })
                                }
                                placeholder="e.g. Find Your Next Extraordinary Stay"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-[#00a8ff] outline-none shadow-xs"
                                autoFocus
                              />
                              <p className="text-[11px] text-slate-500">
                                Type directly to see immediate updates in the canvas on the right.
                              </p>

                              <div className="pt-2 border-t border-slate-100">
                                <label className="block text-slate-700 font-bold mb-1.5">
                                  HTML Tag
                                </label>
                                <div className="flex gap-1">
                                  {['H1', 'H2', 'H3', 'H4'].map((tag) => (
                                    <button
                                      key={tag}
                                      type="button"
                                      className={`px-2.5 py-1 text-xs rounded border font-mono font-bold ${
                                        tag === 'H1'
                                          ? 'bg-slate-900 text-white border-slate-900'
                                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                      }`}
                                    >
                                      {tag}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Subheading / Text Editor Inspector */}
                          {activeElement === 'subheading' && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                                <div>
                                  <span className="font-bold text-slate-800 text-xs block">
                                    Text Editor
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    Powered by Tiptap & Editor.js
                                  </span>
                                </div>
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                                  Next.js 16 Active
                                </span>
                              </div>

                              <UnifiedRichEditor
                                label="Content Body"
                                value={formState.heroSubtitle || ''}
                                onChange={(content) =>
                                  setFormState({ ...formState, heroSubtitle: content })
                                }
                                placeholder="Type or format your text using Tiptap WYSIWYG or Editor.js blocks..."
                              />
                            </div>
                          )}

                          {/* Hero Section Inspector */}
                          {activeElement === 'hero_section' && (
                            <div className="space-y-3">
                              <label className="block text-slate-700 font-bold">
                                Hero Background Photo URL
                              </label>
                              <input
                                type="text"
                                value={formState.heroBannerUrl}
                                onChange={(e) =>
                                  setFormState({ ...formState, heroBannerUrl: e.target.value })
                                }
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:border-[#00a8ff] outline-none shadow-xs"
                              />

                              <div className="pt-2">
                                <label className="block text-slate-700 font-bold mb-1">
                                  Preset Luxury 4K Photos
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                  {PRESET_BANNERS.map((b, idx) => (
                                    <div
                                      key={idx}
                                      onClick={() =>
                                        setFormState({ ...formState, heroBannerUrl: b.url })
                                      }
                                      className={`h-14 rounded-lg overflow-hidden relative cursor-pointer border-2 transition ${
                                        formState.heroBannerUrl === b.url
                                          ? 'border-[#00a8ff] ring-2 ring-[#00a8ff]/30'
                                          : 'border-slate-200 hover:border-slate-300'
                                      }`}
                                      title={b.name}
                                    >
                                      <img
                                        src={b.url}
                                        alt={b.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Search Bar Inspector */}
                          {activeElement === 'search_bar' && (
                            <div className="space-y-4">
                              <label className="block text-slate-700 font-bold">
                                Active Category Tabs
                              </label>
                              <div className="space-y-1.5">
                                {SEARCH_TAB_OPTIONS.map((opt) => {
                                  const isChecked = formState.searchTabs?.includes(opt.id);
                                  return (
                                    <label
                                      key={opt.id}
                                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs cursor-pointer hover:bg-slate-100"
                                    >
                                      <span className="font-semibold text-slate-800 flex items-center gap-2">
                                        <span>{opt.icon}</span>
                                        <span>{opt.label}</span>
                                      </span>
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          const current = formState.searchTabs || [];
                                          const next = e.target.checked
                                            ? [...current, opt.id]
                                            : current.filter((x) => x !== opt.id);
                                          setFormState({ ...formState, searchTabs: next });
                                        }}
                                        className="w-4 h-4 accent-[#00a8ff] rounded"
                                      />
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Search Button Inspector */}
                          {activeElement === 'search_button' && (
                            <div className="space-y-3">
                              <label className="block text-slate-700 font-bold">
                                Search Button Text
                              </label>
                              <input
                                type="text"
                                value={formState.searchButtonText}
                                onChange={(e) =>
                                  setFormState({ ...formState, searchButtonText: e.target.value })
                                }
                                placeholder="e.g. Search Availability"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-[#00a8ff] outline-none"
                              />

                              <div className="pt-2 border-t border-slate-100">
                                <label className="block text-slate-700 font-bold mb-1.5">
                                  Button Color
                                </label>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="color"
                                    value={formState.searchButtonColor || '#00a8ff'}
                                    onChange={(e) =>
                                      setFormState({
                                        ...formState,
                                        searchButtonColor: e.target.value,
                                      })
                                    }
                                    className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                                  />
                                  <input
                                    type="text"
                                    value={formState.searchButtonColor || '#00a8ff'}
                                    onChange={(e) =>
                                      setFormState({
                                        ...formState,
                                        searchButtonColor: e.target.value,
                                      })
                                    }
                                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Feature Cards Inspector */}
                          {(activeElement === 'card_1' ||
                            activeElement === 'card_2' ||
                            activeElement === 'card_3' ||
                            activeElement === 'feature_cards') && (
                            <div className="space-y-4">
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
                                  Card 1 (Special Offers)
                                </span>
                                <input
                                  type="text"
                                  value={formState.featureCard1?.badge}
                                  onChange={(e) =>
                                    handleCardChange('featureCard1', 'badge', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                                  placeholder="Badge (e.g. HOLIDAY SALE)"
                                />
                                <input
                                  type="text"
                                  value={formState.featureCard1?.title}
                                  onChange={(e) =>
                                    handleCardChange('featureCard1', 'title', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                                  placeholder="Title (e.g. Special Offers)"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Header Nav Inspector */}
                      {activeElement === 'header_nav' && (
                        <div className="space-y-3">
                          <label className="block text-slate-700 font-bold">Site Title</label>
                          <input
                            type="text"
                            value={formState.siteTitle}
                            onChange={(e) =>
                              setFormState({ ...formState, siteTitle: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-[#00a8ff] outline-none"
                          />
                          <label className="block text-slate-700 font-bold mt-2">Site Tagline</label>
                          <input
                            type="text"
                            value={formState.siteTagline}
                            onChange={(e) =>
                              setFormState({ ...formState, siteTagline: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:border-[#00a8ff] outline-none"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {inspectorTab === 'style' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1.5">
                          Theme Primary Brand Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={formState.primaryColor || '#00a8ff'}
                            onChange={(e) =>
                              setFormState({ ...formState, primaryColor: e.target.value })
                            }
                            className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={formState.primaryColor || '#00a8ff'}
                            onChange={(e) =>
                              setFormState({ ...formState, primaryColor: e.target.value })
                            }
                            className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <label className="block text-slate-700 font-bold mb-1.5">
                          Accent Glow Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={formState.accentColor || '#0097e6'}
                            onChange={(e) =>
                              setFormState({ ...formState, accentColor: e.target.value })
                            }
                            className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={formState.accentColor || '#0097e6'}
                            onChange={(e) =>
                              setFormState({ ...formState, accentColor: e.target.value })
                            }
                            className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {inspectorTab === 'advanced' && (
                    <div className="space-y-4">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <span className="font-bold text-slate-800 block text-xs">
                          Element Dimensions & Z-Index
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Automated responsive padding and fluid flexbox distribution applied across Desktop, Tablet, and Mobile views.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Elements Palette View (Tabs: ELEMENTS, GLOBAL, SEO)
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
                <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold shrink-0">
                  <button
                    onClick={() => setActiveTab('elements')}
                    className={`flex-1 py-2.5 text-center border-b-2 transition cursor-pointer ${
                      activeTab === 'elements'
                        ? 'border-[#92003b] text-slate-900 bg-white font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    ELEMENTS
                  </button>
                  <button
                    onClick={() => setActiveTab('global')}
                    className={`flex-1 py-2.5 text-center border-b-2 transition cursor-pointer ${
                      activeTab === 'global'
                        ? 'border-[#92003b] text-slate-900 bg-white font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    GLOBAL
                  </button>
                  <button
                    onClick={() => setActiveTab('seo')}
                    className={`flex-1 py-2.5 text-center border-b-2 transition cursor-pointer ${
                      activeTab === 'seo'
                        ? 'border-[#92003b] text-slate-900 bg-white font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    SEO
                  </button>
                </div>

                {activeTab === 'elements' && (
                  <>
                    {/* Search Widgets Input */}
                    <div className="p-3 border-b border-slate-200 bg-white">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={searchWidgetQuery}
                          onChange={(e) => setSearchWidgetQuery(e.target.value)}
                          placeholder="Search Widget..."
                          className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#00a8ff] outline-none"
                        />
                      </div>
                    </div>

                    {/* Widgets Content */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-4">
                      {activePageId !== 'home' && (
                        <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-lg text-[11px] text-sky-800">
                          <span className="font-bold block mb-0.5">Custom Page Mode:</span>
                          Click any widget below to instantly append it into your active page content!
                        </div>
                      )}

                      {/* Basic Widgets Grid */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
                          <span>Basic Elements</span>
                          <ChevronDown className="w-3 h-3" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {filteredBasicWidgets.map((w) => {
                            const Icon = w.icon;
                            return (
                              <div
                                key={w.id}
                                onClick={w.action}
                                className="bg-white hover:bg-rose-50/40 border border-slate-200 hover:border-[#92003b] rounded-lg p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 group shadow-2xs"
                              >
                                <Icon className="w-5 h-5 text-slate-600 group-hover:text-[#92003b] transition-colors mb-1.5" />
                                <span className="text-[11px] font-medium text-slate-700 group-hover:text-slate-900">
                                  {w.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Hospitality Pro Widgets */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
                          <span>Hospitality & CMS (Pro)</span>
                          <ChevronDown className="w-3 h-3" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {filteredHospitalityWidgets.map((w) => {
                            const Icon = w.icon;
                            return (
                              <div
                                key={w.id}
                                onClick={w.action}
                                className="bg-sky-50/40 hover:bg-sky-50 border border-sky-100 hover:border-[#00a8ff] rounded-lg p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 group shadow-2xs"
                              >
                                <Icon className="w-5 h-5 text-sky-600 group-hover:text-sky-700 transition-colors mb-1.5" />
                                <span className="text-[11px] font-medium text-sky-900 group-hover:text-slate-900">
                                  {w.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'global' && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                    {activePageId !== 'home' && activePageDraft ? (
                      <>
                        <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-1">
                          <span className="font-bold text-sky-900 block text-xs">
                            Active Page: {activePageDraft.title}
                          </span>
                          <span className="text-[11px] text-sky-700">
                            Configure routing, template, and publication state for this page.
                          </span>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Page Title</label>
                          <input
                            type="text"
                            value={activePageDraft.title}
                            onChange={(e) =>
                              setActivePageDraft({ ...activePageDraft, title: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-[#00a8ff] outline-none shadow-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">URL Slug</label>
                          <input
                            type="text"
                            value={activePageDraft.slug}
                            onChange={(e) =>
                              setActivePageDraft({ ...activePageDraft, slug: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:border-[#00a8ff] outline-none shadow-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Template</label>
                          <select
                            value={activePageDraft.template}
                            onChange={(e) =>
                              setActivePageDraft({ ...activePageDraft, template: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-[#00a8ff] outline-none shadow-xs"
                          >
                            <option value="Standard Template">Standard Template</option>
                            <option value="Landing Page">Landing Page</option>
                            <option value="Legal Template">Legal Template</option>
                            <option value="Full-Width Canvas">Full-Width Canvas</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Publication Status</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setActivePageDraft({ ...activePageDraft, status: 'Published' })
                              }
                              className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                                activePageDraft.status === 'Published'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-400/20'
                                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                              <span>Published</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setActivePageDraft({ ...activePageDraft, status: 'Draft' })
                              }
                              className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                                activePageDraft.status === 'Draft'
                                  ? 'bg-amber-50 text-amber-800 border-amber-400 ring-2 ring-amber-400/20'
                                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                              <span>Draft</span>
                            </button>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-slate-500 text-[11px]">
                          <span>Updated: {activePageDraft.updated || 'Recently'}</span>
                          <button
                            type="button"
                            onClick={() => handleSave()}
                            disabled={updatePageMutation.isPending}
                            className="bg-[#39b54a] hover:bg-[#32a242] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Save className="w-3 h-3" /> Save Changes
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Platform Brand Title</label>
                          <input
                            type="text"
                            value={formState.siteTitle}
                            onChange={(e) =>
                              setFormState({ ...formState, siteTitle: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-[#00a8ff] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Brand Tagline</label>
                          <input
                            type="text"
                            value={formState.siteTagline}
                            onChange={(e) =>
                              setFormState({ ...formState, siteTagline: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:border-[#00a8ff] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1.5">Brand Primary Color</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={formState.primaryColor || '#00a8ff'}
                              onChange={(e) =>
                                setFormState({ ...formState, primaryColor: e.target.value })
                              }
                              className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                            />
                            <input
                              type="text"
                              value={formState.primaryColor || '#00a8ff'}
                              onChange={(e) =>
                                setFormState({ ...formState, primaryColor: e.target.value })
                              }
                              className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'seo' && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                    {activePageId !== 'home' && activePageDraft ? (
                      <>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <span className="font-bold text-slate-800 block text-xs flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-[#00a8ff]" />
                            Search Engine Optimization (SEO)
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Configure meta tags for Google indexing, social sharing, and search previews.
                          </span>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Meta Title</label>
                          <input
                            type="text"
                            value={activePageDraft.metaTitle || activePageDraft.title}
                            onChange={(e) =>
                              setActivePageDraft({ ...activePageDraft, metaTitle: e.target.value })
                            }
                            placeholder="e.g. Luxury Yacht Charters | OmniStay 360"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-[#00a8ff] outline-none shadow-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Meta Description</label>
                          <textarea
                            rows={3}
                            value={activePageDraft.metaDescription || ''}
                            onChange={(e) =>
                              setActivePageDraft({ ...activePageDraft, metaDescription: e.target.value })
                            }
                            placeholder="Enter concise search description (recommended 140-160 characters)..."
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:border-[#00a8ff] outline-none shadow-xs"
                          />
                        </div>

                        {/* Live Google Search Preview Card */}
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Google Search Snippet Preview
                          </span>
                          <div className="text-[11px] text-emerald-800 font-mono truncate">
                            https://omnistay.softsasi.com{activePageDraft.slug}
                          </div>
                          <div className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer truncate">
                            {activePageDraft.metaTitle || activePageDraft.title}
                          </div>
                          <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {activePageDraft.metaDescription ||
                              'Discover unparalleled luxury and frictionless hospitality reservations with Softsasi OmniStay 360.'}
                          </div>
                        </div>

                        {/* Delete Page Option */}
                        <div className="pt-4 border-t border-slate-200 space-y-2">
                          <span className="font-bold text-rose-600 block text-xs">Danger Zone</span>
                          <p className="text-[11px] text-slate-500">
                            Permanently delete this custom page from the database and public website.
                          </p>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(activePageDraft.id)}
                            className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete This Page</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <span className="font-bold text-slate-800 block text-xs">
                            Front Page Global SEO
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Configures metadata for the root landing portal.
                          </span>
                        </div>
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Global Meta Title</label>
                          <input
                            type="text"
                            value={formState.siteTitle + ' | Luxury Stays & Handcrafted Experiences'}
                            readOnly
                            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Elementor Footer Bar */}
            <div className="h-12 bg-white border-t border-slate-200 px-3 flex items-center justify-between shrink-0 text-slate-600">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  title="Page Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsNavigatorOpen(!isNavigatorOpen)}
                  className={`p-1.5 rounded transition cursor-pointer ${
                    isNavigatorOpen
                      ? 'bg-sky-100 text-[#00a8ff]'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                  title="Navigator"
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                  title="History"
                >
                  <History className="w-4 h-4" />
                </button>
                <a
                  href={getPreviewUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                  title="Preview Changes"
                >
                  <Eye className="w-4 h-4" />
                </a>
              </div>

              {/* Green Elementor UPDATE Button */}
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending || updatePageMutation.isPending}
                className="bg-[#39b54a] hover:bg-[#32a242] text-white text-xs font-bold px-3.5 py-1.5 rounded-md shadow-xs flex items-center gap-1 transition cursor-pointer"
              >
                {updateMutation.isPending || updatePageMutation.isPending ? (
                  <span>SAVING...</span>
                ) : savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>UPDATED</span>
                  </>
                ) : (
                  <span>UPDATE</span>
                )}
              </button>
            </div>
          </div>

          {/* Navigator Drawer */}
          {isNavigatorOpen && (
            <div className="w-64 bg-white border-r border-slate-200 p-3.5 flex flex-col z-10 shrink-0 text-xs shadow-xl animate-in slide-in-from-left-4 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#00a8ff]" /> Navigator
                </span>
                <button
                  onClick={() => setIsNavigatorOpen(false)}
                  className="hover:bg-slate-100 rounded p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1 overflow-y-auto flex-1">
                {activePageId === 'home' ? (
                  [
                    { key: 'hero', name: 'Hero Banner Section', icon: Columns3 },
                    { key: 'featureCards', name: 'Promotional 3-Cards', icon: Gift },
                    { key: 'featuredStays', name: 'Featured Rooms Grid', icon: BedDouble },
                    { key: 'newsletter', name: 'Newsletter & Footer', icon: Mail },
                  ].map((s) => {
                    const isVisible = formState.sections[s.key as keyof typeof formState.sections];
                    const isSelected = selectedSection === s.key;
                    return (
                      <div
                        key={s.key}
                        onClick={() => setSelectedSection(s.key as any)}
                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition ${
                          isSelected
                            ? 'bg-sky-50 text-[#00a8ff] font-bold border border-[#00a8ff]'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <s.icon className="w-3.5 h-3.5" />
                          <span className="truncate">{s.name}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSectionToggle(s.key as any);
                          }}
                          className="p-1 hover:bg-white rounded cursor-pointer"
                          title="Toggle Section Visibility"
                        >
                          {isVisible ? (
                            <Eye className="w-3.5 h-3.5 text-[#00a8ff]" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-slate-300" />
                          )}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  [
                    { key: 'page_title', name: 'Page Header & Title', icon: Heading },
                    { key: 'page_subtitle', name: 'Lead Description', icon: FileText },
                    { key: 'page_content', name: 'Main Body Content', icon: LayoutGrid },
                    { key: 'page_features', name: '3-Column Highlights', icon: Award },
                    { key: 'page_cta', name: 'Call to Action Banner', icon: Sparkles },
                  ].map((s) => (
                    <div
                      key={s.key}
                      onClick={() => handleSelectElement(s.key as any)}
                      className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition ${
                        activeElement === s.key
                          ? 'bg-sky-50 text-[#00a8ff] font-bold border border-[#00a8ff]'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <s.icon className="w-3.5 h-3.5" />
                        <span className="truncate">{s.name}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* RIGHT LIVE WYSIWYG CANVAS */}
          {/* ======================================================== */}
          <div className="flex-1 bg-[#eef2f6] flex items-center justify-center p-3 sm:p-5 min-h-0 overflow-auto">
            <div
              className={`transition-all duration-300 bg-white text-slate-900 shadow-2xl flex flex-col overflow-y-auto ${
                deviceView === 'desktop'
                  ? 'w-full h-full rounded-xl border border-slate-200'
                  : deviceView === 'tablet'
                  ? 'w-[768px] h-[95%] rounded-3xl border-8 border-slate-700 shadow-2xl'
                  : 'w-[390px] h-[95%] rounded-[40px] border-[10px] border-slate-800 shadow-2xl ring-1 ring-slate-900/10'
              }`}
            >
              {/* Mobile Notch Indicator */}
              {deviceView === 'mobile' && (
                <div className="h-6 w-full bg-slate-800 shrink-0 flex items-center justify-center">
                  <div className="w-20 h-3 bg-black rounded-full" />
                </div>
              )}

              {/* 1. TOP PUBLIC WEBSITE HEADER */}
              <div
                id="canvas-header_nav"
                onClick={() => handleSelectElement('header_nav')}
                className={`h-16 border-b border-slate-100 px-6 sm:px-8 flex items-center justify-between bg-white/95 backdrop-blur-md shrink-0 sticky top-0 z-20 shadow-xs cursor-pointer transition-all ${
                  activeElement === 'header_nav'
                    ? 'ring-4 ring-[#00a8ff] ring-offset-2'
                    : 'hover:ring-2 hover:ring-[#00a8ff]/40'
                }`}
              >
                {/* Brand Logo & Tagline */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-md"
                    style={{ backgroundColor: formState.primaryColor || '#00a8ff' }}
                  >
                    OS
                  </div>
                  <div>
                    <span className="font-black text-sm tracking-tight text-slate-900 block leading-tight">
                      {formState.siteTitle || 'OmniStay 360'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block leading-none">
                      {formState.siteTagline || 'Luxury Stays & Handcrafted Experiences'}
                    </span>
                  </div>
                </div>

                {/* Public Navigation Links */}
                <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-700">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePageId('home');
                    }}
                    className={`cursor-pointer transition ${
                      activePageId === 'home'
                        ? 'text-[#00a8ff] border-b-2 border-[#00a8ff] pb-0.5'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    Stays & Resorts
                  </span>
                  <span className="hover:text-slate-900 transition">Private Villas</span>
                  <span className="hover:text-slate-900 transition">Experiences</span>
                  <span className="hover:text-slate-900 transition">Destinations</span>
                  <span className="hover:text-slate-900 transition">Yacht Charters</span>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="hidden lg:inline text-slate-500 font-semibold hover:text-slate-900">
                    Become a Partner
                  </span>
                  <button
                    className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-sm transition hover:opacity-95 cursor-pointer"
                    style={{ backgroundColor: formState.primaryColor || '#00a8ff' }}
                  >
                    Sign In
                  </button>
                </div>
              </div>

              {/* 2. DYNAMIC CANVAS BODY: HOMEPAGE VS CUSTOM PAGE */}
              {activePageId === 'home' ? (
                // === HOMEPAGE CANVAS ===
                <>
                  {/* Hero Section */}
                  {formState.sections.hero && (
                    <div
                      id="canvas-hero_section"
                      onClick={() => handleSelectElement('hero_section')}
                      className={`relative group/section cursor-pointer transition-all ${
                        activeElement === 'hero_section'
                          ? 'ring-4 ring-blue-500 ring-offset-2'
                          : 'hover:ring-2 hover:ring-blue-400/60'
                      }`}
                    >
                      <div
                        className={`absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md transition-opacity cursor-pointer ${
                          activeElement === 'hero_section'
                            ? 'bg-blue-600 opacity-100 ring-2 ring-white'
                            : 'bg-blue-600/90 opacity-0 group-hover/section:opacity-100'
                        }`}
                      >
                        <Columns3 className="w-3.5 h-3.5" />
                        <span>Section: Hero Banner (Click to Edit)</span>
                        <Edit3 className="w-3 h-3 ml-1" />
                      </div>

                      <div className="relative min-h-[440px] sm:min-h-[480px] w-full overflow-hidden flex items-center py-10">
                        <img
                          src={formState.heroBannerUrl}
                          alt="Hero Banner"
                          className="absolute inset-0 w-full h-full object-cover object-center"
                        />
                        <div
                          className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/80 transition-opacity"
                          style={{ opacity: Math.max(0.2, formState.heroOverlayOpacity) }}
                        />

                        {/* Watermark Luxury Typography */}
                        <div className="pointer-events-none absolute bottom-2 left-0 right-0 overflow-hidden select-none z-5 text-center">
                          <span className="text-[11vw] font-serif font-black tracking-[0.25em] uppercase text-white/[0.06] leading-none whitespace-nowrap block">
                            LUXURY HOTEL
                          </span>
                        </div>

                        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-8 text-left">
                          {/* 5-Star Rating Pill */}
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 mb-3 shadow-sm">
                            <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                              ★★★★★
                            </div>
                            <span className="text-[10px] font-semibold tracking-wider text-amber-200 uppercase ml-1">
                              5-Star Luxury Experience
                            </span>
                          </div>

                          {/* Heading Widget */}
                          <div
                            id="canvas-heading"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectElement('heading');
                            }}
                            className={`relative group/h1 inline-block p-1.5 -ml-1.5 rounded-xl transition-all cursor-pointer ${
                              activeElement === 'heading'
                                ? 'outline-2 outline-solid outline-[#00a8ff] outline-offset-4 ring-4 ring-[#00a8ff]/30 bg-[#00a8ff]/10'
                                : 'hover:outline-2 hover:outline-dashed hover:outline-[#00a8ff] hover:outline-offset-2'
                            }`}
                          >
                            <div
                              className={`absolute -top-3.5 left-2 z-30 transition-opacity flex items-center gap-1.5 bg-[#00a8ff] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md ${
                                activeElement === 'heading'
                                  ? 'opacity-100 ring-2 ring-white'
                                  : 'opacity-0 group-hover/h1:opacity-100'
                              }`}
                            >
                              <Heading className="w-3 h-3" />
                              <span>Edit Heading</span>
                            </div>
                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-lg leading-tight max-w-3xl">
                              {formState.heroTitle || 'Find Your Next Extraordinary Stay'}
                            </h1>
                          </div>

                          {/* Subheading / Text Widget */}
                          <div
                            id="canvas-subheading"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectElement('subheading');
                            }}
                            className={`relative group/sub block p-1.5 -ml-1.5 rounded-xl transition-all cursor-pointer mt-3 mb-6 max-w-2xl ${
                              activeElement === 'subheading'
                                ? 'outline-2 outline-solid outline-[#00a8ff] outline-offset-4 ring-4 ring-[#00a8ff]/30 bg-[#00a8ff]/10'
                                : 'hover:outline-2 hover:outline-dashed hover:outline-[#00a8ff] hover:outline-offset-2'
                            }`}
                          >
                            <div
                              className={`absolute -top-3.5 left-2 z-30 transition-opacity flex items-center gap-1.5 bg-[#00a8ff] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md ${
                                activeElement === 'subheading'
                                  ? 'opacity-100 ring-2 ring-white'
                                  : 'opacity-0 group-hover/sub:opacity-100'
                              }`}
                            >
                              <FileText className="w-3 h-3" />
                              <span>Edit Text Editor (Tiptap / Editor.js)</span>
                            </div>
                            {formState.heroSubtitle && (formState.heroSubtitle.includes('<') || formState.heroSubtitle.startsWith('{')) ? (
                              <div
                                className="text-sm sm:text-base font-medium text-white/95 drop-shadow-md leading-relaxed prose prose-invert max-w-none [&_p]:my-1"
                                dangerouslySetInnerHTML={{
                                  __html: formState.heroSubtitle.startsWith('{')
                                    ? (() => {
                                        try {
                                          const data = JSON.parse(formState.heroSubtitle);
                                          return (data.blocks || []).map((b: any) => `<p>${b.data?.text || ''}</p>`).join('');
                                        } catch {
                                          return formState.heroSubtitle;
                                        }
                                      })()
                                    : formState.heroSubtitle,
                                }}
                              />
                            ) : (
                              <p className="text-sm sm:text-base font-medium text-white/95 drop-shadow-md leading-relaxed">
                                {formState.heroSubtitle ||
                                  'Book handpicked 5-star suites, private beachfront villas, and bespoke journeys across 45+ premier destinations.'}
                              </p>
                            )}
                          </div>

                          {/* Search Bar Capsule Widget */}
                          <div
                            id="canvas-search_bar"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectElement('search_bar');
                            }}
                            className={`relative group/search max-w-3xl rounded-2xl bg-white/95 backdrop-blur-md p-3 sm:p-4 shadow-2xl transition-all cursor-pointer ${
                              activeElement === 'search_bar'
                                ? 'outline-2 outline-solid outline-[#00a8ff] outline-offset-4 ring-4 ring-[#00a8ff]/30'
                                : 'hover:outline-2 hover:outline-dashed hover:outline-[#00a8ff] hover:outline-offset-2'
                            }`}
                          >
                            <div
                              className={`absolute -top-3.5 left-3 z-30 transition-opacity flex items-center gap-1.5 bg-[#00a8ff] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md ${
                                activeElement === 'search_bar'
                                  ? 'opacity-100 ring-2 ring-white'
                                  : 'opacity-0 group-hover/search:opacity-100'
                              }`}
                            >
                              <Search className="w-3 h-3" />
                              <span>Search Engine Widget (Figure 5.1)</span>
                            </div>

                            {/* Category Tabs */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 border-b border-slate-100 text-xs font-bold text-slate-600">
                              {(formState.searchTabs || ['hotel', 'space', 'tour']).map((tabKey) => {
                                const tabOpt = SEARCH_TAB_OPTIONS.find((t) => t.id === tabKey);
                                const isSelected = activeTabPreview === tabKey;
                                return (
                                  <button
                                    key={tabKey}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTabPreview(tabKey);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                                      isSelected
                                        ? 'bg-[#00a8ff] text-white shadow-xs'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <span>{tabOpt?.icon || '🏨'}</span>
                                    <span>{tabOpt?.label || tabKey}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Search Fields Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 items-center text-left">
                              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                                  Destination
                                </span>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mt-0.5">
                                  <MapPin className="w-3.5 h-3.5 text-[#00a8ff]" />
                                  <span>Bali, Indonesia</span>
                                </div>
                              </div>

                              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                                  Check-in — Check-out
                                </span>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mt-0.5">
                                  <Calendar className="w-3.5 h-3.5 text-[#00a8ff]" />
                                  <span>Nov 15 – Nov 22 (7 nights)</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex-1 p-2 rounded-xl bg-slate-50 border border-slate-100">
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                                    Guests
                                  </span>
                                  <span className="text-xs font-bold text-slate-800 mt-0.5 block truncate">
                                    2 Guests · 1 Rm
                                  </span>
                                </div>

                                <button
                                  id="canvas-search_button"
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectElement('search_button');
                                  }}
                                  className="h-11 px-4 rounded-xl text-white font-extrabold text-xs shadow-md transition hover:opacity-95 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                                  style={{
                                    backgroundColor:
                                      formState.searchButtonColor || formState.primaryColor || '#00a8ff',
                                  }}
                                >
                                  <Search className="w-3.5 h-3.5" />
                                  <span>{formState.searchButtonText || 'Search Availability'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. PROMOTIONAL 3-CARDS */}
                  {formState.sections.featureCards && (
                    <div
                      id="canvas-feature_cards"
                      onClick={() => handleSelectElement('feature_cards')}
                      className={`py-10 px-6 sm:px-8 bg-slate-50 relative group/fc cursor-pointer transition-all ${
                        activeElement === 'feature_cards' ||
                        activeElement === 'card_1' ||
                        activeElement === 'card_2' ||
                        activeElement === 'card_3'
                          ? 'ring-4 ring-blue-500 ring-offset-2'
                          : 'hover:ring-2 hover:ring-blue-400/60'
                      }`}
                    >
                      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div
                          id="canvas-card_1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectElement('card_1');
                          }}
                          className={`rounded-2xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[160px] shadow-sm transition cursor-pointer ${
                            activeElement === 'card_1' ? 'ring-4 ring-rose-500' : ''
                          }`}
                          style={{
                            background:
                              formState.featureCard1?.bg ||
                              'linear-gradient(135deg, #00a8ff 0%, #0097e6 100%)',
                          }}
                        >
                          <span className="text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white px-2.5 py-0.5 rounded-full w-fit shadow-xs">
                            {formState.featureCard1?.badge || 'HOLIDAY SALE'}
                          </span>
                          <h3 className="text-xl font-black mt-3">
                            {formState.featureCard1?.title || 'Special Offers'}
                          </h3>
                        </div>

                        <div
                          id="canvas-card_2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectElement('card_2');
                          }}
                          className={`rounded-2xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[160px] shadow-sm transition cursor-pointer ${
                            activeElement === 'card_2' ? 'ring-4 ring-blue-500' : ''
                          }`}
                          style={{
                            background:
                              formState.featureCard2?.bg ||
                              'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          }}
                        >
                          <Mail className="w-7 h-7 text-white/90" />
                          <h3 className="text-xl font-black mt-3">
                            {formState.featureCard2?.title || 'Newsletters'}
                          </h3>
                        </div>

                        <div
                          id="canvas-card_3"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectElement('card_3');
                          }}
                          className={`rounded-2xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[160px] shadow-sm transition cursor-pointer ${
                            activeElement === 'card_3' ? 'ring-4 ring-amber-500' : ''
                          }`}
                          style={{
                            background:
                              formState.featureCard3?.bg ||
                              'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          }}
                        >
                          <Compass className="w-7 h-7 text-white/90" />
                          <h3 className="text-xl font-black mt-3">
                            {formState.featureCard3?.title || 'Travel Tips'}
                          </h3>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. FEATURED STAYS & SANCTUARIES */}
                  {formState.sections.featuredStays && (
                    <div
                      id="canvas-featured_stays"
                      onClick={() => handleSelectElement('featured_stays')}
                      className={`py-12 px-6 sm:px-8 bg-white relative group/stays cursor-pointer transition-all ${
                        activeElement === 'featured_stays'
                          ? 'ring-4 ring-blue-500 ring-offset-2'
                          : 'hover:ring-2 hover:ring-blue-400/60'
                      }`}
                    >
                      <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <span className="text-[11px] font-extrabold uppercase text-[#00a8ff] tracking-wider block mb-0.5">
                              Direct Hotel Inventory
                            </span>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                              Featured Luxury Stays & Sanctuaries
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Curated 5-star suites and beachfront villas with guaranteed best rates.
                            </p>
                          </div>
                          <span className="text-xs font-bold text-[#00a8ff] hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          {[
                            {
                              title: 'The Overwater Azure Sanctuary',
                              loc: 'Bora Bora, French Polynesia',
                              price: '$720',
                              rating: '4.98 (124)',
                              badge: 'Guest Favorite',
                              img: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=700&q=80',
                            },
                            {
                              title: 'Villa Amanzi Cliffside Retreat',
                              loc: 'Phuket, Thailand',
                              price: '$540',
                              rating: '4.95 (88)',
                              badge: 'Rare Find',
                              img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=700&q=80',
                            },
                            {
                              title: 'The Matterhorn Alpine Lodge',
                              loc: 'Zermatt, Switzerland',
                              price: '$680',
                              rating: '4.99 (210)',
                              badge: 'Superhost Verified',
                              img: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=700&q=80',
                            },
                          ].map((stay, idx) => (
                            <div
                              key={idx}
                              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col group/card"
                            >
                              <div className="h-44 w-full relative overflow-hidden">
                                <img
                                  src={stay.img}
                                  alt={stay.title}
                                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                                  {stay.badge}
                                </div>
                                <button className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-rose-600 shadow-sm transition">
                                  <Heart className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="p-4 text-left flex-1 flex flex-col justify-between">
                                <div>
                                  <span className="text-[11px] text-[#00a8ff] font-bold block mb-0.5">
                                    {stay.loc}
                                  </span>
                                  <h4 className="font-bold text-sm text-slate-900 group-hover/card:text-[#00a8ff] transition-colors leading-tight">
                                    {stay.title}
                                  </h4>
                                  <span className="text-[11px] text-slate-400 block mt-1">
                                    King Suite · Private Infinity Pool · Ocean View
                                  </span>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                                  <div>
                                    <span className="font-black text-sm text-slate-900">
                                      {stay.price}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium"> / night</span>
                                  </div>
                                  <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
                                    ★ {stay.rating}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. NEWSLETTER & VIP CLUB */}
                  {formState.sections.newsletter && (
                    <div
                      id="canvas-newsletter"
                      onClick={() => handleSelectElement('newsletter')}
                      className={`py-12 px-6 sm:px-8 bg-slate-950 text-white relative group/news cursor-pointer transition-all ${
                        activeElement === 'newsletter'
                          ? 'ring-4 ring-blue-500 ring-offset-2'
                          : 'hover:ring-2 hover:ring-blue-400/60'
                      }`}
                    >
                      <div className="max-w-xl mx-auto text-center space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#00a8ff] bg-sky-950/60 border border-sky-800 px-3 py-1 rounded-full">
                          OMNISTAY PRIVÉ CLUB
                        </span>
                        <h3 className="text-2xl font-black tracking-tight text-white">
                          Unlock Secret Rates & VIP Privileges
                        </h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                          Join 45,000+ luxury travelers for exclusive members-only rates and complimentary upgrades.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : activePageDraft ? (
                // === DYNAMIC CUSTOM CMS PAGE CANVAS ===
                <div className="flex-1 flex flex-col bg-slate-50/40">
                  {/* Breadcrumb & Admin Ribbon */}
                  <div className="bg-slate-100/90 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-500">
                      <button
                        onClick={() => setActivePageId('home')}
                        className="hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Home className="w-3.5 h-3.5" /> Home
                      </button>
                      <span>/</span>
                      <span className="text-slate-400">Pages</span>
                      <span>/</span>
                      <span className="font-bold text-slate-800 truncate max-w-[200px]">
                        {activePageDraft.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                        {activePageDraft.slug}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextStatus =
                            activePageDraft.status === 'Published' ? 'Draft' : 'Published';
                          setActivePageDraft({ ...activePageDraft, status: nextStatus });
                        }}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 transition cursor-pointer ${
                          activePageDraft.status === 'Published'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                        title="Click to toggle status"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            activePageDraft.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <span>{activePageDraft.status || 'Draft'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Custom Page Hero Banner */}
                  <div
                    id="canvas-page_hero"
                    onClick={() => handleSelectElement('page_hero')}
                    className={`relative bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white py-14 px-6 sm:px-10 border-b border-slate-800 group/hero cursor-pointer transition-all ${
                      activeElement === 'page_hero'
                        ? 'ring-4 ring-[#00a8ff] ring-offset-2'
                        : 'hover:ring-2 hover:ring-[#00a8ff]/40'
                    }`}
                  >
                    <div className="max-w-4xl mx-auto space-y-4">
                      {/* Template Tag */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold uppercase tracking-wider text-sky-300">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{activePageDraft.template || 'Standard Template'}</span>
                      </div>

                      {/* Page Title (Click to Edit) */}
                      <div
                        id="canvas-page_title"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectElement('page_title');
                        }}
                        className={`relative group/title inline-block p-1.5 -ml-1.5 rounded-xl transition-all cursor-pointer ${
                          activeElement === 'page_title'
                            ? 'outline-2 outline-solid outline-[#00a8ff] outline-offset-4 ring-4 ring-[#00a8ff]/30 bg-[#00a8ff]/10'
                            : 'hover:outline-2 hover:outline-dashed hover:outline-[#00a8ff] hover:outline-offset-2'
                        }`}
                      >
                        <div
                          className={`absolute -top-3.5 left-2 z-30 transition-opacity flex items-center gap-1 bg-[#00a8ff] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow ${
                            activeElement === 'page_title'
                              ? 'opacity-100 ring-1 ring-white'
                              : 'opacity-0 group-hover/title:opacity-100'
                          }`}
                        >
                          <Heading className="w-3 h-3" />
                          <span>Edit Title</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
                          {activePageDraft.title || 'Untitled Page'}
                        </h1>
                      </div>

                      {/* Page Subtitle / Summary (Click to Edit) */}
                      <div
                        id="canvas-page_subtitle"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectElement('page_subtitle');
                        }}
                        className={`relative group/sub block p-1.5 -ml-1.5 rounded-xl transition-all cursor-pointer max-w-2xl ${
                          activeElement === 'page_subtitle'
                            ? 'outline-2 outline-solid outline-[#00a8ff] outline-offset-4 ring-4 ring-[#00a8ff]/30 bg-[#00a8ff]/10'
                            : 'hover:outline-2 hover:outline-dashed hover:outline-[#00a8ff] hover:outline-offset-2'
                        }`}
                      >
                        <div
                          className={`absolute -top-3.5 left-2 z-30 transition-opacity flex items-center gap-1 bg-[#00a8ff] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow ${
                            activeElement === 'page_subtitle'
                              ? 'opacity-100 ring-1 ring-white'
                              : 'opacity-0 group-hover/sub:opacity-100'
                          }`}
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Subtitle / Summary</span>
                        </div>
                        <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                          {activePageDraft.metaDescription ||
                            'Curated luxury hospitality and bespoke experiences across premier global destinations.'}
                        </p>
                      </div>

                      {/* Action Buttons in Hero */}
                      <div className="pt-2 flex items-center gap-3">
                        <button
                          type="button"
                          className="px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition cursor-pointer"
                          style={{ backgroundColor: formState.primaryColor || '#00a8ff' }}
                        >
                          Contact Concierge
                        </button>
                        <button
                          type="button"
                          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition cursor-pointer"
                        >
                          Explore Services
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Custom Page Main Content Card */}
                  <div className="max-w-4xl w-full mx-auto p-6 sm:p-10 space-y-8 flex-1">
                    <div
                      id="canvas-page_content"
                      onClick={() => handleSelectElement('page_content')}
                      className={`bg-white rounded-3xl p-6 sm:p-10 border transition-all cursor-pointer relative group/content ${
                        activeElement === 'page_content'
                          ? 'border-[#00a8ff] ring-4 ring-[#00a8ff]/20 shadow-lg'
                          : 'border-slate-200/90 shadow-xs hover:border-[#00a8ff]/50'
                      }`}
                    >
                      <div
                        className={`absolute top-3 right-3 transition-opacity flex items-center gap-1.5 bg-[#00a8ff] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow ${
                          activeElement === 'page_content'
                            ? 'opacity-100'
                            : 'opacity-0 group-hover/content:opacity-100'
                        }`}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Click to Edit Content (Tiptap / Editor.js)</span>
                      </div>

                      {/* Rendered Markdown Body */}
                      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4">
                        {renderMarkdownPreview(activePageDraft.content || '')}
                      </div>

                      {/* In-Canvas Quick Add Block Toolbar */}
                      <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 p-4 rounded-2xl">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5 text-[#00a8ff]" />
                          Insert Block Into Page:
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInsertWidgetToPage('heading');
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-[#00a8ff] border border-slate-200 hover:border-[#00a8ff] rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            + Heading
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInsertWidgetToPage('text_editor');
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-[#00a8ff] border border-slate-200 hover:border-[#00a8ff] rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            + Paragraph
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInsertWidgetToPage('icon_box');
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-[#00a8ff] border border-slate-200 hover:border-[#00a8ff] rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            + Highlights
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInsertWidgetToPage('button');
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-[#00a8ff] border border-slate-200 hover:border-[#00a8ff] rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            + CTA Button
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInsertWidgetToPage('image');
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-[#00a8ff] border border-slate-200 hover:border-[#00a8ff] rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            + Image
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Feature Highlights Grid */}
                    <div
                      id="canvas-page_features"
                      onClick={() => handleSelectElement('page_features')}
                      className={`grid grid-cols-1 md:grid-cols-3 gap-5 cursor-pointer rounded-2xl p-2 transition-all ${
                        activeElement === 'page_features'
                          ? 'ring-4 ring-[#00a8ff] ring-offset-2'
                          : 'hover:ring-2 hover:ring-[#00a8ff]/30'
                      }`}
                    >
                      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#00a8ff] flex items-center justify-center font-bold">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">Bank-Grade Security</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          256-bit encryption for folio transactions, guest profiles, and reservation settlements.
                        </p>
                      </div>
                      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                          <Award className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">Curated 5-Star Standards</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Every property and excursion meets strict luxury hospitality standards and verified reviews.
                        </p>
                      </div>
                      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">24/7 VIP Concierge</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Autonomous multi-lingual AI and human concierge for real-time assistance and bespoke requests.
                        </p>
                      </div>
                    </div>

                    {/* High-Converting CTA Banner */}
                    <div
                      id="canvas-page_cta"
                      onClick={() => handleSelectElement('page_cta')}
                      className={`rounded-3xl p-8 sm:p-10 text-white text-center space-y-4 relative overflow-hidden shadow-xl cursor-pointer transition-all ${
                        activeElement === 'page_cta'
                          ? 'ring-4 ring-blue-500 ring-offset-2'
                          : 'hover:ring-2 hover:ring-blue-400/40'
                      }`}
                      style={{
                        background: 'linear-gradient(135deg, #09172e 0%, #00a8ff 100%)',
                      }}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest text-sky-200 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                        EXPERIENCE THE EXTRAORDINARY
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white max-w-xl mx-auto">
                        Ready to Craft Your Unforgettable Journey?
                      </h3>
                      <p className="text-xs sm:text-sm text-sky-100 max-w-lg mx-auto leading-relaxed">
                        Join thousands of discerning travelers who trust Softsasi OmniStay 360 for luxury accommodations and bespoke itineraries.
                      </p>
                      <div className="pt-2">
                        <button
                          type="button"
                          className="px-6 py-3 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-lg hover:bg-slate-100 transition cursor-pointer"
                        >
                          Explore Portfolio & Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. CREATE NEW CUSTOM THEME MODAL (WordPress Style) */}
      {/* ======================================================== */}
      {isCreateThemeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#92003b] flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Create New Custom Theme</h3>
                  <span className="text-[11px] text-slate-500">
                    WordPress-Style Custom Theme Generator
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCreateThemeModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTheme.name.trim()) return;
                createThemeMutation.mutate({
                  ...newTheme,
                  isActive: true,
                  screenshotUrl: newTheme.bannerUrl,
                });
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Theme Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTheme.name}
                  onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                  placeholder="e.g. Santorini Pearl Sunset"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-[#00a8ff] outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newTheme.description}
                  onChange={(e) => setNewTheme({ ...newTheme, description: e.target.value })}
                  placeholder="e.g. Aegean coastal palette curated for boutique hotels & luxury villas."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:border-[#00a8ff] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newTheme.primaryColor}
                      onChange={(e) =>
                        setNewTheme({ ...newTheme, primaryColor: e.target.value })
                      }
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={newTheme.primaryColor}
                      onChange={(e) =>
                        setNewTheme({ ...newTheme, primaryColor: e.target.value })
                      }
                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newTheme.accentColor}
                      onChange={(e) =>
                        setNewTheme({ ...newTheme, accentColor: e.target.value })
                      }
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={newTheme.accentColor}
                      onChange={(e) =>
                        setNewTheme({ ...newTheme, accentColor: e.target.value })
                      }
                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Preset */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-slate-700 font-bold">
                  Theme Hero Backdrop Photo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_BANNERS.map((b, idx) => (
                    <div
                      key={idx}
                      onClick={() => setNewTheme({ ...newTheme, bannerUrl: b.url })}
                      className={`h-16 rounded-lg overflow-hidden relative cursor-pointer border-2 transition ${
                        newTheme.bannerUrl === b.url
                          ? 'border-[#00a8ff] ring-2 ring-[#00a8ff]/30'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={b.url}
                        alt={b.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateThemeModalOpen(false)}
                  className="text-xs font-semibold px-4 py-2 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createThemeMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow cursor-pointer"
                >
                  {createThemeMutation.isPending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Building Theme...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Create & Activate Theme</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. CREATE NEW PAGE MODAL (Multi-Page CMS Builder) */}
      {/* ======================================================== */}
      {isCreatePageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00a8ff] flex items-center justify-center text-white shadow-xs font-black">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Create New Page</h3>
                  <span className="text-[11px] text-slate-500">
                    Create and publish a new website page with Elementor
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCreatePageModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPageForm.title.trim()) return;
                const cleanSlug = newPageForm.slug.trim()
                  ? (newPageForm.slug.startsWith('/') ? newPageForm.slug : `/${newPageForm.slug}`)
                  : generateSlug(newPageForm.title);

                const starterContent = getStarterContent(newPageForm.starterLayout, newPageForm.title);

                createPageMutation.mutate({
                  title: newPageForm.title.trim(),
                  slug: cleanSlug,
                  template: newPageForm.template,
                  status: newPageForm.status,
                  content: starterContent,
                  metaTitle: newPageForm.metaTitle.trim() || newPageForm.title.trim(),
                  metaDescription: newPageForm.metaDescription.trim(),
                });
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Page Title *
                </label>
                <input
                  type="text"
                  required
                  value={newPageForm.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewPageForm({
                      ...newPageForm,
                      title: val,
                      slug: newPageForm.slug === generateSlug(newPageForm.title) || !newPageForm.slug
                        ? generateSlug(val)
                        : newPageForm.slug,
                    });
                  }}
                  placeholder="e.g. Luxury Yacht Charters & Island Expeditions"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-[#00a8ff] outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPageForm.slug}
                    onChange={(e) => setNewPageForm({ ...newPageForm, slug: e.target.value })}
                    placeholder="e.g. /yacht-charters"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:border-[#00a8ff] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Page Template
                  </label>
                  <select
                    value={newPageForm.template}
                    onChange={(e) => setNewPageForm({ ...newPageForm, template: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:border-[#00a8ff] outline-none"
                  >
                    <option value="Standard Template">Standard Template</option>
                    <option value="Landing Page">Landing Page</option>
                    <option value="Legal Template">Legal Template</option>
                    <option value="Full-Width Canvas">Full-Width Canvas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Initial Publication Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPageForm({ ...newPageForm, status: 'Published' })}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      newPageForm.status === 'Published'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Published (Live)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPageForm({ ...newPageForm, status: 'Draft' })}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      newPageForm.status === 'Draft'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold ring-2 ring-amber-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Draft (Private)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Starter Content Preset
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'service', label: 'Service / Travel Experience', icon: Compass },
                    { id: 'showcase', label: 'Destination Showcase', icon: ImageIcon },
                    { id: 'legal', label: 'Terms & Compliance', icon: ShieldCheck },
                    { id: 'blank', label: 'Blank Canvas', icon: FileText },
                  ].map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setNewPageForm({ ...newPageForm, starterLayout: p.id })}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                          newPageForm.starterLayout === p.id
                            ? 'border-[#00a8ff] bg-sky-50 text-[#00a8ff] font-bold ring-2 ring-[#00a8ff]/20'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreatePageModalOpen(false)}
                  className="text-xs font-semibold px-4 py-2 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPageMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow cursor-pointer"
                >
                  {createPageMutation.isPending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Page...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create & Open in Elementor</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. DELETE PAGE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-sm text-slate-900">Delete Page?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <span className="font-bold text-slate-700">"{activePageDraft?.title}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                onClick={() => deletePageMutation.mutate(deleteConfirmId)}
                disabled={deletePageMutation.isPending}
              >
                {deletePageMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
