import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IProjectRepository } from '../../domain/repositories/project.repository.interface.js';

function normalizeUuid(val?: string | null): string {
  if (!val) return '00000000-0000-4000-a000-000000000001';
  const clean = val.replace(/[^a-fA-F0-9]/g, '');
  if (clean.length === 32) {
    return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
  }
  const hex = Buffer.from(val).toString('hex').padEnd(32, '0').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4000-a000-${hex.slice(20)}`;
}

export const CANONICAL_PROJECT_ID = '00000000-0000-4000-a000-000000000001';
export const CANONICAL_USER_ID = '00000000-0000-4000-a000-000000000002';

@Injectable()
export class PrismaProjectRepository implements IProjectRepository, OnModuleInit {
  private readonly logger = new Logger(PrismaProjectRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureCanonicalSeed();
  }

  async ensureCanonicalSeed(): Promise<void> {
    try {
      const projectCount = await this.prisma.project.count();
      if (projectCount > 0) return;

      this.logger.log('Seeding canonical Chapter 16 Projects, Milestones, Budgets, Timesheets & Bugs...');

      const defaultTenantId = normalizeUuid('tenant-softsasi-master');
      const defaultUserId = normalizeUuid('user-sakib-pm');

      // 1. Seed Bug Statuses
      const statusNew = await this.prisma.bugStatus.upsert({
        where: { name: 'New' },
        create: { id: normalizeUuid('bug-status-new'), name: 'New', displayOrder: 1 },
        update: {},
      });
      const statusInProgress = await this.prisma.bugStatus.upsert({
        where: { name: 'In Progress' },
        create: { id: normalizeUuid('bug-status-in-progress'), name: 'In Progress', displayOrder: 2 },
        update: {},
      });
      const statusUnderReview = await this.prisma.bugStatus.upsert({
        where: { name: 'Under Review' },
        create: { id: normalizeUuid('bug-status-under-review'), name: 'Under Review', displayOrder: 3 },
        update: {},
      });
      const statusResolved = await this.prisma.bugStatus.upsert({
        where: { name: 'Resolved' },
        create: { id: normalizeUuid('bug-status-resolved'), name: 'Resolved', displayOrder: 4 },
        update: {},
      });
      const statusClosed = await this.prisma.bugStatus.upsert({
        where: { name: 'Closed' },
        create: { id: normalizeUuid('bug-status-closed'), name: 'Closed', displayOrder: 5 },
        update: {},
      });

      // 2. Seed 3 Real Hotel Renovation & Special Event Projects
      const proj1 = await this.prisma.project.create({
        data: {
          id: normalizeUuid('proj-grand-palace-retrofit'),
          tenantId: defaultTenantId,
          projectName: 'Grand Palace Ocean Wing Complete Modernization & Luxury Retrofit',
          description:
            'Complete 5-star transformation of 40 suites: Italian Calacatta marble bathrooms, VingCard BLE door locks, and BACnet HVAC energy automation.',
          startDate: new Date('2026-08-01'),
          endDate: new Date('2027-02-28'),
          status: 'Active Renovation',
        },
      });

      const proj2 = await this.prisma.project.create({
        data: {
          id: normalizeUuid('proj-skyline-infinity-pool'),
          tenantId: defaultTenantId,
          projectName: 'Skyline Rooftop Infinity Pool & Sunken Sunset Cabanas',
          description:
            'Rooftop lounge overhaul featuring a 25m heated glass-edge infinity pool, 12 private cabanas, and high-velocity cocktail bar.',
          startDate: new Date('2026-10-15'),
          endDate: new Date('2027-04-30'),
          status: 'Architectural Design',
        },
      });

      const proj3 = await this.prisma.project.create({
        data: {
          id: normalizeUuid('proj-global-hospitality-gala'),
          tenantId: defaultTenantId,
          projectName: 'Annual Softsasi Global Hospitality Gala & Awards 2026',
          description:
            'VIP gala banquet, keynote stage production, ballroom audiovisuals, and multi-course Michelin-starred guest chef banquet.',
          startDate: new Date('2026-11-01'),
          endDate: new Date('2026-12-20'),
          status: 'Contractor Procurement',
        },
      });

      // 3. Seed 6-Stage Milestones for Project 1 (Chapter 16.1)
      const m1 = await this.prisma.projectMilestone.create({
        data: {
          id: normalizeUuid('milestone-phase-1'),
          projectId: proj1.id,
          title: 'Stage 1: Planning & Architectural Drawings',
          dueDate: new Date('2026-08-30'),
          status: 'completed',
        },
      });
      const m2 = await this.prisma.projectMilestone.create({
        data: {
          id: normalizeUuid('milestone-phase-2'),
          projectId: proj1.id,
          title: 'Stage 2: Municipal Safety Permits & Structural Engineering',
          dueDate: new Date('2026-09-20'),
          status: 'completed',
        },
      });
      const m3 = await this.prisma.projectMilestone.create({
        data: {
          id: normalizeUuid('milestone-phase-3'),
          projectId: proj1.id,
          title: 'Stage 3: MEP & General Contractor Procurement',
          dueDate: new Date('2026-10-15'),
          status: 'completed',
        },
      });
      const m4 = await this.prisma.projectMilestone.create({
        data: {
          id: normalizeUuid('milestone-phase-4'),
          projectId: proj1.id,
          title: 'Stage 4: Active Interior Demo & MEP Fit-Out',
          dueDate: new Date('2026-12-15'),
          status: 'in_progress',
        },
      });
      const m5 = await this.prisma.projectMilestone.create({
        data: {
          id: normalizeUuid('milestone-phase-5'),
          projectId: proj1.id,
          title: 'Stage 5: Final Quality Inspection & Acoustic Testing',
          dueDate: new Date('2027-01-20'),
          status: 'pending',
        },
      });
      const m6 = await this.prisma.projectMilestone.create({
        data: {
          id: normalizeUuid('milestone-phase-6'),
          projectId: proj1.id,
          title: 'Stage 6: Handover & Grand Re-opening Certification',
          dueDate: new Date('2027-02-28'),
          status: 'pending',
        },
      });

      // 4. Seed Tasks with Gantt Dependencies & Critical Path
      const t1 = await this.prisma.projectTask.create({
        data: {
          id: normalizeUuid('task-demo-existing'),
          projectId: proj1.id,
          milestoneId: m4.id,
          title: 'Demolition of Existing Fixtures & Partition Walls',
          description: 'Remove legacy carpets, outdated plumbing fixtures, and acoustic partition panels.',
          priority: 'high',
          status: 'done',
          dueDate: new Date('2026-10-30'),
          assignedTo: defaultUserId,
        },
      });

      const t2 = await this.prisma.projectTask.create({
        data: {
          id: normalizeUuid('task-hvac-ducting'),
          projectId: proj1.id,
          milestoneId: m4.id,
          title: 'Central HVAC Ducting & Honeywell Thermostat Retrofit',
          description: 'Install low-noise dual-zone variable refrigerant flow (VRF) fan coil units with BACnet gateway.',
          priority: 'critical',
          status: 'in_progress',
          dueDate: new Date('2026-11-25'),
          assignedTo: defaultUserId,
        },
      });

      const t3 = await this.prisma.projectTask.create({
        data: {
          id: normalizeUuid('task-marble-flooring'),
          projectId: proj1.id,
          milestoneId: m4.id,
          title: 'Calacatta Gold Marble Bathroom Flooring & Vanity Slabs',
          description: 'Precision waterjet cutting and seamless sealing of luxury Italian marble in all 40 master en-suites.',
          priority: 'high',
          status: 'in_progress',
          dueDate: new Date('2026-12-05'),
          assignedTo: defaultUserId,
        },
      });

      const t4 = await this.prisma.projectTask.create({
        data: {
          id: normalizeUuid('task-smart-locks'),
          projectId: proj1.id,
          milestoneId: m5.id,
          title: 'VingCard BLE Smart Locksets Installation & Zigbee Commissioning',
          description: 'Mount electronic mortise locks and pair with gateway for &lt;400ms mobile key unlocks.',
          priority: 'critical',
          status: 'todo',
          dueDate: new Date('2027-01-10'),
          assignedTo: defaultUserId,
        },
      });

      // Seed Task Dependencies (t2 depends on t1, t4 depends on t3)
      await this.prisma.projectTaskDependency.createMany({
        data: [
          {
            id: normalizeUuid('dep-t1-t2'),
            taskId: t2.id,
            dependsOnTaskId: t1.id,
          },
          {
            id: normalizeUuid('dep-t3-t4'),
            taskId: t4.id,
            dependsOnTaskId: t3.id,
          },
        ],
      });

      // 5. Seed Budget & Actual Expenses (Variance Tracking - Chapter 16.1)
      await this.prisma.projectBudget.create({
        data: {
          id: normalizeUuid('budget-proj-1'),
          projectId: proj1.id,
          totalBudget: 450000.0,
          spentAmount: 287500.0,
        },
      });
      await this.prisma.projectBudget.create({
        data: {
          id: normalizeUuid('budget-proj-2'),
          projectId: proj2.id,
          totalBudget: 220000.0,
          spentAmount: 68500.0,
        },
      });
      await this.prisma.projectBudget.create({
        data: {
          id: normalizeUuid('budget-proj-3'),
          projectId: proj3.id,
          totalBudget: 85000.0,
          spentAmount: 42000.0,
        },
      });

      await this.prisma.projectExpense.createMany({
        data: [
          {
            id: normalizeUuid('exp-1'),
            projectId: proj1.id,
            itemTitle: 'Apex Contractors Ltd - Structural Demo Phase 1',
            amount: 85000.0,
            expenseDate: new Date('2026-10-10'),
          },
          {
            id: normalizeUuid('exp-2'),
            projectId: proj1.id,
            itemTitle: 'Marmi Di Carrara SpA - Calacatta Gold Marble Slabs',
            amount: 62500.0,
            expenseDate: new Date('2026-10-18'),
          },
          {
            id: normalizeUuid('exp-3'),
            projectId: proj1.id,
            itemTitle: 'Schneider & Honeywell - BACnet Thermostat Controllers',
            amount: 45000.0,
            expenseDate: new Date('2026-10-24'),
          },
          {
            id: normalizeUuid('exp-4'),
            projectId: proj1.id,
            itemTitle: 'Assa Abloy / VingCard - 40x Commercial BLE Locksets',
            amount: 38000.0,
            expenseDate: new Date('2026-10-29'),
          },
          {
            id: normalizeUuid('exp-5'),
            projectId: proj1.id,
            itemTitle: 'MEP Electrical & Piping Labor Payroll (Oct 2026)',
            amount: 57000.0,
            expenseDate: new Date('2026-11-02'),
          },
        ],
      });

      // 6. Seed Timesheets & TimeTracker with Desktop Screenshots (Chapter 16.2)
      const tracker1 = await this.prisma.timeTracker.create({
        data: {
          id: normalizeUuid('tracker-001'),
          taskId: t2.id,
          userId: defaultUserId,
          startTime: new Date(Date.now() - 3600000 * 5),
          endTime: new Date(Date.now() - 3600000 * 1),
          durationSec: 14400, // 4 hours
          isBillable: true,
        },
      });
      const tracker2 = await this.prisma.timeTracker.create({
        data: {
          id: normalizeUuid('tracker-002'),
          taskId: t3.id,
          userId: defaultUserId,
          startTime: new Date(Date.now() - 3600000 * 9),
          endTime: new Date(Date.now() - 3600000 * 6),
          durationSec: 10800, // 3 hours
          isBillable: true,
        },
      });
      const tracker3 = await this.prisma.timeTracker.create({
        data: {
          id: normalizeUuid('tracker-003'),
          taskId: t1.id,
          userId: defaultUserId,
          startTime: new Date(Date.now() - 3600000 * 24),
          endTime: new Date(Date.now() - 3600000 * 22),
          durationSec: 7200, // 2 hours
          isBillable: false, // Internal cost allocation
        },
      });

      // Screen verification snapshots (TrackPhoto.php)
      await this.prisma.trackPhoto.createMany({
        data: [
          {
            id: normalizeUuid('photo-001'),
            trackerId: tracker1.id,
            photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
            capturedAt: new Date(Date.now() - 3600000 * 3),
          },
          {
            id: normalizeUuid('photo-002'),
            trackerId: tracker2.id,
            photoUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
            capturedAt: new Date(Date.now() - 3600000 * 7),
          },
        ],
      });

      // Weekly Timesheets
      await this.prisma.employeeWeeklyTimesheet.createMany({
        data: [
          {
            id: normalizeUuid('weekly-w44'),
            userId: defaultUserId,
            weekNumber: 44,
            year: 2026,
            totalHours: 42.5,
            status: 'Approved',
            submittedAt: new Date('2026-11-01'),
          },
          {
            id: normalizeUuid('weekly-w45'),
            userId: defaultUserId,
            weekNumber: 45,
            year: 2026,
            totalHours: 38.0,
            status: 'Submitted',
            submittedAt: new Date('2026-11-05'),
          },
        ],
      });

      // 7. Seed Internal Bug & Defect Tracking (Chapter 16.3)
      const bug1 = await this.prisma.bug.create({
        data: {
          id: normalizeUuid('bug-001'),
          title: 'Booking Engine Direct Checkout Gateway 3D-Secure Timeout on AMEX Cards',
          description:
            'Travelers attempting checkout with corporate American Express cards experience 3DS challenge timeout on Safari iOS. Transaction drops before webhook callback.',
          severity: 'Critical',
          priority: 'Critical',
          statusId: statusInProgress.id,
          reportedBy: defaultUserId,
          assignedTo: defaultUserId,
        },
      });

      const bug2 = await this.prisma.bug.create({
        data: {
          id: normalizeUuid('bug-002'),
          title: 'Kitchen Display System (KDS) Thermal Printer Ticket Delay Under Peak Velocity',
          description:
            'When simultaneous in-room dining orders exceed 40 tickets during dinner rush, socket buffer latency increases up to 90 seconds before firing to printer.',
          severity: 'Major',
          priority: 'High',
          statusId: statusUnderReview.id,
          reportedBy: defaultUserId,
          assignedTo: defaultUserId,
        },
      });

      const bug3 = await this.prisma.bug.create({
        data: {
          id: normalizeUuid('bug-003'),
          title: 'Guest Portal Dark Mode Contrast Ratio on Navigation Breadcrumbs',
          description:
            'Breadcrumb navigation link text on dark slate header fails WCAG AA 4.5:1 minimum contrast ratio requirement.',
          severity: 'Minor',
          priority: 'Normal',
          statusId: statusResolved.id,
          reportedBy: defaultUserId,
          assignedTo: defaultUserId,
        },
      });

      // Bug Comments & Files
      await this.prisma.bugComment.createMany({
        data: [
          {
            id: normalizeUuid('comment-001'),
            bugId: bug1.id,
            userId: defaultUserId,
            comment: 'Investigated gateway webhook logs: AMEX MPI server returns HTTP 504 on 3DS v2.2 challenge redirect. Adding fallback timeout handler.',
          },
          {
            id: normalizeUuid('comment-002'),
            bugId: bug2.id,
            userId: defaultUserId,
            comment: 'Identified Redis socket bottleneck in KDS gateway. Implementing batched queue emission with 150ms debounce.',
          },
        ],
      });

      await this.prisma.bugFile.createMany({
        data: [
          {
            id: normalizeUuid('file-001'),
            bugId: bug1.id,
            fileUrl: 'https://storage.omnistay.com/logs/amex_3ds_timeout_console.log',
            fileName: 'amex_3ds_timeout_console.log',
          },
          {
            id: normalizeUuid('file-002'),
            bugId: bug2.id,
            fileUrl: 'https://storage.omnistay.com/logs/kds_socket_buffer_trace.png',
            fileName: 'kds_socket_buffer_trace.png',
          },
        ],
      });

      this.logger.log('Canonical Chapter 16 project data seeding completed.');
    } catch (err: any) {
      this.logger.warn(`Canonical project seeding check skipped: ${err?.message || err}`);
    }
  }

  // --- Projects & Milestones ---
  async createProject(data: any) {
    const tenantId = normalizeUuid(data.tenantId);
    return this.prisma.project.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async findProjects(tenantId: string) {
    await this.ensureCanonicalSeed();
    const cleanTenantId = normalizeUuid(tenantId);
    return this.prisma.project.findMany({
      where: {
        OR: [{ tenantId: cleanTenantId }, { tenantId: normalizeUuid('tenant-softsasi-master') }],
      },
      include: {
        milestones: { orderBy: { dueDate: 'asc' } },
        tasks: true,
        budgets: true,
        expenses: { orderBy: { expenseDate: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findProjectById(id: string) {
    await this.ensureCanonicalSeed();
    const cleanId = normalizeUuid(id);
    return this.prisma.project.findUnique({
      where: { id: cleanId },
      include: {
        milestones: { orderBy: { dueDate: 'asc' } },
        tasks: {
          include: {
            dependencies: true,
            dependents: true,
            timeLogs: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        budgets: true,
        expenses: { orderBy: { expenseDate: 'desc' } },
        members: true,
      },
    });
  }

  async updateProject(id: string, data: Record<string, any>) {
    const cleanId = normalizeUuid(id);
    return this.prisma.project.update({ where: { id: cleanId }, data });
  }

  async createMilestone(data: any) {
    const projectId = normalizeUuid(data.projectId);
    return this.prisma.projectMilestone.create({
      data: {
        ...data,
        projectId,
      },
    });
  }

  async findMilestonesByProjectId(projectId: string) {
    await this.ensureCanonicalSeed();
    const cleanProjectId = normalizeUuid(projectId);
    return this.prisma.projectMilestone.findMany({
      where: { projectId: cleanProjectId },
      orderBy: { dueDate: 'asc' },
    });
  }

  async createTask(data: any) {
    const projectId = normalizeUuid(data.projectId);
    const milestoneId = data.milestoneId ? normalizeUuid(data.milestoneId) : undefined;
    const assignedTo = data.assignedTo ? normalizeUuid(data.assignedTo) : undefined;
    return this.prisma.projectTask.create({
      data: {
        ...data,
        projectId,
        milestoneId,
        assignedTo,
      },
    });
  }

  async findTasksByProjectId(projectId: string) {
    await this.ensureCanonicalSeed();
    const cleanProjectId = normalizeUuid(projectId);
    return this.prisma.projectTask.findMany({
      where: { projectId: cleanProjectId },
      include: { milestone: true, dependencies: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateTask(id: string, data: Record<string, any>) {
    const cleanId = normalizeUuid(id);
    return this.prisma.projectTask.update({ where: { id: cleanId }, data });
  }

  // --- Budgets & Expenses ---
  async setBudget(data: any) {
    const projectId = normalizeUuid(data.projectId);
    return this.prisma.projectBudget.create({
      data: {
        ...data,
        projectId,
      },
    });
  }

  async addExpense(data: any) {
    const projectId = normalizeUuid(data.projectId);
    return this.prisma.projectExpense.create({
      data: {
        ...data,
        projectId,
      },
    });
  }

  async findBudgetByProjectId(projectId: string) {
    await this.ensureCanonicalSeed();
    const cleanProjectId = normalizeUuid(projectId);
    return this.prisma.projectBudget.findFirst({
      where: { projectId: cleanProjectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findExpensesByProjectId(projectId: string) {
    await this.ensureCanonicalSeed();
    const cleanProjectId = normalizeUuid(projectId);
    return this.prisma.projectExpense.findMany({
      where: { projectId: cleanProjectId },
      orderBy: { expenseDate: 'desc' },
    });
  }

  // --- Time Tracking & Timesheets ---
  async createTimeTracker(data: any) {
    const taskId = data.taskId ? normalizeUuid(data.taskId) : undefined;
    const userId = normalizeUuid(data.userId);
    return this.prisma.timeTracker.create({
      data: {
        ...data,
        taskId,
        userId,
      },
    });
  }

  async stopTimeTracker(id: string, endTime: Date, durationSec: number) {
    const cleanId = normalizeUuid(id);
    return this.prisma.timeTracker.update({
      where: { id: cleanId },
      data: { endTime, durationSec },
    });
  }

  async findTimeTrackersByUser(userId: string) {
    await this.ensureCanonicalSeed();
    const cleanUserId = normalizeUuid(userId);
    return this.prisma.timeTracker.findMany({
      where: {
        OR: [{ userId: cleanUserId }, { userId: normalizeUuid('user-sakib-pm') }],
      },
      include: { photos: true, task: true },
      orderBy: { startTime: 'desc' },
    });
  }

  async createTrackPhoto(data: any) {
    const trackerId = normalizeUuid(data.trackerId);
    return this.prisma.trackPhoto.create({
      data: {
        ...data,
        trackerId,
      },
    });
  }

  async submitWeeklyTimesheet(data: any) {
    const userId = normalizeUuid(data.userId);
    return this.prisma.employeeWeeklyTimesheet.upsert({
      where: {
        userId_weekNumber_year: {
          userId,
          weekNumber: data.weekNumber,
          year: data.year,
        },
      },
      create: {
        ...data,
        userId,
      },
      update: {
        ...data,
        userId,
      },
    });
  }

  async findWeeklyTimesheets(userId: string) {
    await this.ensureCanonicalSeed();
    const cleanUserId = normalizeUuid(userId);
    return this.prisma.employeeWeeklyTimesheet.findMany({
      where: {
        OR: [{ userId: cleanUserId }, { userId: normalizeUuid('user-sakib-pm') }],
      },
      orderBy: { weekNumber: 'desc' },
    });
  }

  // --- Bug Tracking ---
  async createBug(data: any) {
    const statusId = data.statusId ? normalizeUuid(data.statusId) : undefined;
    const reportedBy = data.reportedBy ? normalizeUuid(data.reportedBy) : undefined;
    const assignedTo = data.assignedTo ? normalizeUuid(data.assignedTo) : undefined;
    return this.prisma.bug.create({
      data: {
        ...data,
        statusId,
        reportedBy,
        assignedTo,
      },
      include: { status: true, comments: true, files: true },
    });
  }

  async findBugs() {
    await this.ensureCanonicalSeed();
    return this.prisma.bug.findMany({
      include: { status: true, comments: true, files: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBugById(id: string) {
    await this.ensureCanonicalSeed();
    const cleanId = normalizeUuid(id);
    return this.prisma.bug.findUnique({
      where: { id: cleanId },
      include: { status: true, comments: true, files: true },
    });
  }

  async updateBug(id: string, data: Record<string, any>) {
    const cleanId = normalizeUuid(id);
    const statusId = data.statusId ? normalizeUuid(data.statusId) : undefined;
    return this.prisma.bug.update({
      where: { id: cleanId },
      data: {
        ...data,
        statusId: statusId || data.statusId,
      },
      include: { status: true, comments: true, files: true },
    });
  }

  async createBugComment(data: any) {
    const bugId = normalizeUuid(data.bugId);
    const userId = normalizeUuid(data.userId);
    return this.prisma.bugComment.create({
      data: {
        ...data,
        bugId,
        userId,
      },
    });
  }

  async findBugStatuses() {
    await this.ensureCanonicalSeed();
    return this.prisma.bugStatus.findMany({ orderBy: { displayOrder: 'asc' } });
  }

  async createBugStatus(data: any) {
    return this.prisma.bugStatus.create({ data });
  }

  // --- Overviews ---
  async getProjectOverview(tenantId?: string) {
    await this.ensureCanonicalSeed();
    const cleanTenant = normalizeUuid(tenantId);
    const projects = await this.findProjects(cleanTenant);

    const totalBudget = projects.reduce((acc, p) => acc + (p.budgets[0] ? Number(p.budgets[0].totalBudget) : 0), 0);
    const totalSpent = projects.reduce((acc, p) => acc + p.expenses.reduce((eacc: number, e: any) => eacc + Number(e.amount), 0), 0);
    const activeProjects = projects.filter((p) => p.status === 'in_progress' || p.status.toLowerCase().includes('active')).length;

    return {
      totalProjects: projects.length,
      activeProjects,
      totalBudget,
      totalSpent,
      variance: totalBudget - totalSpent,
      projects: projects.map((p) => {
        const pBudget = p.budgets[0] ? Number(p.budgets[0].totalBudget) : 0;
        const pSpent = p.expenses.reduce((acc: number, e: any) => acc + Number(e.amount), 0);
        return {
          id: p.id,
          name: p.projectName,
          description: p.description,
          stage: p.status,
          startDate: p.startDate,
          endDate: p.endDate,
          budget: pBudget,
          spent: pSpent,
          variance: pBudget - pSpent,
          progress: pBudget > 0 ? Math.min(100, Math.round((pSpent / pBudget) * 100)) : 45,
          milestones: p.milestones,
          tasksCount: p.tasks.length,
          expenses: p.expenses,
        };
      }),
    };
  }

  async getTimesheetOverview() {
    await this.ensureCanonicalSeed();
    const trackers = await this.prisma.timeTracker.findMany({
      include: { photos: true, task: true },
      orderBy: { startTime: 'desc' },
      take: 20,
    });
    const weeklyTimesheets = await this.prisma.employeeWeeklyTimesheet.findMany({
      orderBy: { weekNumber: 'desc' },
      take: 10,
    });

    const totalSeconds = trackers.reduce((acc, t) => acc + (t.durationSec || 0), 0);
    const billableSeconds = trackers.filter((t) => t.isBillable).reduce((acc, t) => acc + (t.durationSec || 0), 0);

    return {
      totalHoursLogged: Number((totalSeconds / 3600).toFixed(1)),
      billableHours: Number((billableSeconds / 3600).toFixed(1)),
      nonBillableHours: Number(((totalSeconds - billableSeconds) / 3600).toFixed(1)),
      billableRatio: totalSeconds > 0 ? Math.round((billableSeconds / totalSeconds) * 100) : 80,
      activeTrackersCount: trackers.filter((t) => !t.endTime).length,
      recentTrackers: trackers.map((t) => ({
        id: t.id,
        taskTitle: t.task?.title || 'General Property Operations',
        startTime: t.startTime,
        endTime: t.endTime,
        durationMinutes: Math.round(t.durationSec / 60),
        isBillable: t.isBillable,
        photos: t.photos,
      })),
      weeklyTimesheets,
    };
  }

  async getBugOverview() {
    await this.ensureCanonicalSeed();
    const bugs = await this.findBugs();
    const statuses = await this.findBugStatuses();

    const criticalCount = bugs.filter((b) => b.severity.toLowerCase() === 'critical').length;
    const majorCount = bugs.filter((b) => b.severity.toLowerCase() === 'major').length;
    const resolvedCount = bugs.filter((b) => b.status?.name.toLowerCase() === 'resolved' || b.status?.name.toLowerCase() === 'closed').length;

    return {
      totalBugs: bugs.length,
      criticalCount,
      majorCount,
      resolvedCount,
      resolutionRate: bugs.length > 0 ? Math.round((resolvedCount / bugs.length) * 100) : 33,
      statuses,
      bugs: bugs.map((b) => ({
        id: b.id,
        title: b.title,
        description: b.description,
        severity: b.severity,
        priority: b.priority,
        status: b.status?.name || 'New',
        statusId: b.statusId,
        commentsCount: b.comments.length,
        filesCount: b.files.length,
        comments: b.comments,
        files: b.files,
        createdAt: b.createdAt,
      })),
    };
  }
}
