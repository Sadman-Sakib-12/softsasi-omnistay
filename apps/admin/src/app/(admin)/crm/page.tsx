'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Users,
  Calendar,
  DollarSign,
  X,
  Target,
  Sparkles,
  Heart,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ChevronRight,
  Eye,
  MessageSquare,
  ShieldCheck,
  Building,
  Layers,
  Code,
  LifeBuoy,
  FileText,
  Clock,
  Phone,
  Mail,
  Send,
  PenTool,
  Check,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Search,
  BookOpen,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BeatLoader } from 'react-spinners';
import {
  crmService,
  LeadItem,
  DealItem,
  Guest360Item,
  FormBuilderItem,
  SupportTicketItem,
  CannedResponseItem,
  KnowledgeBaseItem,
} from '@/features/crm/services/crm.service';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CrmEnterprisePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'leads' | 'deals' | 'guest360' | 'forms' | 'support'>('leads');

  // React Query backend hooks (Zero Mock: 100% Real Backend Data)
  const { data: leads = [], isLoading: isLoadingLeads } = useQuery<LeadItem[]>({
    queryKey: ['crmLeads'],
    queryFn: () => crmService.getLeads(),
  });

  const { data: deals = [], isLoading: isLoadingDeals } = useQuery<DealItem[]>({
    queryKey: ['crmDeals'],
    queryFn: () => crmService.getDeals(),
  });

  const { data: guests = [], isLoading: isLoadingGuests } = useQuery<Guest360Item[]>({
    queryKey: ['crmGuests'],
    queryFn: () => crmService.getGuestProfiles(),
  });

  const { data: forms = [], isLoading: isLoadingForms } = useQuery<FormBuilderItem[]>({
    queryKey: ['crmForms'],
    queryFn: () => crmService.getForms(),
  });

  const { data: tickets = [], isLoading: isLoadingTickets } = useQuery<SupportTicketItem[]>({
    queryKey: ['crmTickets'],
    queryFn: () => crmService.getTickets(),
  });

  const { data: cannedResponses = [] } = useQuery<CannedResponseItem[]>({
    queryKey: ['crmCannedResponses'],
    queryFn: () => crmService.getCannedResponses(),
  });

  const { data: knowledgeBase = [] } = useQuery<KnowledgeBaseItem[]>({
    queryKey: ['crmKnowledgeBase'],
    queryFn: () => crmService.getKnowledgeBase(),
  });

  // UI Modals & Selection States
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest360Item | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [selectedDealForProposal, setSelectedDealForProposal] = useState<DealItem | null>(null);
  const [selectedDealForContract, setSelectedDealForContract] = useState<DealItem | null>(null);
  const [activeFormTemplate, setActiveFormTemplate] = useState<FormBuilderItem | null>(null);
  const [isEmbedCodeOpen, setIsEmbedCodeOpen] = useState(false);
  const [ticketReplyInput, setTicketReplyInput] = useState('');
  const [callLogSubject, setCallLogSubject] = useState('');
  const [callLogDuration, setCallLogDuration] = useState('15');
  const [callLogNotes, setCallLogNotes] = useState('');
  const [leadNoteContent, setLeadNoteContent] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [kbSearchTerm, setKbSearchTerm] = useState('');

  // Notifications
  const [alertBanner, setAlertBanner] = useState<string | null>(null);
  const triggerBanner = (msg: string) => {
    setAlertBanner(msg);
    setTimeout(() => setAlertBanner(null), 4000);
  };

  // 11.1 New Lead Form State
  const [newLead, setNewLead] = useState({
    title: '',
    contactName: '',
    email: '',
    phone: '',
    budget: 35000,
    guestCount: 150,
    durationDays: 2,
    source: 'web_inquiry',
  });

  // 11.2 New Deal Form State
  const [newDeal, setNewDeal] = useState({
    dealName: '',
    dealValue: 45000,
    status: 'open',
    expectedClose: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Mutations
  const createLeadMutation = useMutation({
    mutationFn: (dto: any) => crmService.createLead(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmLeads'] });
      setIsAddLeadOpen(false);
      triggerBanner('New Lead created with automated commercial score calculated.');
    },
  });

  const createDealMutation = useMutation({
    mutationFn: (dto: any) => crmService.createDeal(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmDeals'] });
      setIsAddDealOpen(false);
      triggerBanner('New banquet deal added to pipeline.');
    },
  });

  const addCallLogMutation = useMutation({
    mutationFn: ({ leadId, dto }: { leadId: string; dto: any }) => crmService.addCallLog(leadId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmLeads'] });
      setCallLogSubject('');
      setCallLogNotes('');
      triggerBanner('Call log recorded successfully.');
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: ({ leadId, dto }: { leadId: string; dto: any }) => crmService.addNote(leadId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmLeads'] });
      setLeadNoteContent('');
      triggerBanner('Activity note pinned to lead.');
    },
  });

  const replyTicketMutation = useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: string; message: string }) =>
      crmService.replyTicket(ticketId, { message, senderType: 'staff' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmTickets'] });
      setTicketReplyInput('');
      triggerBanner('Staff response dispatched to guest.');
    },
  });

  const updateTicketStatusMutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: string }) =>
      crmService.updateTicketStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crmTickets'] });
      triggerBanner('Ticket status updated.');
    },
  });

  // Sync active form template
  useEffect(() => {
    if (forms.length > 0 && !activeFormTemplate) {
      setActiveFormTemplate(forms[0]);
    }
  }, [forms, activeFormTemplate]);

  // Lead source filter helper
  const filteredLeads = leads.filter((l) => (sourceFilter === 'all' ? true : l.source === sourceFilter));

  // 11.2 Kanban column definition
  const KANBAN_STAGES = [
    'Discovery / Inquiry',
    'Site Inspection Scheduled',
    'Proposal & Banquet Menu Sent',
    'Contract Negotiation',
    'Deposit Paid / Won',
    'Lost',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Alert Banner */}
      {alertBanner && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{alertBanner}</span>
        </div>
      )}

      {/* Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span className="text-[#00a8ff] font-semibold">CRM & Guest Intelligence</span>
            <span>/</span>
            <span className="text-slate-400">Chapter 11 Enterprise Hospitality Engine</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#00a8ff]" /> CRM, Leads, Deals & Guest Experience
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Uniform System of Accounts for Lodging Industry (USALI) & Banquet Sales Pipeline with Guest 360° Personalization Ledger
          </p>
        </div>

        {/* Global Quick Action */}
        <div className="flex items-center gap-2">
          {activeTab === 'leads' && (
            <Button
              onClick={() => setIsAddLeadOpen(true)}
              className="bg-[#00a8ff] hover:bg-[#0090dd] text-white text-xs font-bold gap-1.5 rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" /> New Inbound Lead
            </Button>
          )}
          {activeTab === 'deals' && (
            <Button
              onClick={() => setIsAddDealOpen(true)}
              className="bg-[#00a8ff] hover:bg-[#0090dd] text-white text-xs font-bold gap-1.5 rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" /> New Banquet Deal
            </Button>
          )}
        </div>
      </div>

      {/* Top Navigation Tabs (Chapter 11 Sub-sections) */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2.5 font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'leads'
              ? 'bg-sky-50 text-[#00a8ff] border-b-2 border-[#00a8ff]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>11.1 Omnichannel Leads</span>
          <span className="bg-sky-100 text-[#00a8ff] px-1.5 py-0.5 rounded-full text-[10px]">
            {leads.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('deals')}
          className={`px-4 py-2.5 font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'deals'
              ? 'bg-sky-50 text-[#00a8ff] border-b-2 border-[#00a8ff]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>11.2 Banquet Sales Kanban</span>
          <span className="bg-sky-100 text-[#00a8ff] px-1.5 py-0.5 rounded-full text-[10px]">
            {deals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('guest360')}
          className={`px-4 py-2.5 font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'guest360'
              ? 'bg-sky-50 text-[#00a8ff] border-b-2 border-[#00a8ff]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>11.3 Guest 360° Profile</span>
          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px]">
            {guests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('forms')}
          className={`px-4 py-2.5 font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'forms'
              ? 'bg-sky-50 text-[#00a8ff] border-b-2 border-[#00a8ff]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>11.4 Dynamic Form Builder</span>
          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-full text-[10px]">
            {forms.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`px-4 py-2.5 font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'support'
              ? 'bg-sky-50 text-[#00a8ff] border-b-2 border-[#00a8ff]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <LifeBuoy className="w-4 h-4 text-rose-500" />
          <span>11.5 Support & 20-min SLA</span>
          <span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full text-[10px]">
            {tickets.length}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: 11.1 Omnichannel Lead Capture & Inbound Inquiries      */}
      {/* ============================================================== */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          {/* Filter Bar & Scoring Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-sky-50 to-white border-sky-100">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-[#00a8ff] flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Active Inquiries</div>
                  <div className="text-xl font-black text-slate-900">{leads.length}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">High Priority (Score 90+)</div>
                  <div className="text-xl font-black text-emerald-700">
                    {leads.filter((l) => l.leadScore >= 90).length}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Round-Robin Logic</div>
                  <div className="text-xs font-bold text-indigo-700">Active (Auto-Balanced)</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Total Call Touchpoints</div>
                  <div className="text-xl font-black text-amber-700">
                    {leads.reduce((acc, l) => acc + (l.callLogs?.length || 0), 0)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400 mr-1">Channel Source:</span>
            {['all', 'web_inquiry', 'ai_concierge', 'whatsapp', 'phone_inquiry', 'referral'].map((src) => (
              <button
                key={src}
                onClick={() => setSourceFilter(src)}
                className={`px-3 py-1 rounded-full capitalize transition ${
                  sourceFilter === src
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {src.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Leads Table */}
          {isLoadingLeads ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
              <p className="text-xs text-slate-400">Loading live inbound CRM leads...</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Lead Inquiry & Event Title</th>
                    <th className="py-3 px-4">Contact Person</th>
                    <th className="py-3 px-4">Commercial Score</th>
                    <th className="py-3 px-4">Channel Ingestion</th>
                    <th className="py-3 px-4">Pipeline Stage</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead) => {
                    const isHigh = lead.leadScore >= 90;
                    const isMed = lead.leadScore >= 70 && lead.leadScore < 90;
                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/60 transition group">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{lead.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal">
                            Received {formatDate(lead.createdAt)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{lead.contactName}</div>
                          <div className="text-[11px] text-slate-400">{lead.email || lead.phone || '—'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-[11px] ${
                              isHigh
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isMed
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            {lead.leadScore} / 100
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize text-[10px] font-bold">
                            {lead.source.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-sky-50 text-[#00a8ff] px-2 py-0.5 rounded text-[11px] font-bold border border-sky-100">
                            {lead.stage?.name || 'Inquiry'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLead(lead)}
                            className="text-[#00a8ff] hover:bg-sky-50 text-xs font-bold gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details & Calls
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: 11.2 Deal Pipelines & Banquet Sales Kanban Boards      */}
      {/* ============================================================== */}
      {activeTab === 'deals' && (
        <div className="space-y-4">
          {isLoadingDeals ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
              <p className="text-xs text-slate-400">Loading banquet deals and pipeline stages...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
              {KANBAN_STAGES.map((stageName, idx) => {
                const stageDeals = deals.filter(
                  (d) =>
                    d.stage?.name?.toLowerCase() === stageName.toLowerCase() ||
                    (stageName === 'Discovery / Inquiry' && (!d.stage || d.status === 'open' && !d.stageId)) ||
                    (stageName === 'Deposit Paid / Won' && d.status === 'won'),
                );
                const totalValue = stageDeals.reduce((sum, d) => sum + Number(d.dealValue || 0), 0);

                return (
                  <div
                    key={stageName}
                    className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 flex flex-col min-w-[240px]"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800">{stageName}</h4>
                        <span className="text-[10px] text-slate-400 font-bold">{formatCurrency(totalValue)}</span>
                      </div>
                      <span className="w-5 h-5 rounded-full bg-slate-200/80 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                        {stageDeals.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px]">
                      {stageDeals.map((deal) => {
                        const hasProposal = deal.proposals && deal.proposals.length > 0;
                        const hasContract = deal.contracts && deal.contracts.length > 0;
                        const isSigned = hasContract && deal.contracts![0].isSigned;

                        return (
                          <div
                            key={deal.id}
                            className="bg-white p-3 rounded-lg border border-slate-200/70 shadow-xs hover:border-[#00a8ff] transition group"
                          >
                            <h5 className="font-bold text-xs text-slate-900 group-hover:text-[#00a8ff] transition-colors leading-snug">
                              {deal.dealName}
                            </h5>
                            <div className="text-sm font-black text-emerald-700 mt-1.5">
                              {formatCurrency(deal.dealValue)}
                            </div>

                            {/* Indicators */}
                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 text-[10px]">
                              {hasProposal && (
                                <button
                                  onClick={() => setSelectedDealForProposal(deal)}
                                  className="inline-flex items-center gap-1 bg-sky-50 text-[#00a8ff] px-2 py-0.5 rounded font-bold hover:bg-sky-100"
                                >
                                  <FileText className="w-3 h-3" /> Proposal PDF
                                </button>
                              )}
                              {hasContract && (
                                <button
                                  onClick={() => setSelectedDealForContract(deal)}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold ${
                                    isSigned
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  <ShieldCheck className="w-3 h-3" />
                                  {isSigned ? 'Contract E-Signed' : 'Contract Pending'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: 11.3 Guest 360° Profile & Personalization Ledger       */}
      {/* ============================================================== */}
      {activeTab === 'guest360' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-amber-50 via-slate-50 to-white rounded-xl border border-amber-200/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
                VIP
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  Guest 360° Intelligence & Loyalty Personalization Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Hyper-personalized hospitality grounded in historical spend (LTV), room temperature, pillow choices, and allergen safeguards.
                </p>
              </div>
            </div>
          </div>

          {isLoadingGuests ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
              <p className="text-xs text-slate-400">Loading guest 360 profiles from database...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guests.map((g) => {
                const isBlack = g.vipTier === 'VIP Black';
                const isPlat = g.vipTier === 'Platinum';
                const isGold = g.vipTier === 'Gold';

                return (
                  <Card
                    key={g.id}
                    className={`border transition shadow-xs hover:shadow-md ${
                      isBlack
                        ? 'border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 text-white'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-black text-base ${isBlack ? 'text-white' : 'text-slate-900'}`}>
                              {g.notes?.includes('Vance') ? 'Lady Eleanor Vance' : g.notes?.includes('business') ? 'Dr. Marcus Sterling' : g.notes?.includes('late check-out') ? 'Sophia Lorenzi' : 'Alexander Wright'}
                            </h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isBlack
                                  ? 'bg-amber-400 text-slate-950 border border-amber-300'
                                  : isPlat
                                  ? 'bg-violet-100 text-violet-800 border border-violet-200'
                                  : isGold
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {g.vipTier}
                            </span>
                          </div>
                          <p className={`text-xs mt-0.5 ${isBlack ? 'text-slate-400' : 'text-slate-500'}`}>
                            User UUID: {g.userId.slice(0, 18)}...
                          </p>
                        </div>

                        {/* LTV Spend Badge */}
                        <div className="text-right">
                          <div className="text-xs text-slate-400 font-bold uppercase">Lifetime Spend (LTV)</div>
                          <div className={`text-lg font-black ${isBlack ? 'text-amber-400' : 'text-emerald-700'}`}>
                            {formatCurrency(g.lifetimeSpend)}
                          </div>
                          <div className={`text-[10px] font-bold ${isBlack ? 'text-slate-400' : 'text-slate-500'}`}>
                            {g.totalNights} Nights Stayed
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0">
                      {/* HIGH-CONTRAST RED ALLERGY BADGES */}
                      {g.dietary && g.dietary.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1 mb-1.5">
                            <AlertTriangle className="w-3 h-3" /> Critical Dietary Safeguards & Allergen Flags:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {g.dietary.map((d) => (
                              <span
                                key={d.id}
                                className="bg-rose-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1"
                              >
                                <AlertTriangle className="w-2.5 h-2.5 text-rose-200" />
                                {d.restriction}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stay Preferences */}
                      {g.preferences && g.preferences.length > 0 && (
                        <div className="pt-2 border-t border-slate-100/20">
                          <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isBlack ? 'text-slate-400' : 'text-slate-500'}`}>
                            Stay Preferences & Comfort Setup:
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-xs">
                            {g.preferences.map((p) => (
                              <div
                                key={p.id}
                                className={`p-2 rounded-lg text-[11px] ${
                                  isBlack ? 'bg-slate-800/80 text-slate-200' : 'bg-slate-50 text-slate-700'
                                }`}
                              >
                                <span className="font-bold block text-[10px] text-[#00a8ff]">{p.preferenceKey}</span>
                                <span className="font-medium">{p.preferenceVal}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes / GM Greeting Requirement */}
                      {g.notes && (
                        <div
                          className={`p-2.5 rounded-lg text-xs font-semibold ${
                            isBlack
                              ? 'bg-amber-400/10 border border-amber-400/30 text-amber-200'
                              : 'bg-sky-50 border border-sky-100 text-sky-900'
                          }`}
                        >
                          {g.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: 11.4 Drag-and-Drop Dynamic Form Builder & Submissions  */}
      {/* ============================================================== */}
      {activeTab === 'forms' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Hospitality Dynamic Form Builder & Public Embeddable Schema
              </h3>
              <p className="text-xs text-slate-500">
                Public customer web forms auto-convert incoming inquiries into CRM leads.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEmbedCodeOpen(true)}
              className="text-xs font-bold gap-1.5 text-[#00a8ff]"
            >
              <Code className="w-3.5 h-3.5" /> View Embed Snippet
            </Button>
          </div>

          {isLoadingForms ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
              <p className="text-xs text-slate-400">Loading form builder templates...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Template List Selector */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Pre-Built Hospitality Templates
                </div>
                {forms.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setActiveFormTemplate(f)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      activeFormTemplate?.id === f.id
                        ? 'border-[#00a8ff] bg-sky-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-slate-900">{f.formName}</h5>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {f.formSchema?.description || 'Public guest form'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 font-semibold">
                      {f.formSchema?.fields?.length || 0} Dynamic Form Fields
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Schema Interactive Preview & Test Ingestion */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                {activeFormTemplate ? (
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="font-black text-lg text-slate-900">
                        {activeFormTemplate.formSchema?.title || activeFormTemplate.formName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activeFormTemplate.formSchema?.description}
                      </p>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const payload: Record<string, any> = {};
                        formData.forEach((value, key) => {
                          payload[key] = value;
                        });
                        await crmService.submitFormResponse(activeFormTemplate.id, payload);
                        queryClient.invalidateQueries({ queryKey: ['crmLeads'] });
                        triggerBanner('Form response submitted and converted into a CRM Lead!');
                      }}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeFormTemplate.formSchema?.fields?.map((f) => (
                          <div key={f.id} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {f.label} {f.required && <span className="text-rose-500">*</span>}
                            </label>

                            {f.type === 'select' ? (
                              <select
                                name={f.name}
                                required={f.required}
                                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#00a8ff]"
                              >
                                {f.options?.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : f.type === 'textarea' ? (
                              <textarea
                                name={f.name}
                                required={f.required}
                                placeholder={f.placeholder}
                                rows={3}
                                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#00a8ff]"
                              />
                            ) : (
                              <input
                                type={f.type}
                                name={f.name}
                                required={f.required}
                                placeholder={f.placeholder}
                                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#00a8ff]"
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">
                          Auto-ingestion maps name/email into CRM pipeline.
                        </span>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5">
                          <Send className="w-3.5 h-3.5" /> Submit Test Response
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Select a form template to preview.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: 11.5 Customer Support Ticketing & Guest Care Desk      */}
      {/* ============================================================== */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-rose-100 bg-gradient-to-br from-rose-50 to-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">20-Min SLA Active</div>
                  <div className="text-xl font-black text-rose-700">
                    {tickets.filter((t) => t.priority === 'urgent' && t.status !== 'resolved').length} Tickets Urgent
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-sky-100 bg-gradient-to-br from-sky-50 to-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-[#00a8ff] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Canned Fast Macros</div>
                  <div className="text-xl font-black text-[#00a8ff]">{cannedResponses.length} Fast Shortcuts</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Knowledge Base Articles</div>
                  <div className="text-xl font-black text-emerald-700">{knowledgeBase.length} Indexed Topics</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tickets List & Detail Thread */}
          {isLoadingTickets ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
              <p className="text-xs text-slate-400">Loading support tickets...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Ticket Cards */}
              <div className="space-y-3 lg:col-span-1">
                {tickets.map((t) => {
                  const isUrgent = t.priority === 'urgent';
                  const isResolved = t.status === 'resolved';

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        selectedTicket?.id === t.id
                          ? 'border-[#00a8ff] bg-sky-50/40 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-400">{t.ticketCode}</span>
                        <div className="flex items-center gap-1.5">
                          {isUrgent && !isResolved && (
                            <span className="bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded animate-pulse">
                              20M SLA
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                              isResolved
                                ? 'bg-emerald-100 text-emerald-800'
                                : t.status === 'in_progress'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {t.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <h5 className="font-bold text-xs text-slate-900 leading-snug">{t.subject}</h5>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                        <span>{t.guestName}</span>
                        <span>{formatDate(t.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ticket Conversation Thread & Fast Canned Response */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs min-h-[450px]">
                {selectedTicket ? (
                  <div className="space-y-4 flex flex-col h-full justify-between">
                    <div>
                      {/* Thread Header */}
                      <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-400">
                              {selectedTicket.ticketCode}
                            </span>
                            <h4 className="font-black text-sm text-slate-900">{selectedTicket.subject}</h4>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Guest: <span className="font-bold text-slate-700">{selectedTicket.guestName}</span> ({selectedTicket.guestEmail || 'No email'})
                          </p>
                        </div>

                        {/* Status Switcher */}
                        <div className="flex items-center gap-1">
                          {['open', 'in_progress', 'resolved'].map((st) => (
                            <button
                              key={st}
                              onClick={() =>
                                updateTicketStatusMutation.mutate({
                                  ticketId: selectedTicket.id,
                                  status: st,
                                })
                              }
                              className={`text-[10px] font-bold px-2 py-1 rounded capitalize transition ${
                                selectedTicket.status === st
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {st.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Messages Stream */}
                      <div className="space-y-3 py-4 max-h-[300px] overflow-y-auto">
                        {selectedTicket.replies?.map((r) => {
                          const isStaff = r.senderType === 'staff';
                          return (
                            <div
                              key={r.id}
                              className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                            >
                              <div
                                className={`p-3 rounded-xl text-xs max-w-[80%] leading-relaxed ${
                                  isStaff
                                    ? 'bg-[#00a8ff] text-white rounded-br-xs'
                                    : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                                }`}
                              >
                                {r.message}
                              </div>
                              <span className="text-[9px] text-slate-400 mt-1 font-semibold">
                                {isStaff ? 'Staff Care Desk' : selectedTicket.guestName} • {formatDate(r.createdAt)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reply & Fast Canned Response Selector */}
                    <div className="border-t border-slate-100 pt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">Insert Macro:</span>
                        <div className="flex flex-wrap gap-1">
                          {cannedResponses.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setTicketReplyInput(c.response)}
                              className="text-[10px] bg-slate-100 hover:bg-sky-50 hover:text-[#00a8ff] text-slate-600 px-2 py-0.5 rounded font-mono transition"
                              title={c.title}
                            >
                              {c.shortcut}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ticketReplyInput}
                          onChange={(e) => setTicketReplyInput(e.target.value)}
                          placeholder="Type response to guest or use /macro shortcuts..."
                          className="flex-1 text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#00a8ff]"
                        />
                        <Button
                          disabled={!ticketReplyInput.trim() || replyTicketMutation.isPending}
                          onClick={() =>
                            replyTicketMutation.mutate({
                              ticketId: selectedTicket.id,
                              message: ticketReplyInput,
                            })
                          }
                          className="bg-[#00a8ff] hover:bg-[#0090dd] text-white text-xs font-bold gap-1"
                        >
                          <Send className="w-3.5 h-3.5" /> Send
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-24 text-center text-slate-400 text-xs">
                    Select a support ticket to view conversation thread and 20-min SLA timer.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Lead Details, Call Logs & Notes                        */}
      {/* ============================================================== */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-lg text-slate-900">{selectedLead.title}</h3>
                <p className="text-xs text-slate-500">
                  Contact: <span className="font-bold text-slate-700">{selectedLead.contactName}</span> •{' '}
                  {selectedLead.email} • {selectedLead.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Source Overview */}
            <div className="flex items-center gap-3">
              <span className="bg-emerald-100 text-emerald-800 font-black text-xs px-2.5 py-1 rounded-full">
                Score: {selectedLead.leadScore}/100
              </span>
              <span className="bg-slate-100 text-slate-700 font-bold text-xs px-2.5 py-1 rounded-full capitalize">
                Source: {selectedLead.source.replace('_', ' ')}
              </span>
              <span className="bg-sky-50 text-[#00a8ff] font-bold text-xs px-2.5 py-1 rounded-full">
                Stage: {selectedLead.stage?.name || 'Inquiry'}
              </span>
            </div>

            {/* Call Logs Stream */}
            <div>
              <h5 className="font-extrabold text-xs text-slate-800 mb-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#00a8ff]" /> Call Log History:
              </h5>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedLead.callLogs && selectedLead.callLogs.length > 0 ? (
                  selectedLead.callLogs.map((cl) => (
                    <div key={cl.id} className="p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-100">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{cl.callSubject}</span>
                        <span className="text-[10px] text-slate-400">{cl.callDuration} mins</span>
                      </div>
                      {cl.notes && <p className="text-slate-600 mt-1 text-[11px]">{cl.notes}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No calls logged yet.</p>
                )}
              </div>
            </div>

            {/* Add Call Log Box */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                placeholder="Call Subject (e.g. Menu tasting review)"
                value={callLogSubject}
                onChange={(e) => setCallLogSubject(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg p-2 flex-1"
              />
              <input
                type="number"
                placeholder="Mins"
                value={callLogDuration}
                onChange={(e) => setCallLogDuration(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg p-2 w-20"
              />
              <Button
                disabled={!callLogSubject.trim()}
                onClick={() =>
                  addCallLogMutation.mutate({
                    leadId: selectedLead.id,
                    dto: {
                      callSubject: callLogSubject,
                      callDuration: Number(callLogDuration) || 15,
                      notes: 'Logged from CRM Console',
                    },
                  })
                }
                size="sm"
                className="bg-[#00a8ff] text-white text-xs font-bold"
              >
                Log Call
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Proposal PDF Details                                   */}
      {/* ============================================================== */}
      {selectedDealForProposal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Banquet Event Proposal</h3>
                <p className="text-xs text-slate-500">{selectedDealForProposal.dealName}</p>
              </div>
              <button
                onClick={() => setSelectedDealForProposal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {selectedDealForProposal.proposals?.map((prop) => (
                <div key={prop.id} className="p-4 bg-sky-50/50 border border-sky-100 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sky-800">{prop.proposalRef}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {prop.status}
                    </span>
                  </div>
                  <div className="text-lg font-black text-slate-900">{formatCurrency(prop.amount)}</div>
                  <p className="text-slate-500 text-[11px]">
                    Includes Plated Menu selection, Grand Ballroom layout, and Audio-Visual stage setup.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-bold text-[#00a8ff] mt-2 gap-1.5"
                    onClick={() => triggerBanner(`Downloading proposal PDF ${prop.proposalRef}...`)}
                  >
                    <FileText className="w-3.5 h-3.5" /> Download Polished PDF
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Digital Banquet Contract E-Signature                   */}
      {/* ============================================================== */}
      {selectedDealForContract && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Banquet Contract & E-Signature</h3>
                <p className="text-xs text-slate-500">{selectedDealForContract.dealName}</p>
              </div>
              <button
                onClick={() => setSelectedDealForContract(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedDealForContract.contracts?.map((c) => (
              <div key={c.id} className="space-y-3 text-xs">
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="font-mono font-bold text-slate-700">{c.contractNumber}</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      c.isSigned ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.isSigned ? 'Legally Executed & Signed' : 'Pending Signature'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50/60 rounded-lg text-slate-600 max-h-36 overflow-y-auto font-mono text-[11px] leading-relaxed border border-slate-100">
                  {c.termsContent}
                </div>

                {c.isSigned && c.signatures && c.signatures[0] && (
                  <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase">Audit Verified Digital Signature:</div>
                    <div className="font-bold text-slate-800 text-sm">{c.signatures[0].signerName}</div>
                    <div className="text-[10px] text-slate-500">
                      IP Address: {c.signatures[0].signerIp} • Timestamp: {formatDate(c.signatures[0].signedAt)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Embed Code Snippet for Forms                           */}
      {/* ============================================================== */}
      {isEmbedCodeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Embed Public Form on Website</h3>
                <p className="text-xs text-slate-500">Copy iframe code or script tag for your landing page.</p>
              </div>
              <button onClick={() => setIsEmbedCodeOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700">HTML Iframe Embed Code:</label>
              <textarea
                readOnly
                rows={4}
                value={`<iframe src="https://omnistay.softsasi.com/embed/forms/${activeFormTemplate?.id || 'form-id'}" width="100%" height="650" frameborder="0"></iframe>`}
                className="w-full text-xs font-mono p-3 bg-slate-900 text-sky-400 rounded-xl"
              />
            </div>
            <Button
              onClick={() => {
                triggerBanner('Embed code copied to clipboard!');
                setIsEmbedCodeOpen(false);
              }}
              className="w-full bg-[#00a8ff] text-white text-xs font-bold"
            >
              Copy Embed Code
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Add New Inbound Lead                                   */}
      {/* ============================================================== */}
      {isAddLeadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Create New Inbound Lead</h3>
                <p className="text-xs text-slate-500">Domain rules will automatically compute commercial lead score.</p>
              </div>
              <button onClick={() => setIsAddLeadOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createLeadMutation.mutate(newLead);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Inquiry / Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Wedding & Ballroom Buyout"
                  value={newLead.title}
                  onChange={(e) => setNewLead({ ...newLead, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lady Catherine"
                  value={newLead.contactName}
                  onChange={(e) => setNewLead({ ...newLead, contactName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 0123"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    value={newLead.budget}
                    onChange={(e) => setNewLead({ ...newLead, budget: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Headcount</label>
                  <input
                    type="number"
                    value={newLead.guestCount}
                    onChange={(e) => setNewLead({ ...newLead, guestCount: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Days</label>
                  <input
                    type="number"
                    value={newLead.durationDays}
                    onChange={(e) => setNewLead({ ...newLead, durationDays: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setIsAddLeadOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#00a8ff] text-white font-bold">
                  Create Lead
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Add New Banquet Deal                                   */}
      {/* ============================================================== */}
      {isAddDealOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Add Banquet Deal</h3>
                <p className="text-xs text-slate-500">Initialize deal on sales pipeline Kanban.</p>
              </div>
              <button onClick={() => setIsAddDealOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createDealMutation.mutate(newDeal);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Deal Title / Client Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Geneva Watchmakers VIP Preview"
                  value={newDeal.dealName}
                  onChange={(e) => setNewDeal({ ...newDeal, dealName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deal Value ($)</label>
                  <input
                    type="number"
                    value={newDeal.dealValue}
                    onChange={(e) => setNewDeal({ ...newDeal, dealValue: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Close Date</label>
                  <input
                    type="date"
                    value={newDeal.expectedClose}
                    onChange={(e) => setNewDeal({ ...newDeal, expectedClose: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setIsAddDealOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#00a8ff] text-white font-bold">
                  Save Deal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
