'use client';

import React, { useState } from 'react';
import { Hammer, Bug, Calendar, Clock, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ProjectsBugsPage() {
  const [activeTab, setActiveTab] = useState<'renovations' | 'bugs'>('renovations');

  const [projects, setProjects] = useState([
    { id: 'p-1', name: 'West Wing Presidential Suite Renovation', budget: 120000, spent: 85000, stage: 'Active Renovation', progress: 70 },
    { id: 'p-2', name: 'Poolside Cabana Smart Automation & Decking', budget: 45000, spent: 38000, stage: 'Final Inspection', progress: 90 },
    { id: 'p-3', name: 'Grand Ballroom Soundproofing & 4K Laser Projectors', budget: 80000, spent: 25000, stage: 'Contractor Procurement', progress: 35 },
  ]);

  const [bugs, setBugs] = useState([
    { id: 'BUG-101', title: 'Checkout Stripe 3DS redirect timeout on mobile', severity: 'Critical', status: 'In Progress' },
    { id: 'BUG-102', title: 'KDS kitchen printer delayed print queue on Table 4', severity: 'Major', status: 'Resolved' },
    { id: 'BUG-103', title: 'Room 304 AC cooling thermostat sensor reading discrepancy', severity: 'Minor', status: 'New' },
  ]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Projects & Bug Tracking</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Hammer className="w-6 h-6 text-[#00a8ff]" /> Project & Defect Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Capital renovation milestones, budget variance, and internal defect bug tracking (Chapter 16).
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('renovations')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'renovations' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hotel Renovations
          </button>
          <button
            onClick={() => setActiveTab('bugs')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'bugs' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bug Defect Tracker
          </button>
        </div>
      </div>

      {activeTab === 'renovations' && (
        <div className="space-y-4">
          {projects.map((proj) => (
            <div key={proj.id} className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{proj.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Stage: {proj.stage}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">${proj.spent.toLocaleString()} / ${proj.budget.toLocaleString()}</span>
                  <p className="text-[10px] text-slate-400">Budget Spent</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#00a8ff] h-full rounded-full transition-all" style={{ width: `${proj.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'bugs' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Bug ID</th>
                <th className="py-3 px-4">Summary</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bugs.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{b.id}</td>
                  <td className="py-3 px-4 text-slate-800 font-medium">{b.title}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.severity === 'Critical'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : b.severity === 'Major'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {b.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
