'use client';
import { BeatLoader } from 'react-spinners';

import React, { useState } from 'react';
import {
  Hammer,
  Bug,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  Loader2,
  X,
  Milestone,
  Activity,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService, ProjectItem, BugItem, CreateProjectDto, CreateBugDto } from '@/features/projects/services/projects.service';

export default function ProjectsBugsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'renovations' | 'gantt' | 'bugs'>('renovations');
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddBugOpen, setIsAddBugOpen] = useState(false);
  const [showCriticalPathOnly, setShowCriticalPathOnly] = useState(false);

  // Chapter 16.1 Interactive Project Gantt Milestones
  const [ganttTasks, setGanttTasks] = useState([
    { id: 'GT-1', phase: 'Phase 1: Architectural Drawings & City Permits', startMonth: 0, durationMonths: 1.5, progress: 100, owner: 'Chief Architect', status: 'COMPLETED', isCriticalPath: true },
    { id: 'GT-2', phase: 'Phase 2: Central HVAC & Electrical Retrofit', startMonth: 1.2, durationMonths: 2.0, progress: 75, owner: 'MEP Engineering Lead', status: 'IN_PROGRESS', isCriticalPath: true },
    { id: 'GT-3', phase: 'Phase 3: Presidential Penthouse Suite Fit-out', startMonth: 2.5, durationMonths: 2.2, progress: 40, owner: 'Interior Furnishing Director', status: 'IN_PROGRESS', isCriticalPath: true },
    { id: 'GT-4', phase: 'Phase 4: Skyline Rooftop Infinity Pool Expansion', startMonth: 3.5, durationMonths: 1.8, progress: 15, owner: 'Civil Works Contractor', status: 'SCHEDULED', isCriticalPath: false },
    { id: 'GT-5', phase: 'Phase 5: IoT RFID Door Locks & Energy BMS Automation', startMonth: 4.5, durationMonths: 1.5, progress: 0, owner: 'Smart Hotel Systems Lead', status: 'SCHEDULED', isCriticalPath: true },
  ]);

  const [newProject, setNewProject] = useState<CreateProjectDto>({
    name: '',
    totalBudget: 0,
    description: '',
  });

  const [newBug, setNewBug] = useState<CreateBugDto>({
    title: '',
    severity: 'Major',
    description: '',
  });

  const { data: projects = [], isLoading: isProjectsLoading } = useQuery<ProjectItem[]>({
    queryKey: ['adminProjectsList'],
    queryFn: () => projectsService.getProjects(),
  });

  const { data: bugs = [], isLoading: isBugsLoading } = useQuery<BugItem[]>({
    queryKey: ['adminBugsList'],
    queryFn: () => projectsService.getBugs(),
  });

  const createProjectMutation = useMutation({
    mutationFn: (dto: CreateProjectDto) => projectsService.createProject(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjectsList'] });
      setIsAddProjectOpen(false);
      setNewProject({ name: '', totalBudget: 0, description: '' });
    },
  });

  const createBugMutation = useMutation({
    mutationFn: (dto: CreateBugDto) => projectsService.createBug(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBugsList'] });
      setIsAddBugOpen(false);
      setNewBug({ title: '', severity: 'Major', description: '' });
    },
  });

  const updateBugStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      projectsService.updateBugStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBugsList'] });
    },
  });

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
            <Hammer className="w-6 h-6 text-[#00a8ff]" /> Project, Gantt & Defect Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Capital renovation milestones, interactive Gantt chart timeline & internal defect bug tracking (Chapter 16).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('renovations')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'renovations' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Renovations
            </button>
            <button
              onClick={() => setActiveTab('gantt')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                activeTab === 'gantt' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Milestone className="w-3 h-3 text-[#00a8ff]" />
              <span>Gantt Timeline (16.1)</span>
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

          {activeTab === 'renovations' && (
            <Button
              onClick={() => setIsAddProjectOpen(true)}
              size="sm"
              className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> New Project
            </Button>
          )}

          {activeTab === 'bugs' && (
            <Button
              onClick={() => setIsAddBugOpen(true)}
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Report Bug
            </Button>
          )}
        </div>
      </div>

      {activeTab === 'renovations' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {isProjectsLoading ? (
            <div className="col-span-3 py-12 text-center text-slate-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#00a8ff]" />
              <span className="mt-2 block">Loading capital projects...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-3 py-12 text-center text-slate-400 text-xs bg-white rounded-lg border border-slate-200">
              No renovation projects found. Click "New Project" to add one.
            </div>
          ) : (
            projects.map((p) => (
              <div key={p.id} className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-3">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-slate-900 text-sm leading-snug">{p.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {p.stage}
                  </span>
                </div>
                {p.description && <p className="text-xs text-slate-500">{p.description}</p>}
                <div className="text-xs text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Authorized Budget:</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(p.budget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actual Expenses:</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(p.spent)}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-bold text-slate-700">{p.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-[#00a8ff] h-2 rounded-full" style={{ width: `${p.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'gantt' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Milestone className="w-4 h-4 text-[#00a8ff]" /> Interactive Project Gantt Timeline & Critical Path (16.1)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-phase capital renovation roadmap with dependency milestones, percentage completion, and critical path tracking.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCriticalPathOnly(!showCriticalPathOnly)}
                className={`text-xs cursor-pointer ${
                  showCriticalPathOnly ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' : 'bg-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5 mr-1 text-amber-600" />
                {showCriticalPathOnly ? 'Showing Critical Path Only' : 'Highlight Critical Path'}
              </Button>
            </div>
          </div>

          {/* Gantt Timeline Container */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 overflow-x-auto">
            {/* Months Header Scale */}
            <div className="min-w-[750px]">
              <div className="grid grid-cols-12 gap-0 border-b border-slate-200 pb-2 text-[11px] font-bold text-slate-600">
                <div className="col-span-4 pl-2">Project Phase & Lead Owner</div>
                <div className="col-span-8 grid grid-cols-6 text-center text-slate-500">
                  <div>Oct &apos;26</div>
                  <div>Nov &apos;26</div>
                  <div>Dec &apos;26</div>
                  <div>Jan &apos;27</div>
                  <div>Feb &apos;27</div>
                  <div>Mar &apos;27</div>
                </div>
              </div>

              {/* Gantt Rows */}
              <div className="divide-y divide-slate-100 mt-2 space-y-2">
                {ganttTasks
                  .filter((t) => (!showCriticalPathOnly ? true : t.isCriticalPath))
                  .map((task) => (
                    <div key={task.id} className="grid grid-cols-12 gap-0 items-center py-2.5 hover:bg-slate-50/70 rounded-lg transition-colors">
                      {/* Left: Task Name & Details */}
                      <div className="col-span-4 pr-3">
                        <div className="flex items-center gap-1.5">
                          {task.isCriticalPath && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Critical Path" />
                          )}
                          <span className="font-bold text-xs text-slate-900 truncate">{task.phase}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{task.owner}</span>
                          <span>&middot;</span>
                          <span className="font-semibold text-slate-600">{task.progress}% Done</span>
                        </div>
                      </div>

                      {/* Right: Gantt Horizontal Track */}
                      <div className="col-span-8 relative h-8 bg-slate-50 rounded-lg border border-slate-100 flex items-center px-1">
                        {/* Month Grid Lines */}
                        <div className="absolute inset-0 grid grid-cols-6 divide-x divide-slate-200/50 pointer-events-none" />

                        {/* Gantt Bar */}
                        <div
                          style={{
                            left: `${(task.startMonth / 6) * 100}%`,
                            width: `${(task.durationMonths / 6) * 100}%`,
                          }}
                          className={`absolute h-6 rounded-md shadow-xs overflow-hidden transition-all flex items-center px-2 z-10 cursor-pointer hover:brightness-105 ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-500 text-white'
                              : task.status === 'IN_PROGRESS'
                              ? 'bg-[#00a8ff] text-white'
                              : 'bg-slate-400 text-white'
                          } ${task.isCriticalPath ? 'ring-2 ring-amber-400 ring-offset-1' : ''}`}
                        >
                          {/* Inner Fill */}
                          <div
                            style={{ width: `${task.progress}%` }}
                            className="absolute left-0 inset-y-0 bg-white/20 pointer-events-none"
                          />
                          <span className="text-[10px] font-bold truncate z-10 select-none">
                            {task.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Gantt Legend */}
              <div className="flex flex-wrap items-center gap-5 pt-4 border-t border-slate-100 text-[11px] text-slate-500 mt-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500" /> Phase Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#00a8ff]" /> In Active Progress
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-400" /> Scheduled Phase
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-400 ring-2 ring-amber-400" /> Critical Path Dependency
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bugs' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Issue Description</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isBugsLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-rose-600" />
                    <span className="mt-2 block text-xs">Loading bug defect queue...</span>
                  </td>
                </tr>
              ) : bugs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    No defects reported.
                  </td>
                </tr>
              ) : (
                bugs.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{b.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{b.title}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          b.severity === 'Critical'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : b.severity === 'Major'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {b.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{b.status}</td>
                    <td className="py-3 px-4 text-right">
                      {b.status !== 'Resolved' && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => updateBugStatusMutation.mutate({ id: b.id, status: 'Resolved' })}
                          className="text-[11px] h-7 bg-white text-emerald-600 hover:bg-emerald-50"
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Project Modal */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Hammer className="w-4 h-4 text-[#00a8ff]" /> Add Renovation / Event Project
              </h3>
              <button onClick={() => setIsAddProjectOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await createProjectMutation.mutateAsync(newProject);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g. North Wing Luxury Suite Upgrade"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Total Authorized Budget ($)</label>
                <input
                  type="number"
                  required
                  value={newProject.totalBudget}
                  onChange={(e) => setNewProject({ ...newProject, totalBudget: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Architectural scope and milestones..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddProjectOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createProjectMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white"
                >
                  {createProjectMutation.isPending ? 'Saving...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bug Modal */}
      {isAddBugOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Bug className="w-4 h-4 text-rose-600" /> Report Software / Hardware Defect
              </h3>
              <button onClick={() => setIsAddBugOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await createBugMutation.mutateAsync(newBug);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Defect Title</label>
                <input
                  type="text"
                  required
                  value={newBug.title}
                  onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
                  placeholder="e.g. POS receipt printer paper jam sensor warning"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Severity</label>
                <select
                  value={newBug.severity}
                  onChange={(e) => setNewBug({ ...newBug, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-rose-500"
                >
                  <option value="Critical">Critical (Immediate Outage)</option>
                  <option value="Major">Major (Impaired Operation)</option>
                  <option value="Minor">Minor (Cosmetic)</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddBugOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createBugMutation.isPending}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {createBugMutation.isPending ? 'Submitting...' : 'Submit Defect Ticket'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
