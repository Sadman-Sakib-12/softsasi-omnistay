'use client';

import React, { useState } from 'react';
import { MessageSquare, Phone, Mail, Send, CheckCircle2, User, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesService, ChatMessageItem, ChatChannelItem } from '@/features/messages/services/messages.service';

export default function OmnichannelMessagesPage() {
  const queryClient = useQueryClient();
  const [activeChannelType, setActiveChannelType] = useState<'whatsapp' | 'internal' | 'sms'>('whatsapp');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [replyText, setReplyText] = useState('');

  const { data: channels = [] } = useQuery<ChatChannelItem[]>({
    queryKey: ['chatChannels'],
    queryFn: () => messagesService.getChannels(),
  });

  const activeChannel = selectedChannelId || channels[0]?.id || '';

  const { data: messages = [], isLoading } = useQuery<ChatMessageItem[]>({
    queryKey: ['chatMessages', activeChannel],
    queryFn: () => (activeChannel ? messagesService.getMessages(activeChannel) : Promise.resolve([])),
    enabled: !!activeChannel,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) =>
      messagesService.sendMessage({
        channelId: selectedChannelId,
        body: text,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', selectedChannelId] });
      setReplyText('');
    },
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await sendMutation.mutateAsync(replyText.trim());
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Omnichannel Communications</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#00a8ff]" /> Omnichannel Communications Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            WhatsApp Business API automation, guest live chat, Twilio SMS triggers, and staff channels (Chapter 17).
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveChannelType('whatsapp')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeChannelType === 'whatsapp' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            WhatsApp Business
          </button>
          <button
            onClick={() => setActiveChannelType('internal')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeChannelType === 'internal' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Internal Staff Chat
          </button>
          <button
            onClick={() => setActiveChannelType('sms')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeChannelType === 'sms' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SMS Gateways
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Left Channels List */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {activeChannelType === 'whatsapp' ? 'Guest Inquiries' : activeChannelType === 'internal' ? 'Staff Channels' : 'Carrier Logs'}
          </span>
          <div className="space-y-1.5">
            {channels.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No active channels</p>
            ) : (
              channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannelId(ch.id)}
                  className={`w-full text-left p-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeChannel === ch.id
                      ? 'bg-blue-50 text-[#00a8ff] font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  #{ch.channelName}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Active Chat Box */}
        <div className="md:col-span-3 bg-white border border-slate-200 rounded-lg shadow-2xs flex flex-col h-[520px]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="font-bold text-slate-900 text-xs">
                Active Feed — #{channels.find((c) => c.id === activeChannel)?.channelName || 'General'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Real-Time WebSocket & REST Stream</span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#00a8ff]" /> Loading chat transcript...
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No messages in this channel yet.
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-lg max-w-lg text-xs ${
                    m.isStaff
                      ? 'bg-slate-100 text-slate-800 ml-auto border border-slate-200'
                      : 'bg-blue-50 text-slate-900 border border-blue-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 gap-4">
                    <span className="font-bold text-slate-700">{m.sender}</span>
                    <span>{m.time}</span>
                  </div>
                  <p className="leading-relaxed">{m.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type dispatch response or message to guest..."
              className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-xs focus:outline-hidden focus:border-[#00a8ff]"
            />
            <Button
              type="submit"
              disabled={sendMutation.isPending}
              size="sm"
              className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs px-4"
            >
              <Send className="w-3.5 h-3.5 mr-1" /> Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
