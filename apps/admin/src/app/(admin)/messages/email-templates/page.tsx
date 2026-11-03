'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail,
  Plus,
  Trash2,
  Eye,
  Send,
  Save,
  CheckCircle2,
  Copy,
  Sparkles,
  Smartphone,
  Monitor,
  Code,
  Palette,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
  Loader2,
  X,
  Tag,
  Check,
} from 'lucide-react';

interface EmailTemplateItem {
  id: string;
  name: string;
  subject: string;
  htmlBody: string;
  mergeTags: string[];
  createdAt?: string;
  updatedAt?: string;
}

const AVAILABLE_MERGE_TAGS = [
  { tag: '{guest_name}', label: 'Guest Name', desc: 'e.g. David Vance' },
  { tag: '{property_name}', label: 'Property Name', desc: 'e.g. Grand Palace Resort' },
  { tag: '{booking_reference}', label: 'Booking Code', desc: 'e.g. OST-98234' },
  { tag: '{check_in_date}', label: 'Check-In Date', desc: 'e.g. Nov 15, 2026' },
  { tag: '{check_out_date}', label: 'Check-Out Date', desc: 'e.g. Nov 20, 2026' },
  { tag: '{room_type}', label: 'Room / Suite', desc: 'e.g. Oceanfront Penthouse' },
  { tag: '{total_amount}', label: 'Total Paid', desc: 'e.g. $1,850.00' },
  { tag: '{qr_code_url}', label: 'Digital Key URL', desc: 'e.g. https://omnistay.com/key/xyz' },
];

export default function EmailTemplateBuilderPage() {
  const [templates, setTemplates] = useState<EmailTemplateItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'sequences'>('editor');

  // Test dispatch modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState('guest.vip@example.com');
  const [testSending, setTestSending] = useState(false);
  const [testSuccessNotice, setTestSuccessNotice] = useState<string | null>(null);

  // Property brand colors for email styler
  const [brandPrimary, setBrandPrimary] = useState('#00a8ff');
  const [brandHeaderBg, setBrandHeaderBg] = useState('#0f172a');

  const currentTemplate = templates[selectedIdx] || null;

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:4000/api/v1/communications/email/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error('Failed to load email templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleUpdateCurrent = (field: keyof EmailTemplateItem, value: any) => {
    setTemplates((prev) => {
      const copy = [...prev];
      if (copy[selectedIdx]) {
        copy[selectedIdx] = { ...copy[selectedIdx], [field]: value };
      }
      return copy;
    });
  };

  const handleInsertTag = (tag: string, target: 'subject' | 'body') => {
    if (!currentTemplate) return;
    if (target === 'subject') {
      handleUpdateCurrent('subject', `${currentTemplate.subject} ${tag}`);
    } else {
      handleUpdateCurrent('htmlBody', `${currentTemplate.htmlBody} ${tag}`);
    }
  };

  const handleSave = async () => {
    if (!currentTemplate) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      let res;
      if (currentTemplate.id) {
        res = await fetch(`http://localhost:4000/api/v1/communications/email/templates/${currentTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: currentTemplate.name,
            subject: currentTemplate.subject,
            htmlBody: currentTemplate.htmlBody,
            mergeTags: currentTemplate.mergeTags,
          }),
        });
      } else {
        res = await fetch('http://localhost:4000/api/v1/communications/email/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: currentTemplate.name,
            subject: currentTemplate.subject,
            htmlBody: currentTemplate.htmlBody,
            mergeTags: currentTemplate.mergeTags,
          }),
        });
      }

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
        await fetchTemplates();
      }
    } catch (err) {
      console.error('Failed to save email template:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTemplate) return;
    setTestSending(true);
    setTestSuccessNotice(null);

    try {
      const renderedHtml = renderPreviewHtml(currentTemplate.htmlBody);
      const renderedSubject = renderPreviewSubject(currentTemplate.subject);

      const res = await fetch('http://localhost:4000/api/v1/communications/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: testRecipient,
          subject: renderedSubject,
          htmlBody: renderedHtml,
          provider: 'sendgrid_hotel_cluster_1',
        }),
      });

      if (res.ok) {
        setTestSuccessNotice(`Test email successfully delivered to ${testRecipient}! Logged in Omnichannel Delivery Audit.`);
        setTimeout(() => setTestSuccessNotice(null), 5000);
      }
    } catch (err) {
      console.error('Test email failed:', err);
    } finally {
      setTestSending(false);
    }
  };

  const renderPreviewSubject = (text: string) => {
    return text
      .replace(/{guest_name}/g, 'David Vance')
      .replace(/{property_name}/g, 'Grand Palace Luxury Resort & Spa')
      .replace(/{booking_reference}/g, 'OST-84920')
      .replace(/{check_in_date}/g, 'Nov 15, 2026')
      .replace(/{check_out_date}/g, 'Nov 20, 2026')
      .replace(/{room_type}/g, 'Presidential Oceanfront Penthouse')
      .replace(/{total_amount}/g, '$1,850.00')
      .replace(/{qr_code_url}/g, 'https://omnistay.com/guest/key/pass-84920');
  };

  const renderPreviewHtml = (html: string) => {
    return renderPreviewSubject(html);
  };

  const handleCreateNewTemplate = () => {
    const newTemplate: EmailTemplateItem = {
      id: '',
      name: 'Custom Promotional VIP Campaign',
      subject: 'Special Hospitality Offer for {guest_name} at {property_name}',
      mergeTags: ['{guest_name}', '{property_name}'],
      htmlBody: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <div style="background: #0f172a; padding: 28px; text-align: center; color: #ffffff;">
    <h1 style="margin: 0; font-size: 22px;">{property_name}</h1>
  </div>
  <div style="padding: 30px;">
    <h2>Exclusive Invitation for {guest_name}</h2>
    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
      As one of our most valued guests, enjoy complimentary upgrades and dining credits on your next stay.
    </p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="https://omnistay.com" style="background: #00a8ff; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
        Claim Exclusive Privilege
      </a>
    </div>
  </div>
</div>`,
    };

    setTemplates((prev) => [newTemplate, ...prev]);
    setSelectedIdx(0);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/dashboard" className="text-[#00a8ff] font-semibold hover:underline">
          # Dashboard
        </Link>
        <span>/</span>
        <Link href="/messages" className="text-slate-600 hover:underline">
          Omnichannel Communications
        </Link>
        <span>/</span>
        <span className="text-slate-500 font-medium">Dynamic Email Template Builder (Chapter 17.4)</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-[#00a8ff]" /> Dynamic HTML Email Template Builder (Chapter 17.4)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual drag-and-drop email styler, property branding, dynamic merge tags, and automated guest lifecycle sequences.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCreateNewTemplate}
            className="h-9 px-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            <span>New Template</span>
          </button>

          <button
            onClick={() => setTestModalOpen(true)}
            className="h-9 px-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Send className="w-3.5 h-3.5 text-blue-600" />
            <span>Send Test Email</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 px-5 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Template</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Email template successfully updated in database and ready for automated dispatch!</span>
        </div>
      )}

      {/* Template Chooser & Mode Tabs */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Template:</span>
          {loading ? (
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading templates...
            </div>
          ) : (
            <select
              value={selectedIdx}
              onChange={(e) => setSelectedIdx(Number(e.target.value))}
              className="h-8 px-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00a8ff]"
            >
              {templates.map((t, idx) => (
                <option key={t.id || idx} value={idx}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'editor' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visual & Code Editor
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'preview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Responsive Preview
          </button>
          <button
            onClick={() => setActiveTab('sequences')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
              activeTab === 'sequences' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lifecycle Sequences (17.4)
          </button>
        </div>
      </div>

      {/* TAB 1: VISUAL & CODE EDITOR */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Form Info, Dynamic Tags, Style Controls */}
          <div className="lg:col-span-5 space-y-4">
            {/* Template Info Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Mail className="w-3.5 h-3.5 text-blue-600" /> Template Meta & Subject Line
              </h3>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Internal Template Name</label>
                  <input
                    type="text"
                    value={currentTemplate?.name || ''}
                    onChange={(e) => handleUpdateCurrent('name', e.target.value)}
                    className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-slate-800 font-medium focus:outline-none focus:border-[#00a8ff]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-600 font-medium">Email Subject Line</label>
                    <span className="text-[10px] text-slate-400">Supports merge tags</span>
                  </div>
                  <input
                    type="text"
                    value={currentTemplate?.subject || ''}
                    onChange={(e) => handleUpdateCurrent('subject', e.target.value)}
                    className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-slate-800 font-semibold focus:outline-none focus:border-[#00a8ff]"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Merge Tags Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" /> Dynamic Merge Tags (1-Click Inject)
                </h3>
                <span className="text-[10px] text-slate-400">Click to append</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_MERGE_TAGS.map((mt) => (
                  <div
                    key={mt.tag}
                    className="p-2 rounded border border-slate-200 bg-slate-50/70 hover:bg-slate-100 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <span className="block text-[11px] font-bold text-slate-800">{mt.label}</span>
                      <span className="block text-[10px] font-mono text-[#00a8ff]">{mt.tag}</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60 mt-1.5">
                      <button
                        onClick={() => handleInsertTag(mt.tag, 'subject')}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-slate-300 hover:bg-blue-50 text-slate-700 font-medium cursor-pointer"
                        title="Add to subject"
                      >
                        + Subject
                      </button>
                      <button
                        onClick={() => handleInsertTag(mt.tag, 'body')}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-[#00a8ff] hover:bg-[#0097e6] text-white font-medium cursor-pointer"
                        title="Add to body"
                      >
                        + Body
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Property Branding & Color Styler */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Palette className="w-3.5 h-3.5 text-amber-500" /> Property Brand Styling
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Header Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandHeaderBg}
                      onChange={(e) => setBrandHeaderBg(e.target.value)}
                      className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={brandHeaderBg}
                      onChange={(e) => setBrandHeaderBg(e.target.value)}
                      className="w-full h-7 px-2 font-mono text-xs bg-white border border-slate-200 rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Primary CTA Button</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandPrimary}
                      onChange={(e) => setBrandPrimary(e.target.value)}
                      className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={brandPrimary}
                      onChange={(e) => setBrandPrimary(e.target.value)}
                      className="w-full h-7 px-2 font-mono text-xs bg-white border border-slate-200 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Raw HTML Styler Code Editor */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
              <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-semibold">HTML Email Styler Canvas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {currentTemplate?.htmlBody?.length || 0} chars
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentTemplate?.htmlBody || '');
                      alert('HTML copied to clipboard!');
                    }}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    title="Copy HTML"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <textarea
                rows={22}
                value={currentTemplate?.htmlBody || ''}
                onChange={(e) => handleUpdateCurrent('htmlBody', e.target.value)}
                className="w-full p-4 font-mono text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none leading-relaxed resize-y border-none"
                placeholder="Enter responsive HTML template code with inline CSS..."
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE RESPONSIVE PREVIEW */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-900">Simulated Subject: </span>
              <span className="italic">{renderPreviewSubject(currentTemplate?.subject || '')}</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Desktop Preview"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Mobile Preview (375px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-center p-6 bg-slate-100 rounded-lg border border-slate-200 min-h-[550px]">
            <div
              className={`transition-all duration-300 bg-white rounded-lg shadow-md overflow-hidden ${
                previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-[650px]'
              }`}
            >
              {/* Simulated Email Client Header */}
              <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Grand Palace Resort Concierge</span>
                  <span className="text-[11px] text-slate-400">Just now</span>
                </div>
                <div className="text-[11px] text-slate-500">To: David Vance &lt;guest.vip@example.com&gt;</div>
                <div className="font-semibold text-slate-800 pt-0.5">
                  Subject: {renderPreviewSubject(currentTemplate?.subject || '')}
                </div>
              </div>

              {/* Rendered HTML */}
              <div
                className="p-4"
                dangerouslySetInnerHTML={{ __html: renderPreviewHtml(currentTemplate?.htmlBody || '') }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MARKETING AUTOMATION SEQUENCES (Chapter 17.4) */}
      {activeTab === 'sequences' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" /> Automated Guest Lifecycle Triggers (Chapter 17.4)
            </h3>
            <p className="text-xs text-slate-500">
              OmniStay message workers listen to booking lifecycle events and dispatch these branded templates automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                seq: 'Sequence 1',
                title: 'Instant Confirmation',
                timing: 'Trigger: Immediately after booking confirmation',
                templateName: 'Welcome & Instant Booking Confirmation (17.4)',
                status: 'Active Automation',
                accent: 'border-l-blue-500',
              },
              {
                seq: 'Sequence 2',
                title: 'Pre-Arrival Concierge',
                timing: 'Trigger: T-minus 7 Days before check-in (9:00 AM)',
                templateName: '7-Day Pre-Arrival Concierge & Upsell (17.4)',
                status: 'Active Automation',
                accent: 'border-l-indigo-500',
              },
              {
                seq: 'Sequence 3',
                title: 'Digital Key Ready',
                timing: 'Trigger: 24 Hours before arrival upon room assignment',
                templateName: '24-Hour Digital Key & Express Check-In (17.4)',
                status: 'Active Automation',
                accent: 'border-l-emerald-500',
              },
              {
                seq: 'Sequence 4',
                title: 'Post-Departure CSAT',
                timing: 'Trigger: 24 Hours after front-desk check-out',
                templateName: 'Post-Stay Departure Review & Loyalty CSAT (17.4)',
                status: 'Active Automation',
                accent: 'border-l-amber-500',
              },
            ].map((s, idx) => (
              <div
                key={idx}
                className={`p-4 bg-white rounded-lg border border-slate-200 border-l-4 ${s.accent} shadow-2xs space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.seq}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {s.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{s.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.timing}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                  <span className="font-semibold block text-slate-400 text-[10px]">Assigned Template:</span>
                  <span className="font-medium text-slate-800 line-clamp-1">{s.templateName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Dispatch Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Send Live Test Email</h3>
              </div>
              <button onClick={() => setTestModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendTestEmail} className="p-5 space-y-4 text-xs">
              {testSuccessNotice && (
                <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{testSuccessNotice}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Recipient Test Email</label>
                <input
                  type="email"
                  required
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1 text-[11px] text-slate-600">
                <span className="font-bold text-slate-700 block">Simulated Merge Tag Values:</span>
                <div>Guest: <strong>David Vance</strong></div>
                <div>Property: <strong>Grand Palace Luxury Resort & Spa</strong></div>
                <div>Code: <strong>OST-84920</strong></div>
                <div>Dates: <strong>Nov 15 - Nov 20, 2026</strong></div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  className="h-8 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={testSending}
                  className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {testSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Dispatch Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

