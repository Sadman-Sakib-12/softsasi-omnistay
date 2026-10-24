'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { aiApi } from '../../services/api';
import {
  Sparkles,
  Bot,
  Sliders,
  BookOpen,
  Plus,
  Save,
  CheckCircle2,
  Trash2,
  BarChart3,
  Settings,
  MessageSquare,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const AiConciergeConfigSection: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'knowledge' | 'analytics'>('settings');

  // Agent Settings matching Figure 14.1
  const [agentName, setAgentName] = useState('Store Assistant / Concierge');
  const [department, setDepartment] = useState('General Support & In-Chat Commerce');
  const [description, setDescription] = useState('Official AI Assistant for room recommendations, booking, and guest services.');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are the primary Customer Care AI for OmniStay 360 resort properties. ' +
    '1. Help visitors look up room categories, amenities, live availability, and dynamic pricing.\n' +
    '2. Answer stay policy inquiries (check-in time 14:00, checkout 11:00, pet policy, airport transfers).\n' +
    '3. Recognize booking intent and guide travelers to complete instant room reservations.'
  );
  const [modelProvider, setModelProvider] = useState('OpenAI');
  const [modelName, setModelName] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.7);
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Knowledge Base items
  const [knowledgeList, setKnowledgeList] = useState<{ id: string; title: string; category: string; content: string }[]>([]);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docCategory, setDocCategory] = useState('property_info');
  const [addingDoc, setAddingDoc] = useState(false);

  useEffect(() => {
    // Load config from backend
    aiApi.getConfig().then((cfg) => {
      if (cfg && cfg.agentName) {
        setAgentName(cfg.agentName);
        if (cfg.systemPrompt) setSystemPrompt(cfg.systemPrompt);
        if (cfg.modelName) setModelName(cfg.modelName);
        if (cfg.temperature !== undefined) setTemperature(cfg.temperature);
        if (cfg.isEnabled !== undefined) setIsPublished(cfg.isEnabled);
      }
    }).catch(() => {});

    // Load knowledge docs from backend
    aiApi.getKnowledge().then((docs) => {
      if (Array.isArray(docs)) setKnowledgeList(docs);
    }).catch(() => {});
  }, []);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await aiApi.updateConfig({
        agentName,
        systemPrompt,
        modelProvider,
        modelName,
        temperature,
        isEnabled: isPublished,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docContent) return;

    setAddingDoc(true);
    try {
      const res = await aiApi.addKnowledge({
        title: docTitle,
        content: docContent,
        category: docCategory,
      });
      setKnowledgeList([
        {
          id: res?.id || String(Date.now()),
          title: docTitle,
          category: docCategory,
          content: docContent,
        },
        ...knowledgeList,
      ]);
      setDocTitle('');
      setDocContent('');
    } finally {
      setAddingDoc(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Dashboard</span>
        <span>/</span>
        <span>AI Suite</span>
        <span>/</span>
        <span className="text-slate-200 font-semibold">Concierge Agent Configuration</span>
      </div>

      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Autonomous AI Concierge Configuration</h1>
          <p className="text-xs text-slate-400 mt-1">
            Replicating Figure 14.1 & 14.2: AI Concierge Agent Configuration, Prompt Engineering & RAG Knowledge Base.
          </p>
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-600 hover:from-fuchsia-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-fuchsia-500/25 active:scale-95 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Publishing...' : savedSuccess ? '✓ Published Live' : 'Save & Publish Live'}</span>
        </button>
      </div>

      {/* Tabs matching Figure 14.1 */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveSubTab('settings')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors',
            activeSubTab === 'settings'
              ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30'
              : 'text-slate-400 hover:text-slate-200',
          )}
        >
          <Settings className="w-4 h-4" />
          <span>Agent Profile & Model</span>
        </button>

        <button
          onClick={() => setActiveSubTab('knowledge')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors',
            activeSubTab === 'knowledge'
              ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30'
              : 'text-slate-400 hover:text-slate-200',
          )}
        >
          <BookOpen className="w-4 h-4" />
          <span>RAG Knowledge Base ({knowledgeList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors',
            activeSubTab === 'analytics'
              ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30'
              : 'text-slate-400 hover:text-slate-200',
          )}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Telemetry & Agents (Figure 14.2)</span>
        </button>
      </div>

      {/* SUB-TAB 1: Settings Form matching Figure 14.1 */}
      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-6 rounded-2xl glass-panel space-y-5">
            {/* Agent Profile & Identity */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                Agent Profile & Identity
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Agent Name</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department / Role</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-fuchsia-500"
                />
              </div>
            </div>

            {/* System Prompt & Instructions */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white">System Prompt & Core Instructions</h3>
                <button
                  type="button"
                  onClick={() =>
                    setSystemPrompt(
                      'You are the luxury hospitality AI concierge for OmniStay 360. Answer guest questions accurately in their language, recommend suites, and handle in-chat booking.'
                    )
                  }
                  className="text-[11px] text-fuchsia-400 hover:underline font-semibold"
                >
                  Load Starter Prompt
                </button>
              </div>

              <textarea
                rows={6}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono text-xs focus:outline-none focus:border-fuchsia-500 leading-relaxed"
              ></textarea>
            </div>
          </div>

          {/* Model & Context Window Controls matching Figure 14.1 */}
          <div className="lg:col-span-4 p-6 rounded-2xl glass-panel space-y-5">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              Model & Context Window
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">AI Provider</label>
                <select
                  value={modelProvider}
                  onChange={(e) => setModelProvider(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-fuchsia-500"
                >
                  <option value="OpenAI">OpenAI</option>
                  <option value="Anthropic">Anthropic Claude</option>
                  <option value="Google">Google Gemini</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Model Name</label>
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-fuchsia-500"
                >
                  <option value="gpt-4o-mini">gpt-4o-mini (Recommended)</option>
                  <option value="gpt-4o">gpt-4o (High Reasoning)</option>
                  <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>Temperature</span>
                  <span className="font-mono text-fuchsia-400">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-fuchsia-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-200">Published Live</p>
                  <p className="text-[10px] text-slate-400">Available across Web & WhatsApp</p>
                </div>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 accent-fuchsia-500 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Knowledge Base Document Ingestion */}
      {activeSubTab === 'knowledge' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-5 rounded-2xl glass-panel space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              Ingest Document into RAG Vector Index
            </h3>

            <form onSubmit={handleAddKnowledge} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Resort Check-In & Breakfast Policy"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-fuchsia-500"
                >
                  <option value="property_info">Property Information & Location</option>
                  <option value="amenities">Amenities & Facilities</option>
                  <option value="policies">Stay Policies & Fees</option>
                  <option value="dining_menu">Dining & Room Service Menu</option>
                  <option value="local_attractions">Local Attractions & Tours</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Document Content / Knowledge Text</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste knowledge details for RAG semantic search..."
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-fuchsia-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={addingDoc}
                className="w-full py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs shadow-md shadow-fuchsia-600/30"
              >
                {addingDoc ? 'Indexing in Vector DB...' : '+ Ingest Document (POST /knowledge)'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 rounded-2xl glass-panel overflow-hidden border border-slate-800">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Indexed RAG Knowledge Documents ({knowledgeList.length})
              </span>
            </div>

            <div className="p-4 space-y-3">
              {knowledgeList.length > 0 ? (
                knowledgeList.map((doc, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100">{doc.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 font-mono">
                        {doc.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{doc.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No knowledge documents indexed yet. Ingest your first document to power the RAG Concierge.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Configured Agents Table matching Figure 14.2 */}
      {activeSubTab === 'analytics' && (
        <div className="rounded-2xl glass-panel overflow-hidden border border-slate-800">
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Configured Agents Directory (Figure 14.2)
            </span>
          </div>

          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Agent Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Model & Tone</th>
                <th className="py-3 px-4">Conversations</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-900/50">
                <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center font-bold">
                    S
                  </div>
                  <span>{agentName}</span>
                </td>
                <td className="py-3.5 px-4 text-slate-400">{department}</td>
                <td className="py-3.5 px-4 font-mono text-sky-400">{modelName} • Friendly</td>
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">142 Active</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Published Live
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => setActiveSubTab('settings')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold"
                  >
                    Edit Config
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
