'use client';
import { BeatLoader } from 'react-spinners';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sliders,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  Code,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Sparkles,
  Star,
  FileText,
  Mail,
  Phone,
  Calendar,
  Hash,
  Upload,
  CheckSquare,
  ListFilter,
  Layers,
  Inbox,
  Clock,
  Send,
  Loader2,
  X,
} from 'lucide-react';
import { getPublicWebUrl } from '@/config/site.config';
import { showAlert } from '@/lib/sweetalert';
import { api } from '@/lib/api/client';

interface FormFieldItem {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'phone' | 'date' | 'number' | 'select' | 'checkbox' | 'rating' | 'file';
  required: boolean;
  placeholder?: string;
  options?: string[];
  helpText?: string;
}

interface FormBuilderData {
  id?: string;
  tenantId?: string;
  formName: string;
  isActive: boolean;
  formSchema: {
    title: string;
    description: string;
    fields: FormFieldItem[];
  };
  _count?: {
    responses: number;
  };
}

const FIELD_TYPE_OPTIONS = [
  { type: 'text', label: 'Short Text', icon: FileText, desc: 'Single-line text input' },
  { type: 'textarea', label: 'Paragraph / Notes', icon: FileText, desc: 'Multi-line detailed text' },
  { type: 'email', label: 'Email Address', icon: Mail, desc: 'Validates email format' },
  { type: 'phone', label: 'Phone Number', icon: Phone, desc: 'Direct dial / WhatsApp' },
  { type: 'date', label: 'Date Picker', icon: Calendar, desc: 'Calendar date selection' },
  { type: 'number', label: 'PAX / Number', icon: Hash, desc: 'Numeric counters & quantities' },
  { type: 'select', label: 'Dropdown Menu', icon: ListFilter, desc: 'Single select from options' },
  { type: 'checkbox', label: 'Checkboxes', icon: CheckSquare, desc: 'Multiple option selection' },
  { type: 'rating', label: 'Star Rating (1-5)', icon: Star, desc: 'Five-star satisfaction score' },
  { type: 'file', label: 'Document / File', icon: Upload, desc: 'PDF, ID scan, or photo upload' },
] as const;

export default function FormBuilderPage() {
  const [forms, setForms] = useState<FormBuilderData[]>([]);
  const [selectedFormIndex, setSelectedFormIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Live test submission state
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  // Active form working state
  const currentForm = forms[selectedFormIndex] || null;

  const fetchForms = async () => {
    try {
      setLoading(true);
      const data = await api.get<FormBuilderData[]>('/api/v1/crm/forms');
      if (Array.isArray(data)) {
        setForms(data);
      }
    } catch (err) {
      console.error('Failed to fetch forms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleUpdateCurrentForm = (updater: (prev: FormBuilderData) => FormBuilderData) => {
    setForms((prev) => {
      const copy = [...prev];
      if (copy[selectedFormIndex]) {
        copy[selectedFormIndex] = updater(copy[selectedFormIndex]);
      }
      return copy;
    });
  };

  const handleAddField = (type: FormFieldItem['type']) => {
    if (!currentForm) return;
    const fieldCount = (currentForm.formSchema.fields || []).length + 1;
    const newField: FormFieldItem = {
      id: `f-${Date.now()}`,
      name: `field_${fieldCount}`,
      label: `New ${type.toUpperCase()} Question`,
      type,
      required: false,
      placeholder: `Enter your answer...`,
      options: type === 'select' || type === 'checkbox' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
    };

    handleUpdateCurrentForm((prev) => ({
      ...prev,
      formSchema: {
        ...prev.formSchema,
        fields: [...(prev.formSchema.fields || []), newField],
      },
    }));
  };

  const handleRemoveField = (id: string) => {
    handleUpdateCurrentForm((prev) => ({
      ...prev,
      formSchema: {
        ...prev.formSchema,
        fields: prev.formSchema.fields.filter((f) => f.id !== id),
      },
    }));
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if (!currentForm) return;
    const fields = [...currentForm.formSchema.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    const [moved] = fields.splice(index, 1);
    fields.splice(targetIndex, 0, moved);

    handleUpdateCurrentForm((prev) => ({
      ...prev,
      formSchema: {
        ...prev.formSchema,
        fields,
      },
    }));
  };

  const handleFieldChange = (id: string, updates: Partial<FormFieldItem>) => {
    handleUpdateCurrentForm((prev) => ({
      ...prev,
      formSchema: {
        ...prev.formSchema,
        fields: prev.formSchema.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
      },
    }));
  };

  const handleSaveForm = async () => {
    if (!currentForm) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (currentForm.id) {
        await api.put(`/api/v1/crm/forms/${currentForm.id}`, {
          formName: currentForm.formName,
          formSchema: currentForm.formSchema,
          isActive: currentForm.isActive,
        });
      } else {
        await api.post(`/api/v1/crm/forms`, {
          formName: currentForm.formName,
          formSchema: currentForm.formSchema,
          isActive: currentForm.isActive,
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      await fetchForms();
    } catch (err) {
      console.error('Failed to save form:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenSubmissions = async () => {
    if (!currentForm?.id) return;
    setSubmissionsModalOpen(true);
    setSubmissionsLoading(true);

    try {
      const data = await api.get<any[]>(`/api/v1/crm/forms/${currentForm.id}/responses`);
      if (Array.isArray(data)) {
        setSubmissions(data);
      }
    } catch (err) {
      console.error('Failed to fetch responses:', err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentForm?.id) return;

    setTestSubmitting(true);
    setTestSuccessMessage(null);

    try {
      await api.post(`/api/v1/crm/forms/${currentForm.id}/submit`, {
        formData: previewValues,
        submitterIp: '127.0.0.1 (Admin Preview Test)',
      });

      setTestSuccessMessage('Test submission successfully recorded in database! Automatically ingested into CRM Banquet Pipeline.');
      setPreviewValues({});
      setTimeout(() => setTestSuccessMessage(null), 6000);
      await fetchForms();
    } catch (err) {
      console.error('Test submission failed:', err);
    } finally {
      setTestSubmitting(false);
    }
  };

  const handleCreateNewBlankForm = () => {
    const newBlankForm: FormBuilderData = {
      formName: 'Custom Guest Request Form',
      isActive: true,
      formSchema: {
        title: 'Custom Guest Request Form',
        description: 'Please complete the details below and our team will get in touch immediately.',
        fields: [
          { id: 'f-1', name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. John Doe' },
          { id: 'f-2', name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'john@example.com' },
          { id: 'f-3', name: 'phone', label: 'Phone Number', type: 'phone', required: false, placeholder: '+1 555-0100' },
          { id: 'f-4', name: 'notes', label: 'Message / Special Requests', type: 'textarea', required: false, placeholder: 'Enter details...' },
        ],
      },
    };

    setForms((prev) => [newBlankForm, ...prev]);
    setSelectedFormIndex(0);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/dashboard" className="text-[#00a8ff] font-semibold hover:underline">
          # Dashboard
        </Link>
        <span>/</span>
        <Link href="/crm" className="text-slate-600 hover:underline">
          CRM & Banquet Sales
        </Link>
        <span>/</span>
        <span className="text-slate-500 font-medium">Drag-and-Drop Form Builder (Chapter 11.4)</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#00a8ff]" /> Visual Drag-and-Drop Form Builder (Chapter 11.4)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build zero-code web forms for Weddings, Spa Intake, Post-Stay Feedback, and MICE Events with automatic CRM Lead conversion.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCreateNewBlankForm}
            className="h-9 px-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            <span>New Custom Form</span>
          </button>

          <button
            onClick={() => setEmbedModalOpen(true)}
            className="h-9 px-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Code className="w-3.5 h-3.5 text-emerald-600" />
            <span>Get Embed Code</span>
          </button>

          <button
            onClick={handleOpenSubmissions}
            className="h-9 px-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Inbox className="w-3.5 h-3.5 text-blue-600" />
            <span>View Submissions ({currentForm?._count?.responses || 0})</span>
          </button>

          <button
            onClick={handleSaveForm}
            disabled={isSaving}
            className="h-9 px-5 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Form Schema</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Form schema saved and deployed live to public endpoints!</span>
        </div>
      )}

      {/* Form Selector Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Form Template:</span>
          {loading ? (
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading forms...
            </div>
          ) : (
            <select
              value={selectedFormIndex}
              onChange={(e) => setSelectedFormIndex(Number(e.target.value))}
              className="h-8 px-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00a8ff]"
            >
              {forms.map((f, idx) => (
                <option key={f.id || idx} value={idx}>
                  {f.formName} ({f.formSchema?.fields?.length || 0} fields)
                </option>
              ))}
            </select>
          )}
        </div>

        {currentForm && (
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={currentForm.isActive}
                onChange={(e) => handleUpdateCurrentForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="rounded text-[#00a8ff]"
              />
              <span>Published & Accepting Submissions</span>
            </label>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-mono text-[11px]">ID: {currentForm.id || 'New Draft'}</span>
          </div>
        )}
      </div>

      {/* 2-Column Visual Builder Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Form Meta, Field Toolbox & Configurator */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: Form Properties */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <FileText className="w-3.5 h-3.5 text-blue-600" /> Form Properties & Heading
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Internal Form Name</label>
                <input
                  type="text"
                  value={currentForm?.formName || ''}
                  onChange={(e) => handleUpdateCurrentForm((prev) => ({ ...prev, formName: e.target.value }))}
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-slate-800 font-medium focus:outline-none focus:border-[#00a8ff]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Public Display Title</label>
                <input
                  type="text"
                  value={currentForm?.formSchema?.title || ''}
                  onChange={(e) =>
                    handleUpdateCurrentForm((prev) => ({
                      ...prev,
                      formSchema: { ...prev.formSchema, title: e.target.value },
                    }))
                  }
                  className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded text-slate-800 font-semibold focus:outline-none focus:border-[#00a8ff]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Header Subtitle / Instructions</label>
                <textarea
                  rows={2}
                  value={currentForm?.formSchema?.description || ''}
                  onChange={(e) =>
                    handleUpdateCurrentForm((prev) => ({
                      ...prev,
                      formSchema: { ...prev.formSchema, description: e.target.value },
                    }))
                  }
                  className="w-full p-2 bg-white border border-slate-200 rounded text-slate-700 text-xs focus:outline-none focus:border-[#00a8ff]"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Field Toolbox (Click or Drag to Add) */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Click to Insert Field Component
              </h3>
              <span className="text-[10px] text-slate-400">10 Input Types</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {FIELD_TYPE_OPTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => handleAddField(item.type)}
                    className="flex items-start gap-2 p-2 rounded border border-slate-200 hover:border-[#00a8ff] hover:bg-blue-50/50 text-left transition-colors cursor-pointer group"
                  >
                    <Icon className="w-4 h-4 text-slate-500 group-hover:text-[#00a8ff] mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-xs font-semibold text-slate-800 group-hover:text-[#00a8ff]">
                        {item.label}
                      </span>
                      <span className="block text-[10px] text-slate-400 line-clamp-1">{item.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Form Fields Reorder & Config List */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" /> Active Canvas Fields ({currentForm?.formSchema?.fields?.length || 0})
              </h3>
              <span className="text-[10px] text-slate-400">Reorder with ▲ ▼</span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {currentForm?.formSchema?.fields?.map((field, idx) => (
                <div
                  key={field.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2 text-xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <span className="uppercase text-[10px] font-bold text-[#00a8ff]">{field.type}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveField(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveField(idx, 'down')}
                        disabled={idx === (currentForm.formSchema.fields.length - 1)}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveField(field.id)}
                        className="p-1 text-rose-400 hover:text-rose-600 cursor-pointer ml-1"
                        title="Delete Field"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Field Question / Label</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => handleFieldChange(field.id, { label: e.target.value })}
                      className="w-full h-7 px-2 bg-white border border-slate-200 rounded text-xs text-slate-800 font-medium focus:outline-none focus:border-[#00a8ff]"
                    />
                  </div>

                  {(field.type === 'select' || field.type === 'checkbox') && (
                    <div>
                      <label className="block text-[11px] text-slate-500 font-medium mb-0.5">
                        Options (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={(field.options || []).join(', ')}
                        onChange={(e) =>
                          handleFieldChange(field.id, {
                            options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        className="w-full h-7 px-2 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-[#00a8ff]"
                        placeholder="Option 1, Option 2, Option 3"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <label className="flex items-center gap-1.5 text-slate-600 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => handleFieldChange(field.id, { required: e.target.checked })}
                        className="rounded text-[#00a8ff]"
                      />
                      <span>Mandatory Field</span>
                    </label>

                    <input
                      type="text"
                      placeholder="Placeholder hint..."
                      value={field.placeholder || ''}
                      onChange={(e) => handleFieldChange(field.id, { placeholder: e.target.value })}
                      className="h-6 px-2 bg-white border border-slate-200 rounded text-[11px] text-slate-600 w-44"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Form Canvas Preview & Interactive Test Submission */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            {/* Browser Window Chrome */}
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                <span className="text-xs text-slate-500 font-mono ml-2">Live Public Web Canvas Preview</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Direct REST Ingestion Ready
              </span>
            </div>

            {/* Form Canvas Inner */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#00a8ff]">
                  OmniStay Hospitality Experience
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {currentForm?.formSchema?.title || 'Custom Web Form'}
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {currentForm?.formSchema?.description || 'Please provide your details below.'}
                </p>
              </div>

              {testSuccessMessage && (
                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{testSuccessMessage}</span>
                </div>
              )}

              {/* Form Input Elements */}
              <form onSubmit={handleTestSubmit} className="space-y-4">
                {currentForm?.formSchema?.fields?.map((field) => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-800">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>

                    {field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        required={field.required}
                        placeholder={field.placeholder || 'Enter your response...'}
                        value={previewValues[field.name || field.id] || ''}
                        onChange={(e) =>
                          setPreviewValues({ ...previewValues, [field.name || field.id]: e.target.value })
                        }
                        className="w-full p-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#00a8ff] transition-colors"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        required={field.required}
                        value={previewValues[field.name || field.id] || ''}
                        onChange={(e) =>
                          setPreviewValues({ ...previewValues, [field.name || field.id]: e.target.value })
                        }
                        className="w-full h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#00a8ff]"
                      >
                        <option value="">-- Select an option --</option>
                        {(field.options || []).map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {(field.options || []).map((opt, i) => (
                          <label
                            key={i}
                            className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700 cursor-pointer hover:bg-slate-100"
                          >
                            <input
                              type="checkbox"
                              name={field.name || field.id}
                              value={opt}
                              onChange={(e) => {
                                const currentList = (previewValues[field.name || field.id] as string[]) || [];
                                if (e.target.checked) {
                                  setPreviewValues({
                                    ...previewValues,
                                    [field.name || field.id]: [...currentList, opt],
                                  });
                                } else {
                                  setPreviewValues({
                                    ...previewValues,
                                    [field.name || field.id]: currentList.filter((x) => x !== opt),
                                  });
                                }
                              }}
                              className="rounded text-[#00a8ff]"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === 'rating' ? (
                      <div className="flex items-center gap-2 py-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const currentStar = previewValues[field.name || field.id] || 0;
                          return (
                            <button
                              type="button"
                              key={star}
                              onClick={() =>
                                setPreviewValues({ ...previewValues, [field.name || field.id]: star })
                              }
                              className="p-1 cursor-pointer transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= currentStar
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-300 hover:text-amber-200'
                                }`}
                              />
                            </button>
                          );
                        })}
                        <span className="text-xs font-semibold text-slate-500 ml-2">
                          {previewValues[field.name || field.id]
                            ? `${previewValues[field.name || field.id]} / 5 Stars`
                            : 'Select rating'}
                        </span>
                      </div>
                    ) : field.type === 'file' ? (
                      <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                        <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                        <span className="text-xs font-medium text-slate-600 block">Click to upload document or image</span>
                        <span className="text-[10px] text-slate-400">PDF, JPG, PNG up to 10MB</span>
                      </div>
                    ) : (
                      <input
                        type={field.type === 'phone' ? 'tel' : field.type}
                        required={field.required}
                        placeholder={field.placeholder || `Enter ${field.label}...`}
                        value={previewValues[field.name || field.id] || ''}
                        onChange={(e) =>
                          setPreviewValues({ ...previewValues, [field.name || field.id]: e.target.value })
                        }
                        className="w-full h-9 px-3 text-xs bg-slate-50/70 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-[#00a8ff] transition-colors"
                      />
                    )}
                  </div>
                ))}

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">
                    🔒 SSL Encrypted • Direct CRM Lead Ingestion
                  </span>

                  <button
                    type="submit"
                    disabled={testSubmitting}
                    className="w-full sm:w-auto h-9 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    {testSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Submit Test Inquiry (REST)</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Embed Code Modal */}
      {embedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Deploy Public Embed Code</h3>
              </div>
              <button onClick={() => setEmbedModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600">
                Copy and paste this code into your luxury website, WordPress, Webflow, or custom landing page:
              </p>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Responsive Iframe Widget:</span>
                <div className="relative bg-slate-900 text-emerald-400 p-3 rounded font-mono text-[11px] overflow-x-auto">
                  {`<iframe src="${getPublicWebUrl(`/forms/${currentForm?.id || 'demo'}`)}" width="100%" height="700" frameborder="0"></iframe>`}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Direct Shareable Link:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getPublicWebUrl(`/forms/${currentForm?.id || 'demo'}`)}
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded font-mono text-[11px]"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getPublicWebUrl(`/forms/${currentForm?.id || 'demo'}`));
                      showAlert({ title: 'Copied!', text: 'Form share link copied to clipboard.', icon: 'success' });
                    }}
                    className="h-8 px-3 bg-slate-800 text-white rounded font-medium hover:bg-slate-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setEmbedModalOpen(false)}
                className="h-8 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {submissionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Recorded Inquiries & Submissions — {currentForm?.formName}
                </h3>
              </div>
              <button onClick={() => setSubmissionsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {submissionsLoading ? (
                <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Loading submissions from PostgreSQL...
                </div>
              ) : submissions.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No submissions recorded for this form yet. Use &quot;Submit Test Inquiry&quot; on the canvas to simulate a guest response.
                </div>
              ) : (
                submissions.map((sub, idx) => (
                  <div key={sub.id || idx} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                          #{idx + 1}
                        </span>
                        <span>Submission ID: {sub.id}</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(sub.submittedAt).toLocaleString()} • IP: {sub.submitterIp || 'Direct'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      {Object.entries(sub.formData || {}).map(([key, val]: [string, any]) => (
                        <div key={key} className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-slate-400 font-semibold block">{key}</span>
                          <span className="font-medium text-slate-800">
                            {Array.isArray(val) ? val.join(', ') : String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSubmissionsModalOpen(false)}
                className="h-8 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

