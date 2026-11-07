import { api } from '@/lib/api/client';

export interface MilestoneItem {
  id: string;
  projectId: string;
  title: string;
  dueDate: string;
  status: string;
  tasksCount?: number;
}

export interface TaskItem {
  id: string;
  projectId: string;
  milestoneId?: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  assignedTo?: string;
  isCriticalPath?: boolean;
  startMonth?: number;
  durationMonths?: number;
  dependencies?: string[];
}

export interface BudgetItem {
  id: string;
  projectId: string;
  totalBudget: number;
}

export interface ExpenseItem {
  id: string;
  projectId: string;
  itemTitle: string;
  amount: number;
  expenseDate: string;
}

export interface ProjectItem {
  id: string;
  projectName: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  budget?: BudgetItem;
  expenses?: ExpenseItem[];
  milestones?: MilestoneItem[];
  tasks?: TaskItem[];
  financials?: {
    allocatedBudget: number;
    totalSpent: number;
    variance: number;
    isOverBudget: boolean;
  };
}

export interface ProjectOverviewData {
  projects: ProjectItem[];
  summary: {
    totalProjects: number;
    activeProjects: number;
    totalBudget: number;
    totalSpent: number;
    overallVariance: number;
  };
}

export interface TrackPhotoItem {
  id: string;
  trackerId: string;
  photoUrl: string;
  capturedAt: string;
}

export interface TimeTrackerItem {
  id: string;
  taskId?: string;
  userId: string;
  startTime: string;
  endTime?: string;
  durationSec?: number;
  isBillable: boolean;
  taskTitle?: string;
  projectName?: string;
  photos?: TrackPhotoItem[];
}

export interface WeeklyTimesheetItem {
  id: string;
  userId: string;
  weekNumber: number;
  year: number;
  totalHours: number;
  status: string;
  submittedAt?: string;
  userName?: string;
}

export interface TimesheetOverviewData {
  activeTrackers: TimeTrackerItem[];
  recentLogs: TimeTrackerItem[];
  weeklyTimesheets: WeeklyTimesheetItem[];
  summary: {
    totalTrackers: number;
    billableHours: number;
    nonBillableHours: number;
    billableRatio: number;
    pendingTimesheets: number;
  };
}

export interface BugFileItem {
  id: string;
  bugId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
}

export interface BugCommentItem {
  id: string;
  bugId: string;
  userId: string;
  userName?: string;
  comment: string;
  createdAt: string;
}

export interface BugStatusItem {
  id: string;
  name: string;
  displayOrder: number;
}

export interface BugItem {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'major' | 'minor' | 'normal';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  statusId: string;
  status?: BugStatusItem;
  reportedBy?: string;
  assignedTo?: string;
  createdAt: string;
  comments?: BugCommentItem[];
  files?: BugFileItem[];
}

export interface BugOverviewData {
  bugs: BugItem[];
  statuses: BugStatusItem[];
  summary: {
    totalBugs: number;
    openBugs: number;
    criticalBugs: number;
    resolvedBugs: number;
  };
}

export interface CreateProjectDto {
  projectName: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  totalBudget?: number;
}

export interface CreateMilestoneDto {
  title: string;
  dueDate: string;
  status?: string;
}

export interface CreateTaskDto {
  title: string;
  milestoneId?: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
  assignedTo?: string;
}

export interface AddExpenseDto {
  itemTitle: string;
  amount: number;
  expenseDate?: string;
}

export interface StartTrackerDto {
  taskId?: string;
  isBillable?: boolean;
}

export interface StopTrackerDto {
  photoUrl?: string;
}

export interface SubmitTimesheetDto {
  weekNumber: number;
  year: number;
  totalHours: number;
}

export interface CreateBugDto {
  title: string;
  description: string;
  severity?: 'critical' | 'major' | 'minor' | 'normal';
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  assignedTo?: string;
}

export const projectsService = {
  // 16.1 Hotel Renovation Projects & Milestones
  getProjectOverview: async (): Promise<ProjectOverviewData> => {
    try {
      const res = await api.get<any>('/api/v1/projects/overview');
      return res?.data || res;
    } catch (error) {
      console.error('Failed to load project overview', error);
      return {
        projects: [],
        summary: { totalProjects: 0, activeProjects: 0, totalBudget: 0, totalSpent: 0, overallVariance: 0 },
      };
    }
  },

  createProject: async (dto: CreateProjectDto): Promise<any> => {
    const res = await api.post<any>('/api/v1/projects', dto);
    if (dto.totalBudget && res?.id) {
      try {
        await api.post(`/api/v1/projects/${res.id}/budget`, { totalBudget: dto.totalBudget });
      } catch (e) {
        console.warn('Budget auto-set failed', e);
      }
    }
    return res?.data || res;
  },

  addMilestone: async (projectId: string, dto: CreateMilestoneDto): Promise<any> => {
    const res = await api.post<any>(`/api/v1/projects/${projectId}/milestones`, dto);
    return res?.data || res;
  },

  addTask: async (projectId: string, dto: CreateTaskDto): Promise<any> => {
    const res = await api.post<any>(`/api/v1/projects/${projectId}/tasks`, dto);
    return res?.data || res;
  },

  addExpense: async (projectId: string, dto: AddExpenseDto): Promise<any> => {
    const res = await api.post<any>(`/api/v1/projects/${projectId}/expenses`, dto);
    return res?.data || res;
  },

  // 16.2 Timesheets & Desktop Time Tracker
  getTimesheetOverview: async (): Promise<TimesheetOverviewData> => {
    try {
      const res = await api.get<any>('/api/v1/projects/timesheets/overview');
      return res?.data || res;
    } catch (error) {
      console.error('Failed to load timesheet overview', error);
      return {
        activeTrackers: [],
        recentLogs: [],
        weeklyTimesheets: [],
        summary: { totalTrackers: 0, billableHours: 0, nonBillableHours: 0, billableRatio: 0, pendingTimesheets: 0 },
      };
    }
  },

  startTracker: async (dto: StartTrackerDto): Promise<any> => {
    const res = await api.post<any>('/api/v1/projects/timesheets/start', dto);
    return res?.data || res;
  },

  stopTracker: async (trackerId: string, dto: StopTrackerDto): Promise<any> => {
    const res = await api.post<any>(`/api/v1/projects/timesheets/${trackerId}/stop`, dto);
    return res?.data || res;
  },

  submitWeeklyTimesheet: async (dto: SubmitTimesheetDto): Promise<any> => {
    const res = await api.post<any>('/api/v1/projects/timesheets/weekly', dto);
    return res?.data || res;
  },

  // 16.3 Internal Bug & Defect Tracking
  getBugOverview: async (): Promise<BugOverviewData> => {
    try {
      const res = await api.get<any>('/api/v1/projects/bugs/overview');
      return res?.data || res;
    } catch (error) {
      console.error('Failed to load bug overview', error);
      return {
        bugs: [],
        statuses: [],
        summary: { totalBugs: 0, openBugs: 0, criticalBugs: 0, resolvedBugs: 0 },
      };
    }
  },

  createBug: async (dto: CreateBugDto): Promise<any> => {
    const res = await api.post<any>('/api/v1/projects/bugs', dto);
    return res?.data || res;
  },

  updateBugStatus: async (bugId: string, statusId: string): Promise<any> => {
    const res = await api.patch<any>(`/api/v1/projects/bugs/${bugId}/status`, { statusId });
    return res?.data || res;
  },

  addBugComment: async (bugId: string, comment: string): Promise<any> => {
    const res = await api.post<any>(`/api/v1/projects/bugs/${bugId}/comments`, { comment });
    return res?.data || res;
  },

  // Chapter 21: Developer Implementation Roadmap & 64-Week Sprint Blueprint
  getRoadmapMaster: async (): Promise<RoadmapMasterData> => {
    const res = await api.get<any>('/api/v1/developer/roadmap');
    return res?.data || res;
  },

  getDodChecklist: async (): Promise<DoDChecklistData> => {
    const res = await api.get<any>('/api/v1/developer/dod-checklist');
    return res?.data || res;
  },

  getQaMetrics: async (): Promise<any> => {
    const res = await api.get<any>('/api/v1/developer/qa-metrics');
    return res?.data || res;
  },

  getCiCdArchitecture: async (): Promise<any> => {
    const res = await api.get<any>('/api/v1/developer/cicd');
    return res?.data || res;
  },
};

export interface RoadmapSprint {
  sprintNumber: number;
  title: string;
  focus: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' | 'HARDENING';
}

export interface RoadmapPhase {
  phaseNumber: number;
  phaseId: string;
  name: string;
  focus: string;
  timelineWeeks: string;
  timelineMonths: string;
  weekStart: number;
  weekEnd: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' | 'HARDENING';
  progressPercent: number;
  deliverables: string[];
  exitGate: string;
  sprints: RoadmapSprint[];
}

export interface RoadmapMasterData {
  title: string;
  totalPhases: number;
  completedPhases: number;
  totalWeeks: number;
  totalMonths: number;
  overallProgressPercent: number;
  phases: RoadmapPhase[];
}

export interface DoDChecklistItem {
  id: string;
  category: string;
  title: string;
  requirement: string;
  verificationMethod: string;
  isCompliant: boolean;
  auditEvidence: string;
}

export interface DoDChecklistData {
  title: string;
  totalItems: number;
  compliantCount: number;
  compliancePercent: number;
  isProductionReady: boolean;
  items: DoDChecklistItem[];
}

