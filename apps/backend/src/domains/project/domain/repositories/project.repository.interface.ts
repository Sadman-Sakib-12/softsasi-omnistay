export const PROJECT_REPOSITORY_TOKEN = Symbol('IProjectRepository');

export interface IProjectRepository {
  // Projects & Milestones
  createProject(data: { tenantId: string; projectName: string; description?: string; startDate?: Date; endDate?: Date; status?: string }): Promise<any>;
  findProjects(tenantId: string): Promise<any[]>;
  findProjectById(id: string): Promise<any | null>;
  updateProject(id: string, data: Record<string, any>): Promise<any>;

  createMilestone(data: { projectId: string; title: string; dueDate: Date; status?: string }): Promise<any>;
  findMilestonesByProjectId(projectId: string): Promise<any[]>;

  createTask(data: { projectId: string; milestoneId?: string; title: string; description?: string; priority?: string; status?: string; dueDate?: Date; assignedTo?: string }): Promise<any>;
  findTasksByProjectId(projectId: string): Promise<any[]>;
  updateTask(id: string, data: Record<string, any>): Promise<any>;

  // Budgets & Expenses
  setBudget(data: { projectId: string; totalBudget: number }): Promise<any>;
  addExpense(data: { projectId: string; itemTitle: string; amount: number; expenseDate: Date }): Promise<any>;
  findBudgetByProjectId(projectId: string): Promise<any | null>;
  findExpensesByProjectId(projectId: string): Promise<any[]>;

  // Time Tracking & Timesheets
  createTimeTracker(data: { taskId?: string; userId: string; startTime: Date; isBillable?: boolean }): Promise<any>;
  stopTimeTracker(id: string, endTime: Date, durationSec: number): Promise<any>;
  findTimeTrackersByUser(userId: string): Promise<any[]>;
  createTrackPhoto(data: { trackerId: string; photoUrl: string }): Promise<any>;
  submitWeeklyTimesheet(data: { userId: string; weekNumber: number; year: number; totalHours: number; status?: string }): Promise<any>;
  findWeeklyTimesheets(userId: string): Promise<any[]>;

  // Bug Tracking
  createBug(data: { title: string; description: string; severity?: string; priority?: string; statusId?: string; reportedBy?: string; assignedTo?: string }): Promise<any>;
  findBugs(): Promise<any[]>;
  findBugById(id: string): Promise<any | null>;
  updateBug(id: string, data: Record<string, any>): Promise<any>;
  createBugComment(data: { bugId: string; userId: string; comment: string }): Promise<any>;
  findBugStatuses(): Promise<any[]>;
  createBugStatus(data: { name: string; displayOrder?: number }): Promise<any>;
}
