'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BeatLoader } from 'react-spinners';
import {
  MessageSquare,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  User,
  Clock,
  ShieldCheck,
  Plus,
  RefreshCw,
  X,
  FileText,
  Volume2,
  Image as ImageIcon,
  Sparkles,
  Bot,
  UserCheck,
  Radio,
  Bell,
  Smartphone,
  ExternalLink,
  DollarSign,
  AlertTriangle,
  Play,
  Check,
  Paperclip,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  messagesService,
  ChatMessageItem,
  ChatChannelItem,
  WhatsappMessageItem,
  SmsGatewayItem,
  SmsLogItem,
  EmailTemplateItem,
  EmailCampaignItem,
  PushNotificationItem,
} from '@/features/messages/services/messages.service';

export default function OmnichannelMessagesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'chat' | 'whatsapp' | 'sms' | 'email' | 'push'>('chat');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [replyText, setReplyText] = useState('');

  // Modals state
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);
  const [isSendWhatsappOpen, setIsSendWhatsappOpen] = useState(false);
  const [isSendSmsOpen, setIsSendSmsOpen] = useState(false);
  const [isAddCampaignOpen, setIsAddCampaignOpen] = useState(false);
  const [isSendPushOpen, setIsSendPushOpen] = useState(false);

  // Forms state
  const [newChannel, setNewChannel] = useState({ channelName: '', isPrivate: false });
  const [newWhatsapp, setNewWhatsapp] = useState({ recipientNo: '+14155552671', customMessage: '' });
  const [newSms, setNewSms] = useState({ phoneTo: '+14155550192', message: '', gateway: 'twilio', isCriticalOtp: false });
  const [newCampaign, setNewCampaign] = useState({ campaignName: '', subject: '', recipientCount: 250 });
  const [newPush, setNewPush] = useState({ title: '', body: '' });

  // AI Concierge Handshake state
  const [isAiConciergeActive, setIsAiConciergeActive] = useState(true);

  // Query: Main Overview
  const {
    data: overview,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ['chapter17_communicationOverview'],
    queryFn: () => messagesService.getOverview(),
  });

  const channels = overview?.channels || [];
  const activeChannel = selectedChannelId || channels[0]?.id || '';

  // Query: Channel Messages
  const {
    data: channelMessages = [],
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
  } = useQuery<ChatMessageItem[]>({
    queryKey: ['chapter17_channelMessages', activeChannel],
    queryFn: () => (activeChannel ? messagesService.getMessages(activeChannel) : Promise.resolve([])),
    enabled: !!activeChannel,
  });

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: (dto: { body: string; attachment?: string }) =>
      messagesService.sendMessage({
        channelId: activeChannel,
        body: dto.body,
        attachment: dto.attachment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter17_channelMessages', activeChannel] });
      setReplyText('');
    },
  });

  const createChannelMutation = useMutation({
    mutationFn: (dto: { channelName: string; isPrivate?: boolean }) =>
      messagesService.createChannel(dto),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['chapter17_communicationOverview'] });
      setIsAddChannelOpen(false);
      setNewChannel({ channelName: '', isPrivate: false });
      if (created?.id) setSelectedChannelId(created.id);
    },
  });

  const sendWhatsappMutation = useMutation({
    mutationFn: (dto: { recipientNo: string; customMessage: string }) =>
      messagesService.sendWhatsappMessage(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter17_communicationOverview'] });
      setIsSendWhatsappOpen(false);
      setNewWhatsapp({ recipientNo: '+14155552671', customMessage: '' });
    },
  });

  const sendSmsMutation = useMutation({
    mutationFn: (dto: { phoneTo: string; message: string; gateway?: string; isCriticalOtp?: boolean }) =>
      messagesService.sendSms(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter17_communicationOverview'] });
      setIsSendSmsOpen(false);
      setNewSms({ phoneTo: '+14155550192', message: '', gateway: 'twilio', isCriticalOtp: false });
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: (dto: { campaignName: string; subject: string; recipientCount?: number }) =>
      messagesService.createEmailCampaign(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter17_communicationOverview'] });
      setIsAddCampaignOpen(false);
      setNewCampaign({ campaignName: '', subject: '', recipientCount: 250 });
    },
  });

  const sendPushMutation = useMutation({
    mutationFn: (dto: { title: string; body: string }) =>
      messagesService.sendPushNotification({
        userId: '00000000-0000-4000-a000-000000000002',
        ...dto,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter17_communicationOverview'] });
      setIsSendPushOpen(false);
      setNewPush({ title: '', body: '' });
    },
  });

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendMessageMutation.mutate({ body: replyText.trim() });
  };

  const handleSendVoiceMemoSim = () => {
    sendMessageMutation.mutate({
      body: 'Transmitted voice memo for rapid operational briefing.',
      attachment: JSON.stringify({
        type: 'audio/webm',
        url: 'https://cdn.omnistay.com/audio/memo_suite402_ac.webm',
        durationSec: 18,
        caption: 'Voice memo: Audio inspection memo recorded',
      }),
    });
  };

  const handleSendPhotoSim = () => {
    sendMessageMutation.mutate({
      body: 'Attached inspection photo of bathroom amenity fixtures.',
      attachment: JSON.stringify({
        type: 'image/jpeg',
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
        caption: 'Inspection photo: Amenity fixtures check',
      }),
    });
  };

  const handleSendPdfSim = () => {
    sendMessageMutation.mutate({
      body: 'Attached daily operational audit and dispatch summary.',
      attachment: JSON.stringify({
        type: 'application/pdf',
        url: 'https://cdn.omnistay.com/docs/daily_audit_dispatch_nov06.pdf',
        caption: 'Daily Night Audit & Housekeeping Report.pdf',
      }),
    });
  };

  const currentChannelObj = channels.find((c) => c.id === activeChannel);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
            <span>/</span>
            <span className="text-slate-400">Chapter 17</span>
            <span>/</span>
            <span className="text-slate-800 font-medium">Omnichannel Communication & Messaging</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#00a8ff]" /> Omnichannel Messaging Infrastructure
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            WebSocket internal chat, WhatsApp Business API automation, multi-carrier SMS, dynamic email styler, and push notifications.
          </p>
        </div>

        {/* Global Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#00a8ff]" />
              <span>17.1 Chat & Channels</span>
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'whatsapp'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>17.2 WhatsApp API</span>
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'sms'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-blue-600" />
              <span>17.3 SMS Gateways</span>
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'email'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span>17.4 Email Marketing</span>
            </button>
            <button
              onClick={() => setActiveTab('push')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'push'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>17.5 Push & Web Push</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              refetchOverview();
              refetchMessages();
            }}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Global Telemetry Banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Staff Channels</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900">{overview?.summary?.totalChannels || 0}</span>
            <Badge variant="outline" className="text-[9px] bg-blue-50 text-[#00a8ff]">Chatify</Badge>
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp Stream</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-emerald-600">{overview?.whatsapp?.totalMessages || 0}</span>
            <span className="text-[10px] text-slate-500 font-medium">Meta Verified</span>
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SMS Delivery Rate</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-blue-600">{overview?.sms?.successRate || 100}%</span>
            <span className="text-[10px] text-slate-500 font-mono">${(overview?.sms?.totalCost || 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Automation</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-indigo-600">{overview?.summary?.emailTemplatesCount || 0} Tpls</span>
            <span className="text-[10px] text-slate-500">{overview?.email?.totalSent || 0} Sent</span>
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Push Dispatches</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-amber-600">{overview?.summary?.pushNotificationsCount || 0}</span>
            <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700">FCM / WebPush</Badge>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: 17.1 REAL-TIME INTERNAL MESSENGER & GUEST CHAT    */}
      {/* ======================================================== */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Channels List */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Operational Channels
                </span>
                <button
                  onClick={() => setIsAddChannelOpen(true)}
                  className="text-xs text-[#00a8ff] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>

              <div className="space-y-1.5">
                {channels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChannelId(ch.id)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      activeChannel === ch.id
                        ? 'bg-blue-50 text-[#00a8ff] border border-blue-200 shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">#{ch.channelName}</span>
                    {ch.isPrivate && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 bg-slate-50 text-slate-500">
                        Private
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-4 text-[11px] text-slate-400">
              Preserved from Chatify (`ChMessage.php`, `ChFavorite.php`)
            </div>
          </div>

          {/* Active Chat Transcript & Media Viewer */}
          <div className="md:col-span-3 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col h-[560px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-900 text-sm">
                  #{currentChannelObj?.channelName || 'General-Operations'}
                </span>
                <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600">
                  WebSocket Real-Time Broadcast
                </Badge>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {channelMessages.length} Messages Logged
              </span>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
              {isMessagesLoading ? (
                <div className="h-full flex items-center justify-center">
                  <BeatLoader color="#22d3ee" size={14} speedMultiplier={1.2} />
                </div>
              ) : channelMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No messages in this channel yet. Type a dispatch below.
                </div>
              ) : (
                channelMessages.map((msg) => {
                  const attachment = typeof msg.attachment === 'object' ? msg.attachment : null;

                  return (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-xl max-w-lg text-xs space-y-2 shadow-2xs ${
                        msg.isStaff
                          ? 'bg-white border border-slate-200 ml-auto'
                          : 'bg-blue-50/80 border border-blue-200 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 gap-4">
                        <span className="font-bold text-slate-700">{msg.senderName}</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <p className="leading-relaxed text-slate-800">{msg.body}</p>

                      {/* Render Rich Attachments (Voice Memos, Photos, PDFs) */}
                      {attachment && (
                        <div className="pt-2 border-t border-slate-100">
                          {attachment.type === 'audio/webm' && (
                            <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#00a8ff] text-white flex items-center justify-center shrink-0">
                                <Volume2 className="w-4 h-4" />
                              </div>
                              <div className="flex-1 truncate">
                                <span className="font-bold text-slate-800 text-[11px] block truncate">
                                  {attachment.caption || 'Voice Memo'}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {attachment.durationSec || 15}s • High-Fidelity Opus Audio
                                </span>
                              </div>
                              <Button size="xs" variant="outline" className="h-7 text-[10px] bg-white">
                                <Play className="w-3 h-3 mr-1" /> Play
                              </Button>
                            </div>
                          )}

                          {attachment.type === 'image/jpeg' && (
                            <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                              <img
                                src={attachment.url}
                                alt="Inspection attachment"
                                className="w-full h-36 object-cover hover:scale-105 transition-transform"
                              />
                              <div className="p-1.5 text-[10px] font-medium text-slate-600 bg-white">
                                {attachment.caption}
                              </div>
                            </div>
                          )}

                          {attachment.type === 'application/pdf' && (
                            <div className="p-2.5 bg-rose-50/70 border border-rose-200 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                                <span className="font-semibold text-slate-800 truncate text-[11px]">
                                  {attachment.caption}
                                </span>
                              </div>
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-rose-700 font-bold hover:underline shrink-0"
                              >
                                View PDF
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Composer & Rich Attachment Simulators */}
            <div className="p-3 border-t border-slate-100 bg-white space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={handleSendVoiceMemoSim}
                  className="text-[10px] text-slate-600 hover:text-[#00a8ff]"
                  title="Simulate Voice Memo transmission"
                >
                  <Volume2 className="w-3 h-3 mr-1 text-[#00a8ff]" /> + Voice Memo
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={handleSendPhotoSim}
                  className="text-[10px] text-slate-600 hover:text-emerald-600"
                  title="Simulate Amenity Photo upload"
                >
                  <ImageIcon className="w-3 h-3 mr-1 text-emerald-600" /> + Damaged Photo
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={handleSendPdfSim}
                  className="text-[10px] text-slate-600 hover:text-rose-600"
                  title="Simulate PDF Report upload"
                >
                  <FileText className="w-3 h-3 mr-1 text-rose-600" /> + PDF Report
                </Button>
              </div>

              <form onSubmit={handleSendText} className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Dispatch response to #${currentChannelObj?.channelName || 'channel'}...`}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-hidden focus:border-[#00a8ff]"
                />
                <Button
                  type="submit"
                  disabled={sendMessageMutation.isPending || !replyText.trim()}
                  size="sm"
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs px-4"
                >
                  <Send className="w-3.5 h-3.5 mr-1" /> Send
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: 17.2 WHATSAPP BUSINESS API AUTOMATION & AI CONCIERGE*/}
      {/* ======================================================== */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-600" /> WhatsApp Business Cloud API & AI Concierge Handshake
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Two-way guest concierge with automated transactional triggers, instant FAQ answering, and live staff takeover.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
                <Bot className={`w-4 h-4 ${isAiConciergeActive ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
                <span className="font-semibold text-slate-700">
                  {isAiConciergeActive ? 'AI Concierge Active' : 'Human Staff Takeover'}
                </span>
                <button
                  onClick={() => setIsAiConciergeActive(!isAiConciergeActive)}
                  className="ml-2 text-[10px] text-emerald-700 underline font-bold cursor-pointer"
                >
                  Toggle
                </button>
              </div>

              <Button
                onClick={() => setIsSendWhatsappOpen(true)}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Outbound WhatsApp
              </Button>
            </div>
          </div>

          {/* WhatsApp Inbound/Outbound Feed */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Live WhatsApp Message Transcript
              </span>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                HMAC-SHA256 Webhook Verified
              </Badge>
            </div>

            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/60 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Direction</th>
                  <th className="py-2.5 px-4">Phone Number</th>
                  <th className="py-2.5 px-4">Message Content</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overview?.whatsapp?.messages && overview.whatsapp.messages.length > 0 ? (
                  overview.whatsapp.messages.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold uppercase ${
                            m.direction === 'inbound'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {m.direction}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">{m.recipientNo}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium max-w-md">{m.messageBody}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(m.sentAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-emerald-600 font-bold text-[11px] uppercase">{m.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No WhatsApp communications logged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: 17.3 HIGH-DELIVERY SMS GATEWAY ENGINE             */}
      {/* ======================================================== */}
      {activeTab === 'sms' && (
        <div className="space-y-6">
          {/* SMS Carrier Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {overview?.sms?.gateways?.map((gw) => (
              <div key={gw.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 uppercase">{gw.gatewayKey.replace('_', ' ')}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-bold ${
                      gw.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-500'
                    }`}
                  >
                    {gw.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>Sender ID: <span className="font-bold text-slate-700">{gw.senderId || 'OmniStay'}</span></div>
                  <div>API Key: <span className="font-mono text-slate-700">{gw.apiKey.slice(0, 10)}...</span></div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setIsSendSmsOpen(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Dispatch SMS / Critical OTP
            </Button>
          </div>

          {/* SMS Delivery Logs */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                High-Delivery Carrier SMS Audit Trail (Twilio, Vonage, AWS SNS)
              </span>
              <span className="text-xs text-slate-500 font-medium">Cost: $0.0075 / regular • $0.0150 / 2FA OTP</span>
            </div>

            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/60 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Recipient Phone</th>
                  <th className="py-2.5 px-4">Carrier Gateway</th>
                  <th className="py-2.5 px-4">Message Body</th>
                  <th className="py-2.5 px-4">Unit Cost</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overview?.sms?.logs && overview.sms.logs.length > 0 ? (
                  overview.sms.logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">{log.phoneTo}</td>
                      <td className="py-3 px-4 font-bold uppercase text-slate-600">{log.gateway}</td>
                      <td className="py-3 px-4 text-slate-800 max-w-md">{log.message}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">${Number(log.cost).toFixed(4)}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                          Delivered
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No SMS logs recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: 17.4 DYNAMIC EMAIL TEMPLATES & MARKETING SEQUENCES*/}
      {/* ======================================================== */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" /> Dynamic Email Templates & Guest Lifecycle Sequences
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                50+ dynamic merge tags, HTML styler, and automated 7-day pre-arrival, 24-hr key pass, and post-stay review sequences.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/messages/email-templates"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#00a8ff] hover:bg-[#0097e6] text-white shadow-2xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Visual Drag-and-Drop Styler</span>
              </Link>

              <Button
                onClick={() => setIsAddCampaignOpen(true)}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> New Lifecycle Campaign
              </Button>
            </div>
          </div>

          {/* Email Lifecycle Sequences Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Automated Guest Lifecycle Campaigns (NotificationTemplates.php)
              </span>
              <span className="text-xs text-slate-500 font-medium">Preserved from erp.softsasi.com</span>
            </div>

            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/60 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Campaign Name</th>
                  <th className="py-2.5 px-4">Subject Line</th>
                  <th className="py-2.5 px-4 text-center">Recipients</th>
                  <th className="py-2.5 px-4 text-center">Dispatched</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overview?.email?.campaigns && overview.email.campaigns.length > 0 ? (
                  overview.email.campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{camp.campaignName}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-sm truncate">{camp.subject}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">{camp.recipientCount}</td>
                      <td className="py-3 px-4 text-center font-bold text-indigo-600">{camp.sentCount}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-bold ${
                            camp.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : camp.status === 'active'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-50 text-slate-600'
                          }`}
                        >
                          {camp.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No campaigns scheduled.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: 17.5 PUSH NOTIFICATIONS & WEB PUSH                */}
      {/* ======================================================== */}
      {activeTab === 'push' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" /> Firebase Cloud Messaging (FCM) & Web Push Engine
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Instant browser & mobile push alerts notifying front-desk staff of new web reservations and guest service calls.
              </p>
            </div>

            <Button
              onClick={() => setIsSendPushOpen(true)}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Broadcast Push Notification
            </Button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Real-Time Push Notification Dispatch Feed
              </span>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                Native VAPID & FCM Key Certified
              </Badge>
            </div>

            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/60 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Alert Title</th>
                  <th className="py-2.5 px-4">Body Content</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4 text-right">Read State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overview?.push?.notifications && overview.push.notifications.length > 0 ? (
                  overview.push.notifications.map((notif) => (
                    <tr key={notif.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{notif.title}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{notif.body}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            notif.isRead
                              ? 'bg-slate-50 text-slate-500 border-slate-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {notif.isRead ? 'Acknowledged' : 'New Alert'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No push notifications dispatched.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: CREATE CHAT CHANNEL                             */}
      {/* ======================================================== */}
      {isAddChannelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#00a8ff]" /> Create Operational Channel
              </h3>
              <button onClick={() => setIsAddChannelOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createChannelMutation.mutate(newChannel);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Channel Name</label>
                <input
                  type="text"
                  required
                  value={newChannel.channelName}
                  onChange={(e) => setNewChannel({ ...newChannel, channelName: e.target.value })}
                  placeholder="e.g. Concierge-VIP-Dispatches"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={newChannel.isPrivate}
                  onChange={(e) => setNewChannel({ ...newChannel, isPrivate: e.target.checked })}
                />
                <label htmlFor="isPrivate" className="text-slate-700 font-medium">Private Management Only</label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddChannelOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createChannelMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white"
                >
                  Create Channel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: SEND OUTBOUND WHATSAPP                           */}
      {/* ======================================================== */}
      {isSendWhatsappOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" /> Send WhatsApp Transactional Message
              </h3>
              <button onClick={() => setIsSendWhatsappOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendWhatsappMutation.mutate(newWhatsapp);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Recipient Number (E.164)</label>
                <input
                  type="text"
                  required
                  value={newWhatsapp.recipientNo}
                  onChange={(e) => setNewWhatsapp({ ...newWhatsapp, recipientNo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Custom Message / Template Text</label>
                <textarea
                  rows={3}
                  required
                  value={newWhatsapp.customMessage}
                  onChange={(e) => setNewWhatsapp({ ...newWhatsapp, customMessage: e.target.value })}
                  placeholder="e.g. Your dinner reservation at Ocean Terrace is confirmed for 7:30 PM."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsSendWhatsappOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={sendWhatsappMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Send WhatsApp
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: DISPATCH SMS / OTP                               */}
      {/* ======================================================== */}
      {isSendSmsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-600" /> Dispatch Carrier SMS / Critical OTP
              </h3>
              <button onClick={() => setIsSendSmsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendSmsMutation.mutate(newSms);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Phone Number (E.164)</label>
                <input
                  type="text"
                  required
                  value={newSms.phoneTo}
                  onChange={(e) => setNewSms({ ...newSms, phoneTo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">SMS Message Content</label>
                <textarea
                  rows={3}
                  required
                  value={newSms.message}
                  onChange={(e) => setNewSms({ ...newSms, message: e.target.value })}
                  placeholder="e.g. Master Suite 501 Door Lock PIN: *9428#. Valid from 3:00 PM."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCriticalOtp"
                  checked={newSms.isCriticalOtp}
                  onChange={(e) => setNewSms({ ...newSms, isCriticalOtp: e.target.checked })}
                />
                <label htmlFor="isCriticalOtp" className="text-slate-700 font-medium">
                  Mark as High-Priority 2FA Security Code
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsSendSmsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={sendSmsMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Dispatch SMS
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: CREATE EMAIL CAMPAIGN                            */}
      {/* ======================================================== */}
      {isAddCampaignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600" /> New Guest Lifecycle Email Campaign
              </h3>
              <button onClick={() => setIsAddCampaignOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createCampaignMutation.mutate(newCampaign);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={newCampaign.campaignName}
                  onChange={(e) => setNewCampaign({ ...newCampaign, campaignName: e.target.value })}
                  placeholder="e.g. Autumn Sanctuary Re-Engagement"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Email Subject Line</label>
                <input
                  type="text"
                  required
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                  placeholder="e.g. Return to Your Sanctuary — Exclusive 15% Privilege"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Target Recipient Count</label>
                <input
                  type="number"
                  required
                  value={newCampaign.recipientCount}
                  onChange={(e) => setNewCampaign({ ...newCampaign, recipientCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddCampaignOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createCampaignMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Schedule Sequence
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: BROADCAST PUSH NOTIFICATION                      */}
      {/* ======================================================== */}
      {isSendPushOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" /> Broadcast Push Notification (FCM / Web Push)
              </h3>
              <button onClick={() => setIsSendPushOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendPushMutation.mutate(newPush);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Notification Title</label>
                <input
                  type="text"
                  required
                  value={newPush.title}
                  onChange={(e) => setNewPush({ ...newPush, title: e.target.value })}
                  placeholder="e.g. VIP Limousine Arrival Alert"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Body Text</label>
                <textarea
                  rows={3}
                  required
                  value={newPush.body}
                  onChange={(e) => setNewPush({ ...newPush, body: e.target.value })}
                  placeholder="e.g. Mr. Arthur Vance limousine has arrived at Curbside Porte Cochere."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsSendPushOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={sendPushMutation.isPending}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Broadcast Push
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
