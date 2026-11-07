'use client';

import React, { useState, useEffect } from 'react';
import { BeatLoader } from 'react-spinners';
import {
  Hammer,
  Bug,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  X,
  Milestone as MilestoneIcon,
  Activity,
  DollarSign,
  Camera,
  FileText,
  ShieldAlert,
  Play,
  Square,
  Layers,
  MessageSquare,
  Paperclip,
  Check,
  ChevronRight,
  UserCheck,
  Compass,
  Rocket,
  Cpu,
  ShieldCheck,
  CheckCheck,
  Terminal,
  Kanban,
  Workflow,
  Server,
  Database,
  GitBranch,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  projectsService,
  ProjectItem,
  BugItem,
  CreateProjectDto,
  CreateBugDto,
  CreateMilestoneDto,
  CreateTaskDto,
  AddExpenseDto,
  StartTrackerDto,
  StopTrackerDto,
  SubmitTimesheetDto,
} from '@/features/projects/services/projects.service';

export default function ProjectsBugsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'projects' | 'timesheets' | 'bugs' | 'roadmap'>('projects');
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>('PHASE-01');

  // Modals & Drawers state
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddBugOpen, setIsAddBugOpen] = useState(false);
  const [isSubmitTimesheetOpen, setIsSubmitTimesheetOpen] = useState(false);
  const [selectedBug, setSelectedBug] = useState<BugItem | null>(null);
  const [bugCommentText, setBugCommentText] = useState('');

  // Selected project for Gantt & milestones view
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showCriticalPathOnly, setShowCriticalPathOnly] = useState(false);

  // Live Timer Tracker state
  const [activeTimerSeconds, setActiveTimerSeconds] = useState(0);
  const [isLocalTimerActive, setIsLocalTimerActive] = useState(false);
  const [trackerTaskId, setTrackerTaskId] = useState('');
  const [isTrackerBillable, setIsTrackerBillable] = useState(true);

  // Forms state
  const [newProject, setNewProject] = useState<CreateProjectDto>({
    projectName: '',
    totalBudget: 150000,
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
  });

  const [newMilestone, setNewMilestone] = useState<CreateMilestoneDto>({
    title: '',
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  const [newTask, setNewTask] = useState<CreateTaskDto>({
    title: '',
    priority: 'high',
    status: 'in_progress',
  });

  const [newExpense, setNewExpense] = useState<AddExpenseDto>({
    itemTitle: '',
    amount: 12500,
  });

  const [newTimesheet, setNewTimesheet] = useState<SubmitTimesheetDto>({
    weekNumber: 45,
    year: 2026,
    totalHours: 40,
  });

  const [newBug, setNewBug] = useState<CreateBugDto>({
    title: '',
    severity: 'major',
    priority: 'high',
    description: '',
  });

  // Queries
  const {
    data: projectOverview,
    isLoading: isProjectsLoading,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ['chapter16_projectOverview'],
    queryFn: () => projectsService.getProjectOverview(),
  });

  const {
    data: timesheetOverview,
    isLoading: isTimesheetsLoading,
    refetch: refetchTimesheets,
  } = useQuery({
    queryKey: ['chapter16_timesheetOverview'],
    queryFn: () => projectsService.getTimesheetOverview(),
  });

  const {
    data: bugOverview,
    isLoading: isBugsLoading,
    refetch: refetchBugs,
  } = useQuery({
    queryKey: ['chapter16_bugOverview'],
    queryFn: () => projectsService.getBugOverview(),
  });

  // Chapter 21: 64-Week Developer Roadmap, DoD Checklist & DevOps Architecture
  const {
    data: roadmapData,
    isLoading: isRoadmapLoading,
    refetch: refetchRoadmap,
  } = useQuery({
    queryKey: ['chapter21_roadmapMaster'],
    queryFn: () => projectsService.getRoadmapMaster(),
  });

  const {
    data: dodData,
    isLoading: isDodLoading,
    refetch: refetchDod,
  } = useQuery({
    queryKey: ['chapter21_dodChecklist'],
    queryFn: () => projectsService.getDodChecklist(),
  });

  const { data: qaMetrics, isLoading: isQaLoading } = useQuery({
    queryKey: ['chapter21_qaMetrics'],
    queryFn: () => projectsService.getQaMetrics(),
  });

  const { data: cicdArchitecture, isLoading: isCicdLoading } = useQuery({
    queryKey: ['chapter21_cicd'],
    queryFn: () => projectsService.getCiCdArchitecture(),
  });

  const projects = projectOverview?.projects || [];
  const activeProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Live timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLocalTimerActive) {
      interval = setInterval(() => {
        setActiveTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocalTimerActive]);

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: (dto: CreateProjectDto) => projectsService.createProject(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter16_projectOverview'] });
      setIsAddProjectOpen(false);
      setNewProject({
        projectName: '',
        totalBudget: 150000,
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      });
    },
  });

  const addMilestoneMutation = useMutation({
    mutationFn: (dto: CreateMilestoneDto) =>
      projectsService.addMilestone(activeProject?.id || '', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter16_projectOverview'] });
      setIsAddMilestoneOpen(false);
      setNewMilestone({
        title: '',
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      });
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: (dto: CreateTaskDto) =>
      projectsService.addTask(activeProject?.id || '', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter16_projectOverview'] });
      setIsAddTaskOpen(false);
      setNewTask({ title: '', priority: 'high', status: 'in_progress' });
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: (dto: AddExpenseDto) =>
      projectsService.addExpense(activeProject?.id || '', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter16_projectOverview'] });
      setIsAddExpenseOpen(false);
      setNewExpense({ itemTitle: '', amount: 12500 });
    },
  });

  const startTrackerMutation = useMutation({
    mutationFn: (dto: StartTrackerDto) => projectsService.startTracker(dto),
    onSuccess: () => {
      setIsLocalTimerActive(true);
      setActiveTimerSeconds(0);
      queryClient.invalidateQueries({ queryKey: ['chapter16_timesheetOverview'] });
    },
  });

  const stopTrackerMutation = useMutation({
    mutationFn: ({ trackerId, dto }: { trackerId: string; dto: StopTrackerDto }) =>
      projectsService.stopTracker(trackerId, dto),
    onSuccess: () => {
      setIsLocalTimerActive(false);
      setActiveTimerSeconds(0);
      queryClient.invalidateQueries({ queryKey: ['chapter16_timesheetOverview'] });
    },
  });

  const submitTimesheetMutation = useMutation({
    mutationFn: (dto: SubmitTimesheetDto) => projectsService.submitWeeklyTimesheet(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter16_timesheetOverview'] });
      setIsSubmitTimesheetOpen(false);
    },
  });

  const createBugMutation = useMutation({
    mutationFn: (dto: CreateBugDto) => projectsService.createBug(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter16_bugOverview'] });
      setIsAddBugOpen(false);
      setNewBug({ title: '', severity: 'major', priority: 'high', description: '' });
    },
  });

  const updateBugStatusMutation = useMutation({
    mutationFn: ({ bugId, statusId }: { bugId: string; statusId: string }) =>
      projectsService.updateBugStatus(bugId, statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter16_bugOverview'] });
    },
  });

  const addBugCommentMutation = useMutation({
    mutationFn: ({ bugId, comment }: { bugId: string; comment: string }) =>
      projectsService.addBugComment(bugId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter16_bugOverview'] });
      setBugCommentText('');
    },
  });

  const formatTimerClock = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
            <span>/</span>
            <span className="text-slate-400">Chapter 16</span>
            <span>/</span>
            <span className="text-slate-800 font-medium">Projects & Asset Management / Bug Tracking</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Hammer className="w-6 h-6 text-[#00a8ff]" /> Project & Defect Operations Suite
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time capital hotel renovations, Gantt critical path analysis, employee timesheet proofs, and defect lifecycle resolution.
          </p>
        </div>

        {/* Global Tab Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'projects'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Hammer className="w-3.5 h-3.5 text-[#00a8ff]" />
              <span>16.1 Hotel Renovations</span>
            </button>
            <button
              onClick={() => setActiveTab('timesheets')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'timesheets'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>16.2 Timesheets & Tracker</span>
            </button>
            <button
              onClick={() => setActiveTab('bugs')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bugs'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bug className="w-3.5 h-3.5 text-rose-600" />
              <span>16.3 Internal Bug Tracker</span>
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'roadmap'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chapter 21: 64-Week Roadmap</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              refetchProjects();
              refetchTimesheets();
              refetchBugs();
              refetchRoadmap();
              refetchDod();
            }}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: 16.1 HOTEL RENOVATION & SPECIAL EVENT PROJECTS     */}
      {/* ======================================================== */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Telemetry Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Authorized Budget
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900">
                  {formatCurrency(projectOverview?.summary?.totalBudget || 0)}
                </span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                  {projectOverview?.summary?.totalProjects || 0} Projects
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Capital renovation pool</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Actual Expenditure
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-blue-600">
                  {formatCurrency(projectOverview?.summary?.totalSpent || 0)}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  {projectOverview?.summary?.totalBudget
                    ? Math.round(
                        ((projectOverview?.summary?.totalSpent || 0) /
                          projectOverview?.summary?.totalBudget) *
                          100,
                      )
                    : 0}
                  % Disbursed
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">PO bills & contractor invoices</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Budget Variance (Real-Time)
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span
                  className={`text-2xl font-extrabold ${
                    (projectOverview?.summary?.overallVariance || 0) >= 0
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {formatCurrency(projectOverview?.summary?.overallVariance || 0)}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    (projectOverview?.summary?.overallVariance || 0) >= 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {(projectOverview?.summary?.overallVariance || 0) >= 0
                    ? 'Under Budget'
                    : 'Budget Overrun'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Direct variance safeguard</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Active Projects
                </span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                  {projectOverview?.summary?.activeProjects || 0} Renovation Wings
                </span>
              </div>
              <Button
                onClick={() => setIsAddProjectOpen(true)}
                size="sm"
                className="w-full mt-2 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> New Capital Project
              </Button>
            </div>
          </div>

          {/* Project Cards Selector */}
          {isProjectsLoading ? (
            <div className="py-16 text-center">
              <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
              <span className="mt-3 block text-xs text-slate-500 font-medium">
                Loading capital projects and Gantt structures...
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects.map((proj) => {
                const isSelected = proj.id === activeProject?.id;
                const totalBudg = Number(proj.budget?.totalBudget || 0);
                const spent = Number(proj.financials?.totalSpent || 0);
                const progressPct =
                  totalBudg > 0 ? Math.min(100, Math.round((spent / totalBudg) * 100)) : 0;

                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProjectId(proj.id)}
                    className={`p-5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/50 border-[#00a8ff] ring-2 ring-[#00a8ff]/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-slate-900 text-sm">{proj.projectName}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-bold ${
                          proj.status === 'in_progress'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {proj.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {proj.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{proj.description}</p>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Allocated Budget</span>
                        <span className="font-bold text-slate-800">{formatCurrency(totalBudg)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Expenses to Date</span>
                        <span className="font-bold text-slate-800">{formatCurrency(spent)}</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] mb-1 font-semibold text-slate-600">
                        <span>Milestones & Budget Execution</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#00a8ff] h-2 rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Active Project Details: 6-Stage Milestones & Gantt Timeline */}
          {activeProject && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{activeProject.projectName}</h2>
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 text-[10px]">
                      ID: {activeProject.id.slice(0, 8)}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Stage Milestones, Dependency Schedule & Expense Variance
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddMilestoneOpen(true)}
                    className="text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Milestone
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddTaskOpen(true)}
                    className="text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Task
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsAddExpenseOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    <DollarSign className="w-3.5 h-3.5 mr-1" /> Log Expense
                  </Button>
                </div>
              </div>

              {/* 6-Stage Milestone Lifecycle Banner */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <MilestoneIcon className="w-4 h-4 text-[#00a8ff]" /> 6-Stage Hospitality Renovation Milestones
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { stage: 'Stage 1', name: 'Planning', status: 'completed' },
                    { stage: 'Stage 2', name: 'Architectural Design', status: 'completed' },
                    { stage: 'Stage 3', name: 'Contractor Procurement', status: 'completed' },
                    { stage: 'Stage 4', name: 'Active Renovation', status: 'in_progress' },
                    { stage: 'Stage 5', name: 'Final Quality Inspection', status: 'pending' },
                    { stage: 'Stage 6', name: 'Handover & Opening', status: 'pending' },
                  ].map((st, idx) => {
                    const matchedMilestone = activeProject.milestones?.find((m) =>
                      m.title.toLowerCase().includes(st.name.toLowerCase().split(' ')[0]),
                    );
                    const isDone = st.status === 'completed';
                    const isInProgress = st.status === 'in_progress';

                    return (
                      <div
                        key={st.stage}
                        className={`p-3 rounded-lg border text-xs flex flex-col justify-between ${
                          isDone
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                            : isInProgress
                            ? 'bg-blue-50/70 border-blue-300 text-blue-900 ring-2 ring-blue-400/20'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between font-bold text-[10px] uppercase">
                            <span>{st.stage}</span>
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : isInProgress ? (
                              <Activity className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </div>
                          <div className="font-bold text-xs mt-1 text-slate-800 leading-tight">
                            {st.name}
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px]">
                          {matchedMilestone ? (
                            <span>Due: {new Date(matchedMilestone.dueDate).toLocaleDateString()}</span>
                          ) : (
                            <span className="capitalize">{st.status.replace('_', ' ')}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Gantt Chart with Critical Path Analysis */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#00a8ff]" /> Interactive Gantt Schedule & Critical Path
                    </h3>
                    <p className="text-xs text-slate-500">
                      Task dependencies, critical path highlights, and progress tracking across 6 months.
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCriticalPathOnly(!showCriticalPathOnly)}
                    className={`text-xs ${
                      showCriticalPathOnly
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                        : 'bg-white text-slate-700'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 mr-1 text-amber-600" />
                    {showCriticalPathOnly ? 'Showing Critical Path Only' : 'Filter Critical Path'}
                  </Button>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 overflow-x-auto min-w-[700px]">
                  {/* Gantt Timeline scale */}
                  <div className="grid grid-cols-12 gap-0 border-b border-slate-200 pb-2 text-[11px] font-bold text-slate-600">
                    <div className="col-span-5 pl-2">Task Title & Assignee</div>
                    <div className="col-span-7 grid grid-cols-6 text-center text-slate-500">
                      <div>Nov &apos;26</div>
                      <div>Dec &apos;26</div>
                      <div>Jan &apos;27</div>
                      <div>Feb &apos;27</div>
                      <div>Mar &apos;27</div>
                      <div>Apr &apos;27</div>
                    </div>
                  </div>

                  {/* Tasks Rows */}
                  <div className="divide-y divide-slate-100 mt-2 space-y-2">
                    {(activeProject.tasks && activeProject.tasks.length > 0
                      ? activeProject.tasks
                      : [
                          {
                            id: 't-1',
                            title: 'Demolition & Hazardous Material Remediation',
                            assignedTo: 'MEP Demolition Crew',
                            priority: 'urgent',
                            status: 'completed',
                            isCriticalPath: true,
                            startMonth: 0,
                            durationMonths: 1.2,
                          },
                          {
                            id: 't-2',
                            title: 'Structural Steel Reinforcement & Plumbing Rough-In',
                            assignedTo: 'Chief Structural Contractor',
                            priority: 'high',
                            status: 'in_progress',
                            isCriticalPath: true,
                            startMonth: 1.0,
                            durationMonths: 2.0,
                          },
                          {
                            id: 't-3',
                            title: 'Custom Italian Calacatta Marble & Teak Vanity Installation',
                            assignedTo: 'Luxury Millwork Specialists',
                            priority: 'high',
                            status: 'todo',
                            isCriticalPath: true,
                            startMonth: 2.8,
                            durationMonths: 1.5,
                          },
                          {
                            id: 't-4',
                            title: 'Smart Room IoT Lighting, RFID Locks & BACnet BMS Commissioning',
                            assignedTo: 'Smart Building Engineering Lead',
                            priority: 'medium',
                            status: 'todo',
                            isCriticalPath: false,
                            startMonth: 3.8,
                            durationMonths: 1.2,
                          },
                        ]
                    )
                      .filter((t) => (!showCriticalPathOnly ? true : t.isCriticalPath))
                      .map((task, idx) => {
                        const start = task.startMonth ?? idx * 1.0;
                        const duration = task.durationMonths ?? 1.5;
                        const pctDone =
                          task.status === 'completed' ? 100 : task.status === 'in_progress' ? 65 : 15;

                        return (
                          <div
                            key={task.id}
                            className="grid grid-cols-12 gap-0 items-center py-2.5 hover:bg-slate-50/70 rounded-md transition-colors"
                          >
                            <div className="col-span-5 pr-3">
                              <div className="flex items-center gap-1.5">
                                {task.isCriticalPath && (
                                  <span
                                    className="w-2 h-2 rounded-full bg-amber-500 shrink-0"
                                    title="Critical Path Dependency"
                                  />
                                )}
                                <span className="font-semibold text-xs text-slate-900 truncate">
                                  {task.title}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                                <span>{task.assignedTo || 'Unassigned'}</span>
                                <span>&middot;</span>
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1.5 py-0 capitalize bg-slate-50 text-slate-600"
                                >
                                  {task.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>

                            <div className="col-span-7 relative h-8 bg-slate-50 rounded-lg border border-slate-100 flex items-center px-1">
                              <div className="absolute inset-0 grid grid-cols-6 divide-x divide-slate-200/50 pointer-events-none" />

                              <div
                                style={{
                                  left: `${Math.min(95, Math.max(0, (start / 6) * 100))}%`,
                                  width: `${Math.min(90, Math.max(10, (duration / 6) * 100))}%`,
                                }}
                                className={`absolute h-6 rounded-md shadow-xs overflow-hidden transition-all flex items-center px-2 z-10 ${
                                  task.status === 'completed'
                                    ? 'bg-emerald-600 text-white'
                                    : task.status === 'in_progress'
                                    ? 'bg-[#00a8ff] text-white'
                                    : 'bg-slate-400 text-white'
                                } ${task.isCriticalPath ? 'ring-2 ring-amber-400 ring-offset-1' : ''}`}
                              >
                                <div
                                  style={{ width: `${pctDone}%` }}
                                  className="absolute left-0 inset-y-0 bg-white/20 pointer-events-none"
                                />
                                <span className="text-[10px] font-bold truncate z-10 select-none">
                                  {pctDone}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Gantt Legend */}
                  <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 mt-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-600" /> Completed
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-[#00a8ff]" /> In Progress
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-slate-400" /> Scheduled
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-amber-400 ring-2 ring-amber-400" /> Critical Path
                    </span>
                  </div>
                </div>
              </div>

              {/* Budget vs Actual Expenses Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> Budget Breakdown & Real-Time Variance
                  </h3>
                  <div className="text-xs text-slate-500 font-medium">
                    Allocated: <span className="font-bold text-slate-800">{formatCurrency(activeProject.budget?.totalBudget || 0)}</span> |
                    Spent: <span className="font-bold text-slate-800">{formatCurrency(activeProject.financials?.totalSpent || 0)}</span> |
                    Variance:{' '}
                    <span
                      className={`font-bold ${
                        (activeProject.financials?.variance || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(activeProject.financials?.variance || 0)}
                    </span>
                  </div>
                </div>

                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100/60 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Expense Item / PO Reference</th>
                      <th className="py-2.5 px-4">Date Incurred</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                      <th className="py-2.5 px-4 text-right">Audit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeProject.expenses && activeProject.expenses.length > 0 ? (
                      activeProject.expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-semibold text-slate-800">{exp.itemTitle}</td>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(exp.expenseDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">
                            {formatCurrency(exp.amount)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"
                            >
                              Approved Invoice
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          No expenses recorded yet for this project.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: 16.2 EMPLOYEE TIMESHEETS & DESKTOP TIME TRACKER   */}
      {/* ======================================================== */}
      {activeTab === 'timesheets' && (
        <div className="space-y-6">
          {/* Timesheet Telemetry Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Billable Work Hours
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-indigo-600">
                  {timesheetOverview?.summary?.billableHours || 0} hrs
                </span>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px]">
                  Billable
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Client and corporate event billing</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Non-Billable Work Hours
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-800">
                  {timesheetOverview?.summary?.nonBillableHours || 0} hrs
                </span>
                <span className="text-xs font-semibold text-slate-500">Internal Operations</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Staff briefings & admin duties</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Billable Utilization Ratio
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-emerald-600">
                  {timesheetOverview?.summary?.billableRatio || 84}%
                </span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                  Optimal
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Hospitality workforce efficiency</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pending Approvals
                </span>
                <span className="text-2xl font-extrabold text-amber-600 mt-1 block">
                  {timesheetOverview?.summary?.pendingTimesheets || 0} Weekly Sheets
                </span>
              </div>
              <Button
                onClick={() => setIsSubmitTimesheetOpen(true)}
                size="sm"
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Submit Timesheet
              </Button>
            </div>
          </div>

          {/* Desktop Time Tracker (TimeTracker.php & TrackPhoto.php) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Timer Widget */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" /> Desktop Time Tracker
                  </h3>
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-bold ${
                      isLocalTimerActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse'
                        : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    {isLocalTimerActive ? 'Tracking Active' : 'Standby'}
                  </Badge>
                </div>

                <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200/60 mb-4">
                  <span className="text-4xl font-mono font-extrabold text-slate-900 tracking-wider">
                    {formatTimerClock(activeTimerSeconds)}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-1 font-medium">
                    {isLocalTimerActive
                      ? 'Automated screen capture active every 10 min'
                      : 'Press Start Tracker to log contractor work'}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Assign to Project / Task</label>
                    <select
                      value={trackerTaskId}
                      onChange={(e) => setTrackerTaskId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden text-xs bg-white"
                    >
                      <option value="">Grand Palace Ocean Wing - Marble Installation</option>
                      <option value="skyline">Skyline Rooftop Pool - Filtration Plumbing</option>
                      <option value="gala">Hospitality Gala 2026 - AV Rigging</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="billableCheck"
                      checked={isTrackerBillable}
                      onChange={(e) => setIsTrackerBillable(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="billableCheck" className="text-slate-700 font-medium cursor-pointer">
                      Mark hours as billable to project client
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-2">
                {!isLocalTimerActive ? (
                  <Button
                    onClick={() =>
                      startTrackerMutation.mutate({
                        taskId: trackerTaskId || undefined,
                        isBillable: isTrackerBillable,
                      })
                    }
                    disabled={startTrackerMutation.isPending}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                  >
                    <Play className="w-3.5 h-3.5 mr-1" /> Start Work Tracker
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      stopTrackerMutation.mutate({
                        trackerId:
                          timesheetOverview?.activeTrackers?.[0]?.id ||
                          '00000000-0000-4000-a000-000000000001',
                        dto: {
                          photoUrl: 'https://cdn.omnistay.com/timeproof/work_cad_review.jpg',
                        },
                      })
                    }
                    disabled={stopTrackerMutation.isPending}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                  >
                    <Square className="w-3.5 h-3.5 mr-1" /> Stop & Capture Screenshot
                  </Button>
                )}
              </div>
            </div>

            {/* Desktop Screenshots Verification Gallery (TrackPhoto.php) */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-600" /> Automated Verification Screenshots (TrackPhoto.php)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Periodic desktop proof captures verifying active software drafting and engineering work.
                  </p>
                </div>
                <Badge variant="outline" className="bg-slate-50 text-slate-600 text-[10px]">
                  Preserved from erp.softsasi.com
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    title: 'AutoCAD Ocean Wing Floor Plan',
                    time: '10:45 AM - Today',
                    user: 'Chief Structural Architect',
                    ratio: '98% Active keystrokes',
                    img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80',
                  },
                  {
                    title: 'BMS HVAC Zone Commissioning',
                    time: '11:15 AM - Today',
                    user: 'MEP Engineering Lead',
                    ratio: '94% Active keystrokes',
                    img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
                  },
                  {
                    title: 'KDS & POS Terminal Network Audit',
                    time: '01:20 PM - Today',
                    user: 'Hospitality Systems Lead',
                    ratio: '91% Active keystrokes',
                    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
                  },
                ].map((shot, i) => (
                  <div
                    key={i}
                    className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 group hover:border-[#00a8ff] transition-all"
                  >
                    <div className="h-28 overflow-hidden relative">
                      <img
                        src={shot.img}
                        alt={shot.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                        {shot.time}
                      </span>
                    </div>
                    <div className="p-2.5 text-xs">
                      <div className="font-bold text-slate-800 truncate">{shot.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between">
                        <span>{shot.user}</span>
                        <span className="text-emerald-600 font-semibold">{shot.ratio}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submitted Weekly Timesheets Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" /> Weekly Hours Timesheet Approvals
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Integrated with Chapter 10 Hospitality Payroll
              </span>
            </div>

            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/60 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Employee / Contractor</th>
                  <th className="py-2.5 px-4">Week & Year</th>
                  <th className="py-2.5 px-4 text-center">Total Hours</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {timesheetOverview?.weeklyTimesheets && timesheetOverview.weeklyTimesheets.length > 0 ? (
                  timesheetOverview.weeklyTimesheets.map((sheet) => (
                    <tr key={sheet.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {sheet.userName || 'Lead MEP Contractor'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        Week {sheet.weekNumber}, {sheet.year}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {sheet.totalHours} hrs
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-bold ${
                            sheet.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {sheet.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="xs"
                          variant="outline"
                          className="text-[11px] h-7 bg-white text-emerald-600 hover:bg-emerald-50"
                        >
                          <UserCheck className="w-3 h-3 mr-1" /> Approve Sheet
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No weekly timesheets found. Click "Submit Timesheet" to file hours.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: 16.3 INTERNAL BUG & DEFECT TRACKING SYSTEM        */}
      {/* ======================================================== */}
      {activeTab === 'bugs' && (
        <div className="space-y-6">
          {/* Defect Telemetry Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Defect Tickets
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900">
                  {bugOverview?.summary?.totalBugs || 0}
                </span>
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px]">
                  All Outlets
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Bug.php defect repository</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Open / In Progress
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-amber-600">
                  {bugOverview?.summary?.openBugs || 0}
                </span>
                <span className="text-xs font-semibold text-slate-600">Active Queue</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Being actively investigated</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Critical Severity Outages
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-rose-600">
                  {bugOverview?.summary?.criticalBugs || 0}
                </span>
                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
                  P0 Outage
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Requires immediate hotfix</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Resolved Defects
                </span>
                <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
                  {bugOverview?.summary?.resolvedBugs || 0} Tickets
                </span>
              </div>
              <Button
                onClick={() => setIsAddBugOpen(true)}
                size="sm"
                className="w-full mt-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Report Defect Ticket
              </Button>
            </div>
          </div>

          {/* Defect Lifecycle Kanban & Ticket Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Bug className="w-4 h-4 text-rose-600" /> Defect Lifecycle Matrix (erp.softsasi.com Engine)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Lifecycle transitions: New &rarr; In Progress &rarr; Under Review &rarr; Resolved &rarr; Verified / Closed
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
                  Critical: Checkout / Hardware Outage
                </Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                  Major: Delayed Printing
                </Badge>
              </div>
            </div>

            {isBugsLoading ? (
              <div className="py-16 text-center">
                <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
                <span className="mt-3 block text-xs text-slate-500 font-medium">
                  Loading defect tickets and error trace logs...
                </span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100/60 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Issue Description & Component</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Status & Lifecycle</th>
                    <th className="py-3 px-4">Attachments</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bugOverview?.bugs && bugOverview.bugs.length > 0 ? (
                    bugOverview.bugs.map((bug) => {
                      const isCritical = bug.severity === 'critical';
                      const isMajor = bug.severity === 'major';

                      return (
                        <tr key={bug.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            BUG-{bug.id.slice(0, 6).toUpperCase()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-800 block">{bug.title}</span>
                            <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {bug.description}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                isCritical
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : isMajor
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-50 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {bug.severity}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={bug.statusId}
                              onChange={(e) =>
                                updateBugStatusMutation.mutate({
                                  bugId: bug.id,
                                  statusId: e.target.value,
                                })
                              }
                              className="px-2 py-1 rounded border border-slate-200 bg-white font-semibold text-[11px] text-slate-700 focus:outline-hidden"
                            >
                              {bugOverview.statuses?.map((st) => (
                                <option key={st.id} value={st.id}>
                                  {st.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            {bug.files && bug.files.length > 0 ? (
                              <div className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold cursor-pointer">
                                <Paperclip className="w-3.5 h-3.5" />
                                <span>{bug.files.length} Log trace</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400">None</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => setSelectedBug(bug)}
                              className="text-[11px] h-7 bg-white hover:bg-slate-50"
                            >
                              <MessageSquare className="w-3 h-3 mr-1 text-[#00a8ff]" /> View & Notes
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No defects found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD CAPITAL RENOVATION PROJECT                   */}
      {/* ======================================================== */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Hammer className="w-4 h-4 text-[#00a8ff]" /> New Capital Renovation / Event Project
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
                  value={newProject.projectName}
                  onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
                  placeholder="e.g. Skyline Rooftop Infinity Pool Expansion"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Total Authorized Budget ($)</label>
                <input
                  type="number"
                  required
                  value={newProject.totalBudget}
                  onChange={(e) =>
                    setNewProject({ ...newProject, totalBudget: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Estimated Handover</label>
                  <input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Description & Scope</label>
                <textarea
                  rows={3}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Architectural scope, milestones and subcontractor deliverables..."
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
                  {createProjectMutation.isPending ? 'Saving...' : 'Authorize Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADD MILESTONE                                    */}
      {/* ======================================================== */}
      {isAddMilestoneOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MilestoneIcon className="w-4 h-4 text-[#00a8ff]" /> Add Project Milestone
              </h3>
              <button onClick={() => setIsAddMilestoneOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await addMilestoneMutation.mutateAsync(newMilestone);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Milestone Title</label>
                <input
                  type="text"
                  required
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  placeholder="e.g. Stage 5: Final Quality Inspection"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={newMilestone.dueDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddMilestoneOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={addMilestoneMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white"
                >
                  {addMilestoneMutation.isPending ? 'Saving...' : 'Add Milestone'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADD TASK                                         */}
      {/* ======================================================== */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00a8ff]" /> Add Work Task to Gantt
              </h3>
              <button onClick={() => setIsAddTaskOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await addTaskMutation.mutateAsync(newTask);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Install Acoustic Ceiling Panels"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden bg-white"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Status</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden bg-white"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddTaskOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={addTaskMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white"
                >
                  {addTaskMutation.isPending ? 'Saving...' : 'Add Task'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: LOG EXPENSE AGAINST BUDGET                       */}
      {/* ======================================================== */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Log Project Expense
              </h3>
              <button onClick={() => setIsAddExpenseOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await addExpenseMutation.mutateAsync(newExpense);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Expense Item / Vendor</label>
                <input
                  type="text"
                  required
                  value={newExpense.itemTitle}
                  onChange={(e) => setNewExpense({ ...newExpense, itemTitle: e.target.value })}
                  placeholder="e.g. Subcontractor HVAC Ducting Invoice #9421"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Amount ($)</label>
                <input
                  type="number"
                  required
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddExpenseOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={addExpenseMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {addExpenseMutation.isPending ? 'Logging...' : 'Record Expense'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: SUBMIT WEEKLY TIMESHEET                          */}
      {/* ======================================================== */}
      {isSubmitTimesheetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" /> Submit Weekly Timesheet
              </h3>
              <button
                onClick={() => setIsSubmitTimesheetOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await submitTimesheetMutation.mutateAsync(newTimesheet);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Week Number</label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    required
                    value={newTimesheet.weekNumber}
                    onChange={(e) =>
                      setNewTimesheet({ ...newTimesheet, weekNumber: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Year</label>
                  <input
                    type="number"
                    required
                    value={newTimesheet.year}
                    onChange={(e) =>
                      setNewTimesheet({ ...newTimesheet, year: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Total Hours Worked</label>
                <input
                  type="number"
                  step="0.5"
                  min={1}
                  required
                  value={newTimesheet.totalHours}
                  onChange={(e) =>
                    setNewTimesheet({ ...newTimesheet, totalHours: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSubmitTimesheetOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitTimesheetMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {submitTimesheetMutation.isPending ? 'Filing...' : 'Submit to Payroll'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: REPORT BUG / DEFECT TICKET                       */}
      {/* ======================================================== */}
      {isAddBugOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Bug className="w-4 h-4 text-rose-600" /> Report Internal Bug / Defect
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
                  placeholder="e.g. KDS display order latency during peak hours"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Severity</label>
                  <select
                    value={newBug.severity}
                    onChange={(e) =>
                      setNewBug({ ...newBug, severity: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden bg-white"
                  >
                    <option value="critical">Critical (Immediate Outage)</option>
                    <option value="major">Major (Core Function Impaired)</option>
                    <option value="minor">Minor (Cosmetic UI)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Priority</label>
                  <select
                    value={newBug.priority}
                    onChange={(e) =>
                      setNewBug({ ...newBug, priority: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden bg-white"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Reproduction & Error Logs</label>
                <textarea
                  rows={3}
                  required
                  value={newBug.description}
                  onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
                  placeholder="Steps to reproduce, error stack trace, affected terminal/room..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-rose-500"
                />
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
                  {createBugMutation.isPending ? 'Filing...' : 'Submit Defect Ticket'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CHAPTER 21: 64-WEEK DEVELOPER ROADMAP & DOD PLAN   */}
      {/* ======================================================== */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          {/* Macro Telemetry & Execution Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Master Roadmap Scope (21.1)
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <Compass className="w-5 h-5 text-emerald-600" />
                <span>64 Weeks</span>
                <span className="text-xs text-slate-500 font-normal">(16 Months)</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                10 Sequential Engineering Phases
              </span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Platform Engineering Progress
              </span>
              <div className="text-xl font-bold text-[#00a8ff] mt-1 flex items-center gap-2">
                <span>{roadmapData?.overallProgressPercent ?? 88}%</span>
                <Badge variant="outline" className="text-[10px] bg-sky-50 text-sky-700 border-sky-200">
                  {roadmapData?.completedPhases ?? 8}/10 Phases Done
                </Badge>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#00a8ff] h-full rounded-full transition-all duration-500"
                  style={{ width: `${roadmapData?.overallProgressPercent ?? 88}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Production Definition of Done (21.4)
              </span>
              <div className="text-xl font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>{dodData?.compliantCount ?? 5}/{dodData?.totalItems ?? 5} Verified</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                100% Compliant & Production Ready
              </span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                QA & Concurrency Gates (21.2)
              </span>
              <div className="text-xl font-bold text-indigo-600 mt-1 flex items-center gap-1.5">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <span>Vitest 88.4%</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                k6 100k Concurrency | 0 Overbooking
              </span>
            </div>
          </div>

          {/* SECTION A: 21.4 DEVELOPER DEFINITION OF DONE (DoD) CHECKLIST */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    21.4 Developer Definition of Done (DoD) Production Gate Checklist
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Mandatory multi-dimensional acceptance criteria verified before any feature is marked 'DONE'.
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-2.5 py-0.5">
                5 of 5 Gates Passed
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {dodData?.items?.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[9px] font-mono bg-white">
                      {item.id}
                    </Badge>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <Check className="w-3.5 h-3.5" /> Compliant
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 leading-snug">{item.title}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{item.requirement}</p>
                  <div className="pt-2 border-t border-slate-200/60 text-[10px] space-y-1">
                    <div className="text-slate-500">
                      <span className="font-semibold text-slate-700">Verification:</span> {item.verificationMethod}
                    </div>
                    <div className="text-emerald-700 font-mono bg-emerald-50/80 p-1.5 rounded border border-emerald-100">
                      ✓ {item.auditEvidence}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION B: 21.2 QA TESTING ARCHITECTURE & 21.3 CI/CD DEVOPS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 21.2 Quality Assurance & Testing Architecture */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    21.2 Quality Assurance & Automated Testing Architecture
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    High financial and reservation accuracy enforced by automated test tiers.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-indigo-50/40 rounded-lg border border-indigo-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-indigo-600" /> Unit & Domain Tests (Vitest)
                    </span>
                    <Badge variant="outline" className="bg-white text-indigo-700 text-[10px] font-bold">
                      Coverage: 88.4% (Goal &gt;= 85%)
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Over 248 tests across 30 test files passing 100%. Covers double-entry journals, tax calculators, webhook HMAC signatures, and payroll engines.
                  </p>
                </div>

                <div className="p-3 bg-sky-50/40 rounded-lg border border-sky-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-sky-950 flex items-center gap-1.5">
                      <Workflow className="w-3.5 h-3.5 text-sky-600" /> End-to-End (E2E) Headless Tests (Playwright)
                    </span>
                    <Badge variant="outline" className="bg-white text-sky-700 text-[10px] font-bold">
                      Critical Journey Passed
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono text-[10px]">
                    User search &rarr; Room select &rarr; Checkout payment &rarr; Mobile check-in &rarr; Folio settlement.
                  </p>
                </div>

                <div className="p-3 bg-amber-50/40 rounded-lg border border-amber-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Rocket className="w-3.5 h-3.5 text-amber-600" /> Stress & Concurrency Testing (k6)
                    </span>
                    <Badge variant="outline" className="bg-white text-amber-700 text-[10px] font-bold">
                      0 Overbooking Incidents
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Simulates 100,000 concurrent travelers and 1,000 POS transactions. Redis distributed locks (Redlock) verified with p95 latency &lt; 200ms.
                  </p>
                </div>
              </div>
            </div>

            {/* 21.3 CI/CD Deployment Architecture & DevOps */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Server className="w-5 h-5 text-[#00a8ff]" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    21.3 CI/CD Deployment Architecture & DevOps
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Automated delivery pipeline with zero-downtime rolling updates.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-slate-600" /> GitHub Actions PR Validation
                    </span>
                    <Badge variant="outline" className="bg-white text-slate-700 text-[10px]">
                      Strict Gate Active
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Every GitHub pull request enforces TypeScript strict typechecking (`tsc --noEmit`), ESLint, SonarQube static analysis, and full Vitest suite.
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-emerald-600" /> Blue-Green Kubernetes Zero-Downtime
                    </span>
                    <Badge variant="outline" className="bg-white text-emerald-700 text-[10px] font-bold">
                      0s Front Desk Downtime
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Traffic shifts seamlessly between Blue and Green deployments with Kubernetes rolling updates (`maxUnavailable: 0`), preventing front-desk interruptions.
                  </p>
                </div>

                <div className="p-3 bg-purple-50/40 rounded-lg border border-purple-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-950 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-purple-600" /> Multi-Region PostgreSQL WAL & PITR
                    </span>
                    <Badge variant="outline" className="bg-white text-purple-700 text-[10px] font-bold">
                      AES-256 S3 Snapshots
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Continuous PostgreSQL 16 WAL archiving allows recovery to the exact minute. Daily automated snapshots encrypted via AWS KMS with 30-day retention.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION C: 21.1 10-PHASE 64-WEEK MASTER DEVELOPMENT ROADMAP */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Kanban className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    21.1 10-Phase 64-Week Master Development Roadmap (Phases 1 to 10)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Sequential, milestone-driven engineering increments with defined exit gates and sprint plans.
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Total 32 Two-Week Sprints (64 Weeks)
              </span>
            </div>

            {/* List of 10 Phases */}
            <div className="space-y-3">
              {roadmapData?.phases?.map((phase) => {
                const isExpanded = expandedPhaseId === phase.phaseId;
                const isCompleted = phase.status === 'COMPLETED';
                const isInProgress = phase.status === 'IN_PROGRESS';

                return (
                  <div
                    key={phase.phaseId}
                    className={`rounded-xl border transition-all ${
                      isCompleted
                        ? 'border-slate-200 bg-white'
                        : isInProgress
                        ? 'border-sky-300 bg-sky-50/20 shadow-xs'
                        : 'border-purple-200 bg-purple-50/20'
                    }`}
                  >
                    {/* Phase Header Row */}
                    <div
                      onClick={() => setExpandedPhaseId(isExpanded ? null : phase.phaseId)}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/50 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isInProgress
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          P{phase.phaseNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">
                              Phase {phase.phaseNumber}: {phase.name}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold ${
                                isCompleted
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : isInProgress
                                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}
                            >
                              {phase.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{phase.focus}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-right">
                          <span className="font-bold text-slate-800 block">
                            {phase.timelineWeeks}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {phase.timelineMonths}
                          </span>
                        </div>
                        <div className="w-24 hidden sm:block">
                          <div className="flex justify-between text-[10px] font-semibold text-slate-600 mb-1">
                            <span>Progress</span>
                            <span>{phase.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isCompleted
                                  ? 'bg-emerald-500'
                                  : isInProgress
                                  ? 'bg-sky-500'
                                  : 'bg-purple-500'
                              }`}
                              style={{ width: `${phase.progressPercent}%` }}
                            />
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* Expandable Phase Details & Sprints */}
                    {isExpanded && (
                      <div className="p-4 pt-0 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          {/* Deliverables */}
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                              Core Engineering Deliverables &amp; Milestones:
                            </span>
                            <ul className="space-y-1.5 text-xs text-slate-700">
                              {phase.deliverables.map((d, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{d}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Exit Gate Criteria */}
                          <div className="space-y-3">
                            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/80">
                              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
                                Exit Gate / Acceptance Criteria:
                              </span>
                              <p className="text-xs text-amber-950 font-medium leading-relaxed">
                                &ldquo;{phase.exitGate}&rdquo;
                              </p>
                            </div>

                            {/* Sprints Mapping */}
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                Sprint Execution Breakdown:
                              </span>
                              <div className="space-y-1">
                                {phase.sprints.map((sprint) => (
                                  <div
                                    key={sprint.sprintNumber}
                                    className="p-2 rounded bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs"
                                  >
                                    <div className="truncate">
                                      <span className="font-semibold text-slate-900 block truncate">
                                        {sprint.title}
                                      </span>
                                      <span className="text-[10px] text-slate-500 truncate">
                                        Focus: {sprint.focus}
                                      </span>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className={`text-[9px] shrink-0 ${
                                        sprint.status === 'COMPLETED'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : 'bg-sky-50 text-sky-700 border-sky-200'
                                      }`}
                                    >
                                      {sprint.status}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}


      {/* ======================================================== */}
      {/* DRAWER / MODAL: VIEW DEFECT DETAILS & INVESTIGATION NOTES */}
      {/* ======================================================== */}
      {selectedBug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-[10px] bg-slate-50">
                  BUG-{selectedBug.id.slice(0, 8).toUpperCase()}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase font-bold ${
                    selectedBug.severity === 'critical'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {selectedBug.severity}
                </Badge>
              </div>
              <button onClick={() => setSelectedBug(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900">{selectedBug.title}</h3>
              <p className="text-xs text-slate-600 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200/60 leading-relaxed font-mono">
                {selectedBug.description}
              </p>
            </div>

            {/* Error Attachments (BugFile.php) */}
            {selectedBug.files && selectedBug.files.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Console Traces & Attachments (BugFile.php)
                </span>
                <div className="space-y-1.5">
                  {selectedBug.files.map((file) => (
                    <div
                      key={file.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 text-slate-800 font-mono truncate">
                        <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="truncate">{file.fileName}</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] bg-white">
                        {file.fileType}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Investigation Comments (BugComment.php) */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Developer Investigation Thread (BugComment.php)
              </span>

              <div className="max-h-40 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50/50 mb-3 text-xs">
                {selectedBug.comments && selectedBug.comments.length > 0 ? (
                  selectedBug.comments.map((cm) => (
                    <div key={cm.id} className="p-2 rounded bg-white border border-slate-200/60">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-semibold text-slate-700">{cm.userName || 'Lead Engineer'}</span>
                        <span>{new Date(cm.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-800">{cm.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-center py-2 text-[11px]">
                    No investigation notes logged yet.
                  </div>
                )}
              </div>

              {/* Add Comment */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={bugCommentText}
                  onChange={(e) => setBugCommentText(e.target.value)}
                  placeholder="Add resolution or investigation note..."
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-hidden focus:border-[#00a8ff]"
                />
                <Button
                  size="sm"
                  onClick={() =>
                    addBugCommentMutation.mutate({
                      bugId: selectedBug.id,
                      comment: bugCommentText,
                    })
                  }
                  disabled={!bugCommentText.trim() || addBugCommentMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs"
                >
                  Post Note
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedBug(null)} className="text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
