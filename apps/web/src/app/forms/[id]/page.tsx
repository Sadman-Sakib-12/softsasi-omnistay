'use client';

import React, { useState, useEffect, use } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertCircle,
  Star,
  FileText,
  Mail,
  Phone,
  Calendar,
  Hash,
  Upload,
  CheckSquare,
  Send,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

interface FormFieldItem {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'phone' | 'date' | 'number' | 'select' | 'checkbox' | 'rating' | 'file';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface FormDataPayload {
  id: string;
  formName: string;
  isActive: boolean;
  formSchema: {
    title: string;
    description: string;
    fields: FormFieldItem[];
  };
}

export default function PublicFormSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const formId = resolvedParams.id;

  const [form, setForm] = useState<FormDataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchForm() {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:4000/api/v1/crm/forms/${formId}`);
        if (!res.ok) {
          throw new Error('Form not found or has been deactivated.');
        }
        const data = await res.json();
        setForm(data);
      } catch (err: any) {
        setError(err.message || 'Unable to load form');
      } finally {
        setLoading(false);
      }
    }
    fetchForm();
  }, [formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:4000/api/v1/crm/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: formValues,
          submitterIp: 'Public Web Guest',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to record submission. Please check your answers and try again.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6 text-slate-500 text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-[#00a8ff] mr-2" />
        <span>Loading secure form...</span>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 bg-white border border-rose-200 rounded-xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Form Unavailable</h2>
        <p className="text-xs text-slate-600">{error || 'This form does not exist.'}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-emerald-200 rounded-2xl shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Inquiry Received Successfully!</h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
          Thank you for providing your details. Our executive team has logged your request and will contact you promptly.
        </p>
        <div className="pt-2">
          <button
            onClick={() => {
              setSubmitted(false);
              setFormValues({});
            }}
            className="text-xs font-semibold text-[#00a8ff] hover:underline cursor-pointer"
          >
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div className="border-b border-slate-100 pb-5 mb-6">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#00a8ff]">
          OmniStay Hospitality Inquiry
        </span>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          {form.formSchema?.title || form.formName}
        </h1>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          {form.formSchema?.description || 'Please complete the requested information below.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {form.formSchema?.fields?.map((field) => (
          <div key={field.id} className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              {field.label} {field.required && <span className="text-rose-500">*</span>}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                rows={3}
                required={field.required}
                placeholder={field.placeholder || 'Enter your message...'}
                value={formValues[field.name || field.id] || ''}
                onChange={(e) => setFormValues({ ...formValues, [field.name || field.id]: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#00a8ff] transition-colors"
              />
            ) : field.type === 'select' ? (
              <select
                required={field.required}
                value={formValues[field.name || field.id] || ''}
                onChange={(e) => setFormValues({ ...formValues, [field.name || field.id]: e.target.value })}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#00a8ff]"
              >
                <option value="">-- Please select an option --</option>
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
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      name={field.name || field.id}
                      value={opt}
                      onChange={(e) => {
                        const currentList = (formValues[field.name || field.id] as string[]) || [];
                        if (e.target.checked) {
                          setFormValues({ ...formValues, [field.name || field.id]: [...currentList, opt] });
                        } else {
                          setFormValues({
                            ...formValues,
                            [field.name || field.id]: currentList.filter((x) => x !== opt),
                          });
                        }
                      }}
                      className="rounded text-[#00a8ff] w-4 h-4"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            ) : field.type === 'rating' ? (
              <div className="flex items-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const currentStar = formValues[field.name || field.id] || 0;
                  return (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormValues({ ...formValues, [field.name || field.id]: star })}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= currentStar
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 hover:text-amber-200'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-xs font-semibold text-slate-500 ml-2">
                  {formValues[field.name || field.id]
                    ? `${formValues[field.name || field.id]} / 5 Stars`
                    : 'Select rating score'}
                </span>
              </div>
            ) : field.type === 'file' ? (
              <div className="p-5 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-xs font-medium text-slate-600 block">Upload document or photo attachment</span>
                <span className="text-[10px] text-slate-400">PDF, JPG, PNG up to 10MB</span>
              </div>
            ) : (
              <input
                type={field.type === 'phone' ? 'tel' : field.type}
                required={field.required}
                placeholder={field.placeholder || `Enter ${field.label}...`}
                value={formValues[field.name || field.id] || ''}
                onChange={(e) => setFormValues({ ...formValues, [field.name || field.id]: e.target.value })}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-[#00a8ff] transition-colors"
              />
            )}
          </div>
        ))}

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit SSL Encrypted Submission
          </span>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto h-10 px-8 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-bold rounded-lg inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Submit Inquiry</span>
          </button>
        </div>
      </form>
    </div>
  );
}

