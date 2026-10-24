'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, MessageSquare, TrendingUp, Settings, CheckCircle2, Shield, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AiConciergeStudioPage() {
  const [activeTab, setActiveTab] = useState<'config' | 'telemetry' | 'yield'>('config');
  const [model, setModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState('0.7');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are the 24/7 Luxury AI Concierge for OmniStay 360. You possess full knowledge of room attributes, dining menus, local excursions, and live PMS inventory. Provide polite, tailored recommendations and assist guests with reservations.'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">AI Concierge & Automation</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Bot className="w-6 h-6 text-[#00a8ff]" /> Autonomous AI Concierge Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Multimodal RAG knowledge bases, in-chat room booking, and dynamic yield pricing algorithms (Chapter 14 / Figure 14.1 & 14.2).
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'config' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Agent Configuration (Fig 14.1)
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'telemetry' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Conversational Telemetry (Fig 14.2)
          </button>
          <button
            onClick={() => setActiveTab('yield')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'yield' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dynamic Yield Pricing
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>AI Concierge parameters updated successfully!</span>
        </div>
      )}

      {/* Figure 14.1: Agent Configuration */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Agent Profile & System Persona
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Agent Display Name</label>
                  <input
                    type="text"
                    defaultValue="OmniStay Luxury Assistant"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Underlying LLM Engine</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
                  >
                    <option value="gpt-4o-mini">OpenAI GPT-4o-Mini</option>
                    <option value="gpt-4o">OpenAI GPT-4o (Multimodal)</option>
                    <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">System Persona & Guardrails</label>
                <textarea
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full p-3 text-xs bg-white border border-slate-200 rounded text-slate-800 leading-relaxed focus:outline-none focus:border-[#00a8ff]"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button type="submit" className="bg-[#00a8ff] hover:bg-[#0097e6] text-white">
                  Save Agent Persona
                </Button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-500">
              RAG Knowledge Indexing
            </h3>
            <div className="space-y-3">
              {[
                { title: 'Hotel Stanford Amenities & Policies', status: 'Indexed (42 Chunks)' },
                { title: 'Fine Dining Menus & Wine Lists', status: 'Indexed (18 Chunks)' },
                { title: 'Cox’s Bazar Local Excursions Guide', status: 'Indexed (64 Chunks)' },
              ].map((doc, idx) => (
                <div key={idx} className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-xs font-bold text-slate-900">{doc.title}</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">{doc.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Figure 14.2: Conversational Telemetry */}
      {activeTab === 'telemetry' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total In-Chat Inquiries', val: '1,420' },
              { label: 'Conversational Bookings', val: '184 Completed' },
              { label: 'Direct In-Chat Revenue', val: '$64,500' },
              { label: 'Guest Sentiment Score', val: '98.4% Positive' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
                <span className="text-[11px] text-slate-500 font-medium">{stat.label}</span>
                <div className="text-lg font-bold text-slate-900 mt-1">{stat.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Yield Pricing */}
      {activeTab === 'yield' && (
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Automated Occupancy Surge Pricing Rules</h3>
          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
              <span>When Property Occupancy &gt; 70%</span>
              <span className="font-bold text-emerald-600">+10% Automated Rate Surge</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
              <span>When Property Occupancy &gt; 85%</span>
              <span className="font-bold text-emerald-600">+25% Automated Rate Surge</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
              <span>When Property Occupancy &gt; 95%</span>
              <span className="font-bold text-emerald-600">+50% Automated Rate Surge</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
