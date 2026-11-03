"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Reservation Inquiry",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-black uppercase tracking-widest text-[#00a8ff]">
          24/7 Guest Concierge
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
          We’re Here to Assist You
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Have questions regarding an upcoming resort reservation, private yacht charter, or enterprise booking?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact info cards */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#00a8ff] flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Direct Hotline</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">+880 (2) 988-7824</p>
              <p className="text-[11px] text-slate-500">24 Hours / 7 Days a Week</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#00a8ff] flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Guest Concierge Email</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">concierge@softsasi.com</p>
              <p className="text-[11px] text-slate-500">Average response time: 15 mins</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#00a8ff] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Corporate HQ</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">Softsasi Tower, Gulshan-2</p>
              <p className="text-[11px] text-slate-500">Dhaka-1212, Bangladesh</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs">
          {submitted ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Inquiry Received</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Thank you for reaching out. A senior travel concierge will contact you via email or phone shortly.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmitted(false)}
                className="mt-4"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arif Hossain"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="arif@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Subject
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
                >
                  <option value="Reservation Inquiry">Reservation Inquiry</option>
                  <option value="Private Yacht Charter">Private Yacht Charter</option>
                  <option value="Corporate Banquet Space">Corporate Banquet Space</option>
                  <option value="Contactless Check-In Support">Contactless Check-In Support</option>
                  <option value="Digital Wallet & Loyalty Points">Digital Wallet & Loyalty Points</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Message Details
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can our concierge assist your travel plans?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
                />
              </div>

              <Button
                type="submit"
                className="w-full py-6 font-extrabold uppercase tracking-wider text-xs bg-[#00a8ff] hover:bg-[#0092dd] shadow-md shadow-sky-500/20 gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Message</span>
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

