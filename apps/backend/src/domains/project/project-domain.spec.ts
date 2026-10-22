import { describe, expect, it } from 'vitest';
import { ProjectService } from './application/services/project.service.js';
import { TimesheetService } from './application/services/timesheet.service.js';
import { BugTrackerService } from './application/services/bug-tracker.service.js';
import { IProjectRepository } from './domain/repositories/project.repository.interface.js';

describe('Chapter 16: Project & Asset Management / Bug Tracking', () => {
  const mockProjects: any[] = [];
  const mockMilestones: any[] = [];
  const mockTasks: any[] = [];
  const mockBudgets: any[] = [];
  const mockExpenses: any[] = [];
  const mockTimeLogs: any[] = [];
  const mockPhotos: any[] = [];
  const mockWeekly: any[] = [];
  const mockBugs: any[] = [];
  const mockStatuses: any[] = [
    { id: 'stat-1', name: 'New', displayOrder: 1 },
    { id: 'stat-2', name: 'In Progress', displayOrder: 2 },
    { id: 'stat-3', name: 'Resolved', displayOrder: 3 },
  ];
  const mockComments: any[] = [];

  const mockRepo: IProjectRepository = {
    async createProject(data) {
      const p = { id: `proj-${Date.now()}`, ...data, createdAt: new Date() };
      mockProjects.push(p);
      return p;
    },
    async findProjects(tenantId) {
      return mockProjects.filter((p) => p.tenantId === tenantId);
    },
    async findProjectById(id) {
      return mockProjects.find((p) => p.id === id) || null;
    },
    async updateProject(id, data) {
      const p = mockProjects.find((item) => item.id === id);
      if (p) Object.assign(p, data);
      return p;
    },
    async createMilestone(data) {
      const m = { id: `mile-${Date.now()}`, ...data, createdAt: new Date() };
      mockMilestones.push(m);
      return m;
    },
    async findMilestonesByProjectId(projectId) {
      return mockMilestones.filter((m) => m.projectId === projectId);
    },
    async createTask(data) {
      const t = { id: `task-${Date.now()}`, ...data, createdAt: new Date() };
      mockTasks.push(t);
      return t;
    },
    async findTasksByProjectId(projectId) {
      return mockTasks.filter((t) => t.projectId === projectId);
    },
    async updateTask(id, data) {
      const t = mockTasks.find((item) => item.id === id);
      if (t) Object.assign(t, data);
      return t;
    },
    async setBudget(data) {
      const b = { id: `bud-${Date.now()}`, ...data, createdAt: new Date() };
      mockBudgets.push(b);
      return b;
    },
    async addExpense(data) {
      const e = { id: `exp-${Date.now()}`, ...data, createdAt: new Date() };
      mockExpenses.push(e);
      return e;
    },
    async findBudgetByProjectId(projectId) {
      return mockBudgets.find((b) => b.projectId === projectId) || null;
    },
    async findExpensesByProjectId(projectId) {
      return mockExpenses.filter((e) => e.projectId === projectId);
    },
    async createTimeTracker(data) {
      const tr = { id: `tr-${Date.now()}`, ...data, createdAt: new Date() };
      mockTimeLogs.push(tr);
      return tr;
    },
    async stopTimeTracker(id, endTime, durationSec) {
      const tr = mockTimeLogs.find((t) => t.id === id);
      if (tr) {
        tr.endTime = endTime;
        tr.durationSec = durationSec;
      }
      return tr;
    },
    async findTimeTrackersByUser(userId) {
      return mockTimeLogs.filter((t) => t.userId === userId);
    },
    async createTrackPhoto(data) {
      const ph = { id: `ph-${Date.now()}`, ...data, capturedAt: new Date() };
      mockPhotos.push(ph);
      return ph;
    },
    async submitWeeklyTimesheet(data) {
      mockWeekly.push(data);
      return data;
    },
    async findWeeklyTimesheets(userId) {
      return mockWeekly.filter((w) => w.userId === userId);
    },
    async createBug(data) {
      const b = { id: `bug-${Date.now()}`, ...data, createdAt: new Date() };
      mockBugs.push(b);
      return b;
    },
    async findBugs() {
      return mockBugs;
    },
    async findBugById(id) {
      return mockBugs.find((b) => b.id === id) || null;
    },
    async updateBug(id, data) {
      const b = mockBugs.find((item) => item.id === id);
      if (b) Object.assign(b, data);
      return b;
    },
    async createBugComment(data) {
      const c = { id: `comm-${Date.now()}`, ...data, createdAt: new Date() };
      mockComments.push(c);
      return c;
    },
    async findBugStatuses() {
      return mockStatuses;
    },
    async createBugStatus(data) {
      const st = { id: `stat-${Date.now()}`, ...data };
      mockStatuses.push(st);
      return st;
    },
  };

  const projectService = new ProjectService(mockRepo);
  const timesheetService = new TimesheetService(mockRepo);
  const bugService = new BugTrackerService(mockRepo);

  it('16.1: should create hotel renovation project, add milestones and compute Gantt budget variance', async () => {
    const proj = await projectService.createProject('tenant-1', {
      projectName: 'Presidential Suite Refurbishment',
      description: 'Upgrading master bathrooms and smart lighting',
      startDate: '2026-11-01',
      endDate: '2026-12-15',
    });
    expect(proj.projectName).toBe('Presidential Suite Refurbishment');

    await projectService.addMilestone(proj.id, {
      title: 'Demolition & Framing Complete',
      dueDate: '2026-11-15',
    });

    await projectService.addTask(proj.id, {
      title: 'Install Italian Marble Vanities',
      priority: 'high',
    });

    await projectService.setBudget(proj.id, { totalBudget: 50000 });
    await projectService.addExpense(proj.id, {
      itemTitle: 'Carrara Marble Slabs',
      amount: 15000,
    });

    const gantt = await projectService.getGanttTimeline(proj.id);
    expect(gantt.milestones.length).toBe(1);
    expect(gantt.tasks.length).toBe(1);
    expect(gantt.financials.allocatedBudget).toBe(50000);
    expect(gantt.financials.totalSpent).toBe(15000);
    expect(gantt.financials.variance).toBe(35000);
    expect(gantt.financials.isOverBudget).toBe(false);
  });

  it('16.2: should track work time duration and submit weekly timesheet with screenshot proof', async () => {
    const tracker = await timesheetService.startTracking('user-contractor-1', {
      taskId: 'task-101',
      isBillable: true,
    });
    expect(tracker.userId).toBe('user-contractor-1');

    const stopped = await timesheetService.stopTracking(tracker.id, {
      photoUrl: 'https://cdn.omnistay.com/timeproof/snap101.jpg',
    });
    expect(stopped.proofPhotoCaptured).toBe(true);
    expect(stopped.tracker.durationSec).toBe(3600);

    const sheet = await timesheetService.submitWeeklyTimesheet('user-contractor-1', {
      weekNumber: 42,
      year: 2026,
      totalHours: 38.5,
    });
    expect(sheet.totalHours).toBe(38.5);
    expect(sheet.status).toBe('submitted');
  });

  it('16.3: should manage internal bug ticket lifecycle and comments', async () => {
    const bug = await bugService.createBug('qa-engineer-1', {
      title: 'KDS display screen delay during peak orders',
      description: 'Orders take 4 seconds to route to Salad station',
      severity: 'major',
      priority: 'high',
    });
    expect(bug.title).toBe('KDS display screen delay during peak orders');

    const updated = await bugService.updateStatus(bug.id, {
      statusId: 'stat-2', // In Progress
    });
    expect(updated.statusId).toBe('stat-2');

    const comment = await bugService.addComment(bug.id, 'lead-dev-1', {
      comment: 'Optimized BullMQ Redis consumer concurrency from 1 to 5.',
    });
    expect(comment.comment).toContain('Optimized BullMQ Redis consumer');
  });
});
