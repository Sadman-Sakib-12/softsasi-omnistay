'use client';

import React, { useState } from 'react';
import { BeatLoader } from 'react-spinners';
import {
  Bot,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Settings,
  CheckCircle2,
  Shield,
  Brain,
  BookOpen,
  DollarSign,
  Users,
  Compass,
  Tag,
  Phone,
  RotateCcw,
  X,
  Send,
  CreditCard,
  Check,
  Plus,
  AlertTriangle,
  BarChart3,
  Calendar,
  Layers,
  Search,
  Eye,
  Sliders,
  Share2,
  FileText,
  Building,
  Coffee,
  HelpCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  aiService,
  ConfiguredAgentItem,
  ConversationalTelemetry,
  KnowledgeDocumentItem,
  DynamicPricingOverview,
  MarketingCampaignItem,
  PredictiveOverview,
} from '@/features/ai/services/ai.service';

export default function AiConciergeStudioPage() {
  const queryClient = useQueryClient();
  const [activeMainTab, setActiveMainTab] = useState<'agents' | 'commerce' | 'pricing' | 'marketing' | 'predictive'>('agents');
  const [agentSettingsTab, setAgentSettingsTab] = useState<'settings' | 'knowledge' | 'inbox' | 'analytics' | 'widget' | 'tools'>('settings');

  // Agent Form State (Figure 14.1)
  const [agentName, setAgentName] = useState('Store Assistant');
  const [department, setDepartment] = useState('General Support');
  const [agentDescription, setAgentDescription] = useState('Official AI Assistant for store shopping, product recommendations, and customer support.');
  const [brandAccentColor, setBrandAccentColor] = useState('#4f46e5');
  const [isPublishedLive, setIsPublishedLive] = useState(true);
  const [aiProvider, setAiProvider] = useState('OpenAI');
  const [modelName, setModelName] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState('0.70');
  const [systemPrompt, setSystemPrompt] = useState(
    `You are the primary Customer Care and Autonomous AI Concierge for our luxury resort and online boutique.\nYour goal is to provide exceptional, polite, and rapid assistance to every visitor.\nKey responsibilities:\n1. Help visitors look up room inventory with elevator access, quiet acoustics, and ocean views.\n2. Answer dining inquiries, coffee options, and spa treatment details.\n3. Assist shoppers with coupon code validation and frictionless in-chat checkout.`
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Document Modal State
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({
    title: '',
    category: 'property_info',
    content: '',
  });

  // Marketing Generator State
  const [marketingForm, setMarketingForm] = useState({
    title: 'Spring Honeymoon Sanctuary Escape',
    targetAudience: 'Couples & Honeymooners',
    tone: 'Romantic' as const,
    channel: 'email' as const,
    highlights: 'Private Ocean Suite, Candlelit Beach Dinner, Complimentary Spa Massage',
  });
  const [generatedMarketingResult, setGeneratedMarketingResult] = useState<any>(null);

  // In-Chat Commerce Simulator State (Figures 14.3 & 14.4)
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'guest' | 'agent'; text: string; time: string }>>([
    {
      sender: 'guest',
      text: 'do you have carb platter?',
      time: '06:11 AM',
    },
    {
      sender: 'agent',
      text: `We don't currently serve Mojo on our menu, Shakil 🥤 — but here's what's available for a refreshing sip:\n\n☕ Coffee Items\n- Regular Hot Coffee — ৳99\n- Special Hot Coffee — ৳149\n- Black Coffee — ৳79\n- Cold Coffee — ৳119\n- Chocolate Cold Coffee — ৳149\n- Cappuccino — ৳129\n\nWe also have a full Drinks & Beverage and Krushers Items category with coolers and mocktails. Want me to pull those up or shall I check room accommodation?`,
      time: '06:11 AM',
    },
    {
      sender: 'guest',
      text: 'I am traveling with my 4-year-old toddler and elderly mother; which room has elevator access, quiet acoustics, and ocean views?',
      time: '06:12 AM',
    },
    {
      sender: 'agent',
      text: `I recommend our Grand Oceanfront Deluxe Suite on Floor 4! 🌊\n\n• Key Features:\n- Direct elevator access from the main entrance (no stairs for your mother)\n- Triple-pane acoustic soundproofing for complete quiet & restful toddler sleep\n- Accessible zero-threshold bathroom\n- Breathtaking panoramic ocean balcony\n- Nightly Rate: $350.00 / night\n\nWould you like me to reserve this suite for your family directly in this chat?`,
      time: '06:12 AM',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [couponCode, setCouponCode] = useState('SAVE5');
  const [couponApplied, setCouponApplied] = useState(true);
  const [paymentOption, setPaymentOption] = useState<'cod' | 'manual' | 'card'>('manual');
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Queries
  const { data: agents = [], isLoading: isAgentsLoading } = useQuery<ConfiguredAgentItem[]>({
    queryKey: ['configuredAgents'],
    queryFn: () => aiService.getAgents(),
  });

  const { data: telemetry, isLoading: isTelemetryLoading } = useQuery<ConversationalTelemetry>({
    queryKey: ['aiTelemetry'],
    queryFn: () => aiService.getTelemetry(),
  });

  const { data: knowledgeDocs = [], isLoading: isKnowledgeLoading } = useQuery<KnowledgeDocumentItem[]>({
    queryKey: ['aiKnowledgeList'],
    queryFn: () => aiService.getKnowledge(),
  });

  const { data: pricingOverview, isLoading: isPricingLoading } = useQuery<DynamicPricingOverview>({
    queryKey: ['dynamicPricingOverview'],
    queryFn: () => aiService.getPricingOverview(),
  });

  const { data: marketingCampaigns = [], isLoading: isMarketingLoading } = useQuery<MarketingCampaignItem[]>({
    queryKey: ['aiMarketingCampaigns'],
    queryFn: () => aiService.getMarketingCampaigns(),
  });

  const { data: predictiveOverview, isLoading: isPredictiveLoading } = useQuery<PredictiveOverview>({
    queryKey: ['predictiveOverview'],
    queryFn: () => aiService.getPredictiveOverview(),
  });

  // Mutations
  const updateConfigMutation = useMutation({
    mutationFn: (data: any) => aiService.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuredAgents'] });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
  });

  const addDocMutation = useMutation({
    mutationFn: (data: any) => aiService.addKnowledge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiKnowledgeList'] });
      setIsAddDocOpen(false);
      setNewDoc({ title: '', category: 'property_info', content: '' });
    },
  });

  const generateCopyMutation = useMutation({
    mutationFn: (data: any) => aiService.generateMarketingCopy(data),
    onSuccess: (res: any) => {
      setGeneratedMarketingResult(res);
      queryClient.invalidateQueries({ queryKey: ['aiMarketingCampaigns'] });
    },
  });

  const handleSaveAgentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateConfigMutation.mutateAsync({
      agentName,
      systemPrompt,
      modelProvider: aiProvider,
      modelName,
      temperature: parseFloat(temperature) || 0.7,
      isEnabled: isPublishedLive,
    });
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    const newChat = [...chatMessages, { sender: 'guest' as const, text: userMsg, time: 'Just now' }];
    setChatMessages(newChat);
    setChatInput('');

    // Simulated RAG autonomous response
    setTimeout(() => {
      let botReply = "Thank you for inquiring! Our autonomous concierge has indexed this in our PMS inventory. I'm ready to assist with your in-chat reservation or culinary request.";
      if (userMsg.toLowerCase().includes('coffee') || userMsg.toLowerCase().includes('drink')) {
        botReply = "Our Azure cafe is open 24/7! You can choose Special Hot Coffee (৳149), Cold Coffee (৳119), or Chocolate Cold Coffee (৳149). In-chat checkout is enabled.";
      } else if (userMsg.toLowerCase().includes('room') || userMsg.toLowerCase().includes('suite') || userMsg.toLowerCase().includes('price')) {
        botReply = "Our Grand Oceanfront Suite is available at $350.00/night with elevator access and soundproof acoustics. You can apply coupon SAVE5 below to finalize!";
      }
      setChatMessages((prev) => [...prev, { sender: 'agent' as const, text: botReply, time: 'Just now' }]);
    }, 600);
  };

  const handleStarterPromptSelect = (val: string) => {
    if (val === 'luxury_concierge') {
      setSystemPrompt(
        `You are the primary Executive Luxury Concierge for OmniStay. Provide five-star hospitality guidance on room suites (highlighting elevator access, quiet acoustics, ocean views), private yacht excursions, and Michelin-inspired culinary dining. Maintain an impeccably polite, warm, and sophisticated tone.`
      );
    } else if (val === 'dining_sommelier') {
      setSystemPrompt(
        `You are the dedicated Food & Beverage Sommelier and Dining Assistant. Guide guests through our coffee menus, beverage coolers, course pacing, wine pairings, and in-villa breakfast delivery. Support instant in-chat orders.`
      );
    } else if (val === 'store_assistant') {
      setSystemPrompt(
        `You are the official Store Assistant AI for online store shopping, product recommendations, and customer support. Help visitors check order statuses, redeem promo codes, and finalize checkout via COD or online payment.`
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Chapter 14: AI Agents, Concierge & Intelligent Automation</span>
      </div>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Bot className="w-6 h-6 text-[#00a8ff]" /> Autonomous AI Concierge Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Multimodal RAG knowledge bases, conversational in-chat booking, dynamic yield management, marketing studio, and predictive analytics (Chapter 14).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeMainTab === 'agents' && (
            <Button
              onClick={() => setIsAddDocOpen(true)}
              size="sm"
              className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add RAG Document
            </Button>
          )}
        </div>
      </div>

      {/* Chapter 14 Five Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-lg border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveMainTab('agents')}
          className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeMainTab === 'agents' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-[#00a8ff]" />
          14.1 Autonomous AI Agents (Fig 14.1)
        </button>
        <button
          onClick={() => setActiveMainTab('commerce')}
          className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeMainTab === 'commerce' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
          14.2 In-Chat Booking & Telemetry (Fig 14.2-14.4)
        </button>
        <button
          onClick={() => setActiveMainTab('pricing')}
          className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeMainTab === 'pricing' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          14.3 Dynamic Yield Management
        </button>
        <button
          onClick={() => setActiveMainTab('marketing')}
          className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeMainTab === 'marketing' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          14.4 AI Marketing Studio
        </button>
        <button
          onClick={() => setActiveMainTab('predictive')}
          className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeMainTab === 'predictive' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
          14.5 Predictive Analytics
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>AI Concierge parameters and system persona successfully saved and deployed live!</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: 14.1 AUTONOMOUS AI AGENTS & CONFIGURATION (Figure 14.1) */}
      {/* ============================================================== */}
      {activeMainTab === 'agents' && (
        <div className="space-y-6">
          {/* Top Metric Cards (Figure 14.1 Top Ribbon) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Agents</span>
                <div className="text-xl font-bold text-slate-900 mt-0.5">{agents.length || 3}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                {agents.length || 3}
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Published Live</span>
                <div className="text-xl font-bold text-emerald-600 mt-0.5">
                  {agents.filter((a) => a.status === 'Published').length || 1}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Conversations</span>
                <div className="text-xl font-bold text-purple-600 mt-0.5">{telemetry?.totalInquiries || 148}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Default Engine</span>
                <div className="text-sm font-bold text-amber-600 mt-0.5 font-mono">gpt-4o-mini</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Configured Agents Table (Image 3) */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Configured Agents</h3>
                <p className="text-[11px] text-slate-400">Each agent possesses its own persona, knowledge sources, and tools</p>
              </div>
              <Button
                size="sm"
                className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs cursor-pointer"
                onClick={() => setAgentSettingsTab('settings')}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Create New Agent
              </Button>
            </div>

            {isAgentsLoading ? (
              <div className="flex items-center justify-center p-10">
                <BeatLoader color="#22d3ee" size={16} speedMultiplier={1.2} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Agent</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Model & Tone</th>
                      <th className="py-3 px-4">Conversations</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {agents.map((ag) => (
                      <tr key={ag.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                              style={{ backgroundColor: ag.accentColor || '#4f46e5' }}
                            >
                              {ag.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{ag.name}</div>
                              <div className="text-[10px] text-rose-500 font-mono">agent/{ag.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                            {ag.department}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-slate-800 text-[11px]">{ag.model}</div>
                          <div className="text-[10px] text-slate-400">{ag.tone}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {ag.conversationsCount} <span className="text-[#00a8ff] cursor-pointer">View →</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {ag.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              onClick={() => setAgentSettingsTab('knowledge')}
                              variant="outline"
                              size="sm"
                              className="text-[10px] h-7 px-2 cursor-pointer text-slate-600"
                            >
                              <BookOpen className="w-3 h-3 mr-1 text-[#00a8ff]" /> Knowledge
                            </Button>
                            <Button
                              onClick={() => setAgentSettingsTab('settings')}
                              variant="outline"
                              size="sm"
                              className="text-[10px] h-7 px-2 cursor-pointer text-slate-600"
                            >
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Figure 14.1 Detailed Agent Configuration Container (Image 4) */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            {/* Header of Active Agent */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-bold text-sm">
                  S
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{agentName}</h3>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                      ✓ Published
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-mono bg-sky-50 text-sky-700">
                      {modelName}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-600">
                      {department}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {agentDescription} • slug: agent/store-assistant
                  </p>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-400 hidden sm:block">
                <span>Tone: </span>
                <span className="font-semibold text-slate-700">Friendly and Professional</span>
              </div>
            </div>

            {/* Sub-tabs matching Image 4 */}
            <div className="flex items-center gap-1 px-4 border-b border-slate-200 bg-white overflow-x-auto text-xs">
              {[
                { id: 'settings', label: 'Settings', icon: Settings },
                { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
                { id: 'inbox', label: 'Inbox & Handoff', icon: MessageSquare },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'widget', label: 'Widget Config', icon: Sliders },
                { id: 'tools', label: 'Tools', icon: Layers },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setAgentSettingsTab(tab.id as any)}
                    className={`py-3 px-3.5 border-b-2 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      agentSettingsTab === tab.id
                        ? 'border-[#00a8ff] text-[#00a8ff]'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: SETTINGS (Matching Image 4 Layout) */}
            {agentSettingsTab === 'settings' && (
              <form onSubmit={handleSaveAgentConfig} className="p-6 space-y-6 text-xs">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column (8 cols): Profile & System Prompt */}
                  <div className="lg:col-span-8 space-y-5">
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
                        Agent Profile & Identity
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1">Agent Name *</label>
                          <input
                            type="text"
                            required
                            value={agentName}
                            onChange={(e) => setAgentName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff] bg-white text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1">Department / Role</label>
                          <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff] bg-white text-slate-800"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Description</label>
                        <input
                          type="text"
                          value={agentDescription}
                          onChange={(e) => setAgentDescription(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff] bg-white text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="font-bold text-slate-900">System Prompt & Instructions</h4>
                        <div className="flex items-center gap-2">
                          <select
                            onChange={(e) => handleStarterPromptSelect(e.target.value)}
                            className="px-2.5 py-1 text-[11px] border border-slate-300 rounded bg-white text-slate-700 cursor-pointer"
                          >
                            <option value="">-- Load Starter Prompt --</option>
                            <option value="luxury_concierge">Luxury Resort Concierge</option>
                            <option value="dining_sommelier">Dining & Sommelier Bot</option>
                            <option value="store_assistant">Store Assistant & Commerce</option>
                          </select>
                        </div>
                      </div>
                      <textarea
                        rows={7}
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        className="w-full p-3 font-mono text-[11px] leading-relaxed border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff] bg-white text-slate-800"
                      />
                      <p className="text-[11px] text-slate-400">
                        Defines agent intelligence response boundaries, multi-lingual policy, and RAG grounding behavior.
                      </p>
                    </div>
                  </div>

                  {/* Right Column (4 cols): Branding & Model Parameters */}
                  <div className="lg:col-span-4 space-y-5 bg-slate-50/60 p-4 rounded-lg border border-slate-200">
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2">
                        Branding & Publish Status
                      </h4>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Brand Accent Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={brandAccentColor}
                            onChange={(e) => setBrandAccentColor(e.target.value)}
                            className="w-24 px-2.5 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white text-slate-800"
                          />
                          <div className="flex items-center gap-1">
                            {['#4f46e5', '#0284c7', '#059669', '#d97706', '#dc2626', '#9333ea'].map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setBrandAccentColor(c)}
                                className={`w-5 h-5 rounded-full border cursor-pointer ${
                                  brandAccentColor === c ? 'ring-2 ring-slate-800 scale-110' : ''
                                }`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                        <div>
                          <div className="font-semibold text-slate-800">Published Live</div>
                          <div className="text-[10px] text-slate-400">Enables real-time responses for visitors</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isPublishedLive}
                          onChange={(e) => setIsPublishedLive(e.target.checked)}
                          className="w-4 h-4 text-[#00a8ff] rounded border-slate-300 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-200">
                      <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2">
                        Model & Context Window
                      </h4>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">AI Provider</label>
                        <select
                          value={aiProvider}
                          onChange={(e) => setAiProvider(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-800 cursor-pointer"
                        >
                          <option value="OpenAI">OpenAI</option>
                          <option value="DeepSeek">DeepSeek</option>
                          <option value="Google Gemini">Google Gemini</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Model Name</label>
                        <select
                          value={modelName}
                          onChange={(e) => setModelName(e.target.value)}
                          className="w-full px-2.5 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white text-slate-800 cursor-pointer"
                        >
                          <option value="gpt-4o-mini">gpt-4o-mini</option>
                          <option value="gpt-4o">gpt-4o (Multimodal)</option>
                          <option value="deepseek-chat">deepseek-chat</option>
                          <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-600 font-semibold">Temperature</label>
                          <span className="font-mono text-slate-800 font-bold">{temperature}</span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="1.0"
                          step="0.05"
                          value={temperature}
                          onChange={(e) => setTemperature(e.target.value)}
                          className="w-full cursor-pointer accent-[#00a8ff]"
                        />
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                          <span>Deterministic (0.0)</span>
                          <span>Creative (1.0)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                  <Button
                    type="submit"
                    disabled={updateConfigMutation.isPending}
                    className="bg-[#00a8ff] hover:bg-[#0097e6] text-white cursor-pointer px-5"
                  >
                    {updateConfigMutation.isPending ? (
                      <BeatLoader color="#ffffff" size={8} speedMultiplier={1.2} />
                    ) : (
                      'Save Agent Parameters'
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* TAB CONTENT: KNOWLEDGE BASE (RAG Documents) */}
            {agentSettingsTab === 'knowledge' && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Indexed RAG Knowledge Documents</h4>
                    <p className="text-[11px] text-slate-400">
                      High-dimensional vector embeddings retrieved in real-time during guest queries
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsAddDocOpen(true)}
                    size="sm"
                    className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Index New Document
                  </Button>
                </div>

                {isKnowledgeLoading ? (
                  <div className="flex items-center justify-center p-10">
                    <BeatLoader color="#22d3ee" size={16} speedMultiplier={1.2} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {knowledgeDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-[#00a8ff]/40 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                            {doc.category.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Indexed & Ready
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-xs">{doc.title}</h5>
                        <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">{doc.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: INBOX & HANDOFF */}
            {agentSettingsTab === 'inbox' && (
              <div className="p-6 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">Live Conversations & Human Handoff Queue</h4>
                <div className="space-y-3">
                  {(telemetry?.recentConversations || []).map((conv) => (
                    <div
                      key={conv.id}
                      className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800 text-xs">{conv.sessionId}</span>
                          <Badge variant="outline" className="text-[10px] uppercase bg-white">
                            {conv.channel}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] uppercase bg-emerald-50 text-emerald-700">
                            {conv.language}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 max-w-xl truncate">
                          Last Message: &quot;{conv.lastMessage}&quot;
                        </p>
                      </div>
                      <Button
                        onClick={() => setActiveMainTab('commerce')}
                        variant="outline"
                        size="sm"
                        className="text-xs text-[#00a8ff] border-[#00a8ff]/30 hover:bg-sky-50 shrink-0 cursor-pointer"
                      >
                        Open In-Chat Simulator →
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: 14.2 CONVERSATIONAL IN-CHAT COMMERCE (Figures 14.2-14.4) */}
      {/* ============================================================== */}
      {activeMainTab === 'commerce' && (
        <div className="space-y-6">
          {/* Figure 14.2 Telemetry Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Inquiries</span>
              <div className="text-2xl font-bold text-slate-900">
                {isTelemetryLoading ? (
                  <BeatLoader color="#22d3ee" size={10} speedMultiplier={1.2} />
                ) : (
                  telemetry?.totalInquiries || 148
                )}
              </div>
              <p className="text-[11px] text-slate-400">RAG omnichannel interactions</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">In-Chat Bookings</span>
              <div className="text-2xl font-bold text-[#00a8ff]">
                {isTelemetryLoading ? (
                  <BeatLoader color="#22d3ee" size={10} speedMultiplier={1.2} />
                ) : (
                  `${telemetry?.conversationalBookings || 32} Completed`
                )}
              </div>
              <p className="text-[11px] text-slate-400">Frictionless direct checkouts</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Direct In-Chat Revenue</span>
              <div className="text-2xl font-bold text-emerald-600">
                {isTelemetryLoading ? (
                  <BeatLoader color="#22d3ee" size={10} speedMultiplier={1.2} />
                ) : (
                  formatCurrency(telemetry?.directInChatRevenue || 14850.0)
                )}
              </div>
              <p className="text-[11px] text-slate-400">Zero OTA commission fee saved</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Guest Sentiment Score</span>
              <div className="text-2xl font-bold text-purple-600">
                {isTelemetryLoading ? (
                  <BeatLoader color="#22d3ee" size={10} speedMultiplier={1.2} />
                ) : (
                  `${telemetry?.guestSentimentScore || 96.8}% Positive`
                )}
              </div>
              <p className="text-[11px] text-slate-400">NLP emotional polarity</p>
            </div>
          </div>

          {/* Interactive In-Chat Simulator Container (Matching Images 1 & 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Chat Window (Image 1 & 2) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden flex flex-col h-[640px]">
              {/* Chat Header matching Image 1 */}
              <div className="bg-[#4f46e5] text-white p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                    S
                  </div>
                  <div>
                    <h4 className="font-bold text-xs leading-none">Store Assistant</h4>
                    <span className="text-[10px] text-emerald-300 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white cursor-pointer" title="Direct Audio Call">
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setOrderConfirmed(false);
                      setChatMessages((prev) => prev.slice(0, 2));
                    }}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                    title="Reload Session"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40 text-xs">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'guest' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                        msg.sender === 'guest'
                          ? 'bg-[#4f46e5] text-white rounded-tr-xs'
                          : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}

                {/* In-Chat Commerce & Checkout Element (Matching Image 2) */}
                <div className="bg-white border-2 border-[#4f46e5]/30 rounded-xl p-4 shadow-sm space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#4f46e5]" /> In-Chat Express Checkout
                    </span>
                    <span className="text-xs font-bold text-emerald-600">Total: $335.00</span>
                  </div>

                  {/* Coupon Component (Matching Image 2) */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      🎟️ Have a Coupon / Promo Code?
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono font-bold uppercase w-28 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setCouponApplied(true)}
                        className="px-3 py-1.5 bg-[#059669] text-white rounded text-[11px] font-bold cursor-pointer hover:bg-emerald-700"
                      >
                        Applied
                      </button>
                    </div>
                    {couponApplied && (
                      <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                        ✓ Coupon &apos;{couponCode}&apos; applied successfully! (৳9.45 / $15.00 off)
                      </p>
                    )}
                  </div>

                  {/* Payment Options (Matching Image 2) */}
                  <div className="space-y-2">
                    <div
                      onClick={() => setPaymentOption('cod')}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        paymentOption === 'cod'
                          ? 'border-[#4f46e5] bg-indigo-50/50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-xs">Cash on Delivery (COD)</div>
                      <div className="text-[11px] text-slate-500">Pay when you receive your order at your doorstep.</div>
                    </div>

                    <div
                      onClick={() => setPaymentOption('manual')}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        paymentOption === 'manual'
                          ? 'border-[#4f46e5] bg-indigo-50/50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-xs">
                        🏦 Manual Payment (bKash / Nagad / Banks)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Send Money via bKash, Nagad, Rocket, Cellfin, or Bank Deposit.
                      </div>
                    </div>

                    <div
                      onClick={() => setPaymentOption('card')}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        paymentOption === 'card'
                          ? 'border-[#4f46e5] bg-indigo-50/50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-xs">
                        💳 1-Click Card Checkout (Stripe PCI)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Zero 3D-secure latency directly inside chat.
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons matching Image 2 */}
                  <div className="pt-2 flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-xs cursor-pointer text-slate-600">
                      — Back
                    </Button>
                    <Button
                      onClick={() => {
                        setOrderConfirmed(true);
                        setChatMessages((prev) => [
                          ...prev,
                          {
                            sender: 'agent',
                            text: '🎉 Order & Reservation Confirmed! Your voucher reference is CHAT-9018. We have sent the confirmation SMS and in-room keycard token to your device.',
                            time: 'Just now',
                          },
                        ]);
                      }}
                      size="sm"
                      className="flex-1 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs cursor-pointer"
                    >
                      {orderConfirmed ? '✓ Reservation Placed' : 'Confirm & Place Order'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Chat Input Bar matching Image 1 */}
              <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-full focus:outline-hidden focus:border-[#4f46e5] bg-slate-50"
                />
                <button
                  type="submit"
                  className="w-8 h-8 rounded-full bg-[#4f46e5] hover:bg-[#4338ca] text-white flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
              <div className="bg-slate-50 py-1 text-center text-[10px] text-slate-400 border-t border-slate-100">
                Powered by <strong className="text-slate-600">Softsasi AI</strong>
              </div>
            </div>

            {/* Right: Telemetry & Multilingual Breakdown */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider text-slate-500">
                  <Compass className="w-4 h-4 text-[#00a8ff]" /> Multilingual Fluency (50+ Languages)
                </h4>
                <div className="space-y-3">
                  {(telemetry?.languageDistribution || []).map((lang) => (
                    <div key={lang.code} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                        <span>{lang.language}</span>
                        <span>{lang.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#00a8ff] h-full rounded-full transition-all duration-500"
                          style={{ width: `${lang.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-linear-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    ⚡
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">End-to-End Conversational Pipeline</h4>
                </div>
                <div className="space-y-2 text-[11px] text-slate-600 leading-relaxed">
                  <div><strong>1. Intent Recognition:</strong> Autonomous LLM detects commercial booking or dining demand.</div>
                  <div><strong>2. Dynamic Inventory Presentation:</strong> Renders room cards and coffee items inside the bubble.</div>
                  <div><strong>3. Secure In-Chat Checkout:</strong> Applies coupons and completes checkout without navigating away.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: 14.3 DYNAMIC REVENUE & YIELD MANAGEMENT ENGINE           */}
      {/* ============================================================== */}
      {activeMainTab === 'pricing' && (
        <div className="space-y-6">
          {/* Real-time Occupancy Telemetry Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Property Occupancy</span>
              <div className="text-2xl font-bold text-emerald-600">
                {pricingOverview?.currentOccupancyPct || 88.5}%
              </div>
              <p className="text-[11px] text-slate-400">High demand velocity detected</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pickup Velocity</span>
              <div className="text-2xl font-bold text-[#00a8ff]">
                +{pricingOverview?.pickupVelocityRoomsPerDay || 4.8} Rooms / Day
              </div>
              <p className="text-[11px] text-slate-400">Rolling 7-day booking pace</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recommended Surge Multiplier</span>
              <div className="text-2xl font-bold text-purple-600">
                +{Math.round(((pricingOverview?.recommendedSurgeMultiplier || 1.25) - 1.0) * 100)}% Surge
              </div>
              <p className="text-[11px] text-slate-400">Elasticity calibrated to local demand</p>
            </div>
          </div>

          {/* Elasticity-Driven Surge Rules Matrix */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Automated Occupancy Surge Pricing Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {(pricingOverview?.activeRules || []).map((rule, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{rule.threshold}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{rule.action}</div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${rule.status.includes('Active') ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold' : 'bg-white text-slate-600'}`}>
                    {rule.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* 5-Mile Competitor Rate Scraping Benchmarks */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">5-Mile Radius Competitor Rate Intelligence</h3>
                <p className="text-[11px] text-slate-400">Automated scraping scraper continuously monitors adjacent luxury resorts</p>
              </div>
              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700">
                Scraped Continuously
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Competitor Property</th>
                    <th className="py-3 px-4">Room Category</th>
                    <th className="py-3 px-4">Observed Nightly Rate</th>
                    <th className="py-3 px-4">Rate Delta vs. OmniStay ($350)</th>
                    <th className="py-3 px-4">Scraped Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(pricingOverview?.competitorScrapes || []).map((comp) => {
                    const delta = Number(comp.rateObserved) - 350.0;
                    return (
                      <tr key={comp.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <Building className="w-4 h-4 text-slate-400" />
                          {comp.competitorName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{comp.roomCategory}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(comp.rateObserved)}</td>
                        <td className="py-3.5 px-4 font-semibold">
                          <span className={delta > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                            {delta > 0 ? `+${formatCurrency(delta)}` : formatCurrency(delta)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">{comp.scrapedAt.split('T')[0]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: 14.4 AI MARKETING STUDIO & CREATIVE GENERATOR           */}
      {/* ============================================================== */}
      {activeMainTab === 'marketing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Generator Form */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" /> AI Promotional Asset Generator
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await generateCopyMutation.mutateAsync({
                    ...marketingForm,
                    highlights: marketingForm.highlights.split(',').map((h) => h.trim()),
                  });
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Campaign Title</label>
                  <input
                    type="text"
                    required
                    value={marketingForm.title}
                    onChange={(e) => setMarketingForm({ ...marketingForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Copywriting Tone</label>
                    <select
                      value={marketingForm.tone}
                      onChange={(e) => setMarketingForm({ ...marketingForm, tone: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800"
                    >
                      <option value="Luxury">Luxury & Elegance</option>
                      <option value="Romantic">Romantic & Intimate</option>
                      <option value="Family">Family & Adventure</option>
                      <option value="Business">Business & Corporate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Delivery Channel</label>
                    <select
                      value={marketingForm.channel}
                      onChange={(e) => setMarketingForm({ ...marketingForm, channel: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800"
                    >
                      <option value="email">Email Newsletter</option>
                      <option value="sms">Promotional SMS</option>
                      <option value="social_instagram">Instagram Post</option>
                      <option value="social_facebook">Facebook Campaign</option>
                      <option value="seo_description">SEO Meta Description</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Key Highlights (comma-separated)</label>
                  <input
                    type="text"
                    value={marketingForm.highlights}
                    onChange={(e) => setMarketingForm({ ...marketingForm, highlights: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={generateCopyMutation.isPending}
                  className="w-full bg-[#00a8ff] hover:bg-[#0097e6] text-white cursor-pointer"
                >
                  {generateCopyMutation.isPending ? (
                    <BeatLoader color="#ffffff" size={8} speedMultiplier={1.2} />
                  ) : (
                    'Generate Copy & Assets'
                  )}
                </Button>
              </form>
            </div>

            {/* Right Output Preview */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
                <span>Generated Output & Subject Line</span>
                {generatedMarketingResult && (
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                    {generatedMarketingResult.tone} Tone
                  </Badge>
                )}
              </h3>

              {generatedMarketingResult ? (
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Suggested Subject Line</span>
                    <div className="font-bold text-slate-900 text-xs mt-0.5">{generatedMarketingResult.suggestedSubjectLine}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed text-slate-700 text-xs">
                    {generatedMarketingResult.generatedCopy}
                  </div>
                  <div className="text-[11px] text-slate-400 text-right">
                    Character Count: {generatedMarketingResult.characterCount} chars
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Fill in the parameters on the left and click Generate to produce SEO and marketing copy.
                </div>
              )}
            </div>
          </div>

          {/* Historical Campaigns Table */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Campaigns Studio History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Target Audience</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Generated Copy Snippet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marketingCampaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{camp.title}</td>
                      <td className="py-3.5 px-4 text-slate-600">{camp.targetAudience}</td>
                      <td className="py-3.5 px-4 font-mono uppercase text-[10px] text-slate-500">{camp.channel}</td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-md truncate">{camp.generatedAd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: 14.5 AI PREDICTIVE FINANCIAL & OCCUPANCY ANALYTICS       */}
      {/* ============================================================== */}
      {activeMainTab === 'predictive' && (
        <div className="space-y-6">
          {/* 90-Day Predictive Occupancy Cards */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-500" /> 90-Day Machine Learning Occupancy & RevPAR Runway
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(predictiveOverview?.ninetyDayForecasts || []).map((f, idx) => (
                <div key={f.id || idx} className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Month {idx + 1} Horizon</span>
                    <span className="font-mono text-slate-700">{f.date}</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{f.occupancyPct}% Occupancy</div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 font-semibold">
                    <span className="text-slate-500">Projected RevPAR:</span>
                    <span className="text-emerald-600 font-bold">{formatCurrency(f.projectedRevPAR)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">Projected Revenue:</span>
                    <span className="text-slate-900 font-bold">{formatCurrency(f.projectedRevenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6-Month Cash Flow Runway */}
          <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" /> 6-Month Predictive Cash Flow Runway Projections
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="text-slate-500">Future Bookings Revenue</span>
                <div className="text-base font-bold text-emerald-600">
                  {formatCurrency(predictiveOverview?.cashFlowRunway?.confirmedFutureBookingsRevenue || 1420000)}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="text-slate-500">Scheduled Vendor AP Bills</span>
                <div className="text-base font-bold text-rose-600">
                  {formatCurrency(predictiveOverview?.cashFlowRunway?.scheduledAccountsPayableBills || 580000)}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="text-slate-500">Net Runway Surplus</span>
                <div className="text-base font-bold text-slate-900">
                  {formatCurrency(predictiveOverview?.cashFlowRunway?.netCashRunwaySurplus || 840000)}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="text-slate-500">Cash Runway Months</span>
                <div className="text-base font-bold text-[#00a8ff]">
                  {predictiveOverview?.cashFlowRunway?.runwayMonths || 14.2} Months
                </div>
              </div>
            </div>
          </div>

          {/* Departmental Expense Anomaly Detection */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Departmental Machine Learning Expense Anomaly Detection
            </h3>
            <div className="space-y-3">
              {(predictiveOverview?.expenseAnomalies || []).map((anom, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    anom.severity === 'HIGH_ANOMALY'
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{anom.department}</span>
                      <span className="text-[11px] text-slate-500">({anom.category})</span>
                      <Badge
                        className={`text-[10px] ${
                          anom.severity === 'HIGH_ANOMALY'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {anom.severity.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{anom.alertMessage}</p>
                  </div>

                  <div className="text-right shrink-0 text-xs">
                    <div className="font-bold text-slate-900">
                      Current: {formatCurrency(anom.currentExpense)} vs. Avg: {formatCurrency(anom.historicalAverage)}
                    </div>
                    <div className={`font-semibold ${anom.variancePct > 15 ? 'text-rose-600' : 'text-slate-500'}`}>
                      +{anom.variancePct}% Baseline Variance
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD RAG DOCUMENT MODAL */}
      {isAddDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#00a8ff]" /> Index New RAG Document
              </h3>
              <button
                onClick={() => setIsAddDocOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await addDocMutation.mutateAsync(newDoc);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  placeholder="e.g. Presidential Penthouse & Family Guide"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Knowledge Category</label>
                <select
                  value={newDoc.category}
                  onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800"
                >
                  <option value="property_info">Property Info & Rooms</option>
                  <option value="dining_menu">Dining & Beverage Menu</option>
                  <option value="amenities">Amenities & Spa</option>
                  <option value="policies">Resort Policies & Check-In</option>
                  <option value="local_attractions">Local Attractions & Charters</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Content / Document Body</label>
                <textarea
                  rows={4}
                  required
                  value={newDoc.content}
                  onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                  placeholder="Detailed text to be embedded into the vector knowledge base..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddDocOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={addDocMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white cursor-pointer"
                >
                  {addDocMutation.isPending ? (
                    <BeatLoader color="#ffffff" size={8} speedMultiplier={1.2} />
                  ) : (
                    'Index Document'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
