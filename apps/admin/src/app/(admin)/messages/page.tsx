'use client';

import React, { useState } from 'react';
import { MessageSquare, Phone, Mail, Send, CheckCircle2, User, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OmnichannelMessagesPage() {
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'internal' | 'sms'>('whatsapp');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Guest (Room 302 - Alexander)', text: 'Hello, could we get 2 extra down feather pillows delivered to Room 302 please?', time: '10:14 AM', isStaff: false },
    { id: 2, sender: 'AI Concierge (Autonomous)', text: 'Certainly, Mr. Alexander! A dispatch request has been forwarded to Housekeeping. Your pillows will arrive in approximately 8 minutes.', time: '10:14 AM', isStaff: true },
    { id: 3, sender: 'Housekeeping (Elena)', text: 'Delivered and confirmed with guest.', time: '10:21 AM', isStaff: true },
  ]);
  const [replyText, setReplyText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText) return;
    setMessages([
      ...messages,
      { id: Date.now(), sender: 'Front Desk Agent (You)', text: replyText, time: 'Just now', isStaff: true },
    ]);
    setReplyText('');
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
            onClick={() => setActiveChannel('whatsapp')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeChannel === 'whatsapp' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            WhatsApp Business
          </button>
          <button
            onClick={() => setActiveChannel('internal')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeChannel === 'internal' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Internal Staff Chat
          </button>
          <button
            onClick={() => setActiveChannel('sms')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeChannel === 'sms' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Twilio SMS Alerts
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden flex flex-col h-[520px]">
        {/* Chat Header */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
              WA
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Room 302: Alexander Wright (+1-415-***-9021)</p>
              <p className="text-[10px] text-emerald-600 font-semibold">Active WhatsApp Session · In-House VIP</p>
            </div>
          </div>
          <span className="text-[10px] text-slate-400">Checkout: 25 Oct 2026</span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.isStaff ? 'items-end' : 'items-start'}`}
            >
              <span className="text-[10px] text-slate-400 mb-0.5 px-1">{m.sender} · {m.time}</span>
              <div
                className={`max-w-md p-3 rounded-lg text-xs leading-relaxed shadow-2xs ${
                  m.isStaff
                    ? 'bg-[#00a8ff] text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your message or WhatsApp template reply..."
            className="flex-1 h-10 px-4 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
          />
          <Button type="submit" size="sm" className="h-10 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white">
            <Send className="w-4 h-4 mr-1.5" /> Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}
