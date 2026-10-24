'use client';

import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle2, ShieldCheck, ThumbsUp, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ReviewItem {
  id: string;
  guestName: string;
  property: string;
  rating: number;
  criteria: { cleanliness: number; location: number; service: number; value: number };
  comment: string;
  verifiedStay: boolean;
  date: string;
  status: string;
  hostReply?: { text: string; date: string };
}

export default function ReviewsPage() {
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'rev-1',
      guestName: 'Alexander Wright',
      property: 'Grand Palace Resort & Spa',
      rating: 5,
      criteria: { cleanliness: 5, location: 5, service: 5, value: 4.8 },
      comment: 'Exceptional stay. The private pool suite was pristine and the AI Concierge handled dining reservations effortlessly.',
      verifiedStay: true,
      date: '2026-10-22',
      status: 'Approved',
      hostReply: {
        text: 'Thank you Alexander! We are delighted the AI Concierge enhanced your stay. Looking forward to welcoming you back.',
        date: '2026-10-23',
      },
    },
    {
      id: 'rev-2',
      guestName: 'Elena Rostova',
      property: 'Hotel Stanford',
      rating: 4.8,
      criteria: { cleanliness: 5, location: 4.5, service: 5, value: 4.7 },
      comment: 'The contactless check-in and digital key worked instantly on my iPhone. Beautiful harbor views.',
      verifiedStay: true,
      date: '2026-10-20',
      status: 'Approved',
    },
  ]);

  const handlePublishReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              hostReply: {
                text: replyText.trim(),
                date: new Date().toISOString().split('T')[0],
              },
            }
          : r
      )
    );
    setReplyingToId(null);
    setReplyText('');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Guest Reviews</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-500 fill-amber-400" /> Multi-Criteria Reviews & Reputation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Verified stay protection, 5-dimension rating breakdown, and public host replies (Chapter 12.6).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Overall Reputation Score', val: '4.9 / 5.0' },
          { label: 'Verified Stays Checked', val: '100% Verified' },
          { label: 'Cleanliness Rating', val: '4.95 / 5.0' },
          { label: 'Hospitality & Service', val: '4.90 / 5.0' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium">{stat.label}</span>
            <div className="text-lg font-bold text-slate-900 mt-1">{stat.val}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {reviews.map((rev) => (
          <div key={rev.id} className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{rev.guestName}</span>
                  {rev.verifiedStay && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-[#00a8ff] border border-blue-200">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Stay
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{rev.property} · {rev.date}</p>
              </div>

              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span className="text-xs font-bold text-amber-700">{rev.rating}</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed italic">"{rev.comment}"</p>

            {/* Host Reply Card if already exists */}
            {rev.hostReply && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span className="text-[#00a8ff] flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Host Response (General Manager)
                  </span>
                  <span>{rev.hostReply.date}</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{rev.hostReply.text}</p>
              </div>
            )}

            {/* Inline Host Reply Form */}
            {replyingToId === rev.id && (
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 space-y-2 animate-in fade-in duration-150">
                <label className="block text-xs font-semibold text-slate-700">
                  Write Public Reply to {rev.guestName}
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Express gratitude and address any feedback..."
                  className="w-full p-2 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingToId(null);
                      setReplyText('');
                    }}
                    className="px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200/60 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePublishReply(rev.id)}
                    className="px-3 py-1 text-xs font-semibold text-white bg-[#00a8ff] hover:bg-[#0097e6] rounded transition-colors shadow-2xs cursor-pointer"
                  >
                    Publish Response
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-4">
                <span>Cleanliness: <b>{rev.criteria.cleanliness}</b></span>
                <span>Location: <b>{rev.criteria.location}</b></span>
                <span>Service: <b>{rev.criteria.service}</b></span>
                <span>Value: <b>{rev.criteria.value}</b></span>
              </div>
              {replyingToId !== rev.id && (
                <button
                  onClick={() => {
                    setReplyingToId(rev.id);
                    setReplyText(rev.hostReply?.text || '');
                  }}
                  className="text-[#00a8ff] font-semibold hover:underline cursor-pointer"
                >
                  {rev.hostReply ? 'Edit Host Reply' : 'Write Public Host Reply'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
