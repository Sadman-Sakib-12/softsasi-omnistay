import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmployeeService } from './employee.service.js';
import { AttendanceService } from './attendance.service.js';
import { LeaveService } from './leave.service.js';
import { PayrollService } from './payroll.service.js';
import { RecruitmentService } from './recruitment.service.js';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('Phase 6 — Human Resource Management (HRM) & Workforce Payroll Suite', () => {
  let mockPrisma: any;
  let employeeService: EmployeeService;
  let attendanceService: AttendanceService;
  let leaveService: LeaveService;
  let payrollService: PayrollService;
  let recruitmentService: RecruitmentService;

  beforeEach(() => {
    mockPrisma = {
      branch: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'branch-1', ...data })),
        findMany: vi.fn().mockResolvedValue([{ id: 'branch-1', name: 'Miami Luxury Resort Depot' }]),
      },
      department: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'dept-1', ...data })),
      },
      designation: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'desig-1', ...data })),
      },
      employee: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.tenantId_employeeCode) {
            return Promise.resolve(
              where.tenantId_employeeCode.employeeCode === 'EXISTING-001'
                ? { id: 'emp-existing', employeeCode: 'EXISTING-001' }
                : null,
            );
          }
          if (where.id === 'emp-101') {
            return Promise.resolve({
              id: 'emp-101',
              fullName: 'Alexander Wright',
              employeeCode: 'EMP-101',
              salaryBasic: 4000,
              joiningDate: new Date('2026-01-15'),
              department: { name: 'Food & Beverage' },
              designation: { name: 'Executive Sous Chef' },
            });
          }
          return Promise.resolve(null);
        }),
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where.employeeCode === 'EMP-101') {
            return Promise.resolve({
              id: 'emp-101',
              fullName: 'Alexander Wright',
              employeeCode: 'EMP-101',
              salaryBasic: 4000,
            });
          }
          return Promise.resolve(null);
        }),
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'emp-101',
            fullName: 'Alexander Wright',
            employeeCode: 'EMP-101',
            salaryBasic: 4000,
            status: 'active',
            loans: [
              {
                id: 'loan-1',
                employeeId: 'emp-101',
                monthlyDeduct: 250,
                remainingAmt: 500,
                status: 'active',
              },
            ],
          },
        ]),
        create: vi.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: 'emp-101',
            ...data,
            branch: { name: 'Miami Luxury Resort Depot' },
            department: { name: 'Food & Beverage' },
            designation: { name: 'Executive Sous Chef' },
          }),
        ),
      },
      setSalary: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'sal-1', ...data })),
        upsert: vi.fn().mockImplementation(({ create, update }) => Promise.resolve({ id: 'sal-1', ...create })),
      },
      offerLetter: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'off-1', ...data })),
      },
      joiningLetter: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'join-1', ...data })),
      },
      experienceCertificate: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'exp-1', ...data })),
      },
      attendanceEmployee: {
        findUnique: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'att-1',
            employeeId: 'emp-101',
            overtimeHours: 4.5,
            status: 'Present',
          },
          {
            id: 'att-2',
            employeeId: 'emp-101',
            overtimeHours: 3.5,
            status: 'Present',
          },
        ]),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'att-rec-1', ...data })),
        update: vi.fn().mockImplementation(({ where, data }) => Promise.resolve({ id: where.id, ...data })),
      },
      shiftSchedule: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'shift-1', ...data })),
        findMany: vi.fn().mockResolvedValue([
          { id: 'shift-1', shiftName: 'Day Rotational', startTime: '07:00', endTime: '15:30' },
          { id: 'shift-2', shiftName: 'Night Night-Audit', startTime: '23:00', endTime: '07:30', isOvernight: true },
        ]),
      },
      leaveType: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'lt-1', ...data })),
        findMany: vi.fn().mockResolvedValue([
          { id: 'lt-1', title: 'Annual Vacation', daysPerYear: 14, isPaid: true },
          { id: 'lt-2', title: 'Emergency Sick Leave', daysPerYear: 10, isPaid: true },
        ]),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.id === 'lt-1') return Promise.resolve({ id: 'lt-1', title: 'Annual Vacation', daysPerYear: 14, isPaid: true });
          if (where.id === 'lt-2') return Promise.resolve({ id: 'lt-2', title: 'Emergency Sick Leave', daysPerYear: 10, isPaid: true });
          return Promise.resolve(null);
        }),
      },
      leaveApplication: {
        create: vi.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: 'leave-app-1',
            ...data,
            employee: { fullName: 'Alexander Wright' },
            leaveType: { title: 'Annual Vacation' },
          }),
        ),
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockImplementation(({ where }) =>
          Promise.resolve({
            id: where.id,
            status: 'pending',
            employee: { fullName: 'Alexander Wright' },
            leaveType: { title: 'Annual Vacation' },
          }),
        ),
        update: vi.fn().mockImplementation(({ where, data }) =>
          Promise.resolve({
            id: where.id,
            ...data,
            employee: { fullName: 'Alexander Wright' },
            leaveType: { title: 'Annual Vacation' },
          }),
        ),
      },
      serviceChargePool: {
        upsert: vi.fn().mockImplementation(({ create }) => Promise.resolve({ id: 'pool-1', ...create })),
        findUnique: vi.fn().mockResolvedValue({
          id: 'pool-1',
          month: '2026-10',
          totalPool: 10000,
          paxStaff: 20,
          sharePerPax: 500,
        }),
      },
      loanRepayment: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'rep-1', ...data })),
      },
      loan: {
        update: vi.fn().mockImplementation(({ where, data }) => Promise.resolve({ id: where.id, ...data })),
      },
      overtimeRecord: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'ot-rec-1', ...data })),
      },
      allowance: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'allow-1', ...data })),
      },
      saturationDeduction: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'ded-1', ...data })),
      },
      paySlip: {
        upsert: vi.fn().mockImplementation(({ create }) => Promise.resolve({ id: 'slip-1', ...create })),
        findMany: vi.fn().mockResolvedValue([]),
      },
      job: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'job-1', ...data })),
        findMany: vi.fn().mockResolvedValue([
          { id: 'job-1', title: 'Executive Chef', status: 'active', applications: [] },
        ]),
        findUnique: vi.fn().mockResolvedValue({ id: 'job-1', title: 'Executive Chef' }),
      },
      jobApplication: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'app-1', ...data })),
        findUnique: vi.fn().mockResolvedValue({ id: 'app-1', name: 'Sophia Miller', stage: 'applied' }),
        update: vi.fn().mockImplementation(({ where, data }) => Promise.resolve({ id: where.id, ...data })),
      },
      interviewSchedule: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'int-1', ...data })),
      },
      appraisal: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'appr-1', ...data })),
      },
      employeeCertification: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'cert-1', ...data })),
      },
    };

    employeeService = new EmployeeService(mockPrisma);
    attendanceService = new AttendanceService(mockPrisma);
    leaveService = new LeaveService(mockPrisma);
    payrollService = new PayrollService(mockPrisma);
    recruitmentService = new RecruitmentService(mockPrisma);
  });

  describe('1. Organization Structure & Employee Lifecycle Dossier', () => {
    it('should create branches, departments, and designations', async () => {
      const branch = await employeeService.createBranch('tenant-1', {
        name: 'OmniStay Miami Luxury Resort',
        address: '100 Ocean Drive, Miami FL',
      });
      expect(branch.name).toBe('OmniStay Miami Luxury Resort');

      const dept = await employeeService.createDepartment({
        branchId: branch.id,
        name: 'Culinary Arts & F&B',
      });
      expect(dept.name).toBe('Culinary Arts & F&B');

      const desig = await employeeService.createDesignation({
        departmentId: dept.id,
        name: 'Head Pastry Chef',
      });
      expect(desig.name).toBe('Head Pastry Chef');
    });

    it('should create new employee and initialize basic salary setup', async () => {
      const emp = await employeeService.createEmployee('tenant-1', {
        branchId: 'branch-1',
        departmentId: 'dept-1',
        designationId: 'desig-1',
        employeeCode: 'EMP-102',
        fullName: 'Gordon Vance',
        email: 'gordon.v@omnistay.com',
        phone: '+1-305-555-0199',
        joiningDate: '2026-03-01',
        salaryBasic: 4500,
      });

      expect(emp.employeeCode).toBe('EMP-102');
      expect(emp.fullName).toBe('Gordon Vance');
      expect(mockPrisma.setSalary.create).toHaveBeenCalledWith({
        data: {
          employeeId: 'emp-101',
          basicSalary: 4500,
          payslipType: 'monthly',
        },
      });
    });

    it('should reject employee creation if employee code is already taken', async () => {
      await expect(
        employeeService.createEmployee('tenant-1', {
          branchId: 'branch-1',
          departmentId: 'dept-1',
          designationId: 'desig-1',
          employeeCode: 'EXISTING-001',
          fullName: 'Duplicate Code Worker',
          email: 'dup@omnistay.com',
          phone: '+1-555-0000',
          joiningDate: '2026-01-01',
          salaryBasic: 3000,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should generate digital employment offer, joining, and experience letters', async () => {
      const offer = await employeeService.generateDocumentLetter('emp-101', 'offer');
      expect(offer.content).toContain('Offer of Employment extended to Alexander Wright');

      const joining = await employeeService.generateDocumentLetter('emp-101', 'joining');
      expect(joining.content).toContain('Joining Acceptance Letter: Alexander Wright');

      const experience = await employeeService.generateDocumentLetter('emp-101', 'experience');
      expect(experience.content).toContain('Certificate of Service: Alexander Wright');
    });
  });

  describe('2. Biometric API, Geofenced Mobile Punch & Shifts', () => {
    it('should record biometric hardware clock-in punch', async () => {
      const result = await attendanceService.recordBiometricPunch({
        deviceId: 'ZKTECO-GATE-01',
        employeeCode: 'EMP-101',
        punchTime: '2026-10-20T08:00:00Z',
        punchType: 'clock_in',
      });

      expect(result.success).toBe(true);
      expect(result.deviceId).toBe('ZKTECO-GATE-01');
      expect(result.punchType).toBe('clock_in');
      expect(mockPrisma.attendanceEmployee.create).toHaveBeenCalled();
    });

    it('should calculate overtime on clock-out after 10 hours worked', async () => {
      // Mock existing attendance record with clock-in at 08:00
      mockPrisma.attendanceEmployee.findUnique.mockResolvedValueOnce({
        id: 'att-existing',
        employeeId: 'emp-101',
        date: new Date('2026-10-20'),
        clockIn: new Date('2026-10-20T08:00:00Z'),
      });

      const result = await attendanceService.recordBiometricPunch({
        deviceId: 'ZKTECO-GATE-01',
        employeeCode: 'EMP-101',
        punchTime: '2026-10-20T18:00:00Z', // 10 hours later
        punchType: 'clock_out',
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.attendanceEmployee.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            overtimeHours: 2.0, // 10 - 8 = 2.0 hrs OT
          }),
        }),
      );
    });

    it('should allow mobile clock-in within property geofence perimeter (<= 50 meters)', async () => {
      const result = await attendanceService.recordMobileGeofencedClockIn({
        employeeCode: 'EMP-101',
        latitude: 25.7617, // Exact resort latitude
        longitude: -80.1918, // Exact resort longitude
        punchType: 'clock_in',
      });

      expect(result.success).toBe(true);
      expect(result.deviceId).toBe('MOBILE-GPS-GEOFENCE');
    });

    it('should reject mobile clock-in outside property geofence perimeter (> 50 meters)', async () => {
      await expect(
        attendanceService.recordMobileGeofencedClockIn({
          employeeCode: 'EMP-101',
          latitude: 25.7800, // Several km away from resort
          longitude: -80.1918,
          punchType: 'clock_in',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create 24/7 rotational shift schedule', async () => {
      const shift = await attendanceService.createShiftSchedule({
        shiftName: 'Overnight Graveyard Shift',
        startTime: '23:00',
        endTime: '07:30',
        isOvernight: true,
      });

      expect(shift.shiftName).toBe('Overnight Graveyard Shift');
      expect(shift.isOvernight).toBe(true);
    });
  });

  describe('3. Leave Management & Peak Blackout Policies', () => {
    it('should block discretionary holiday leave during peak Christmas blackout window', async () => {
      await expect(
        leaveService.applyForLeave({
          employeeId: 'emp-101',
          leaveTypeId: 'lt-1', // Annual Vacation
          startDate: '2026-12-25',
          endDate: '2026-12-30',
          reason: 'Christmas family trip',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should permit emergency sick leave during peak Christmas blackout window', async () => {
      const leave = await leaveService.applyForLeave({
        employeeId: 'emp-101',
        leaveTypeId: 'lt-2', // Emergency Sick Leave
        startDate: '2026-12-25',
        endDate: '2026-12-27',
        reason: 'Acute fever',
      });

      expect(leave.id).toBe('leave-app-1');
      expect(leave.status).toBe('pending');
    });

    it('should execute 3-tier hierarchy leave review workflow', async () => {
      const headReview = await leaveService.reviewLeaveApplication('leave-app-1', 'Department Head', {
        decision: 'head_approved',
        comments: 'Recommended by Chef de Cuisine',
      });
      expect(headReview.status).toBe('head_approved');

      const hrReview = await leaveService.reviewLeaveApplication('leave-app-1', 'HR Director', {
        decision: 'hr_approved',
        comments: 'Final approval granted by HR',
      });
      expect(hrReview.status).toBe('hr_approved');
    });
  });

  describe('4. Enterprise Hospitality Payroll Engine & 10% Service Charge Pool', () => {
    it('should configure 10% service charge pool and compute per-staff dividend', async () => {
      const pool = await payrollService.createServiceChargePool({
        month: '2026-10',
        totalPool: 12000,
        paxStaff: 24,
      });

      expect(pool.totalPool).toBe(12000);
      expect(pool.sharePerPax).toBe(500.0);
    });

    it('should process monthly payroll with 1.5x OT, pool distribution, tax withholding, and loan repayment', async () => {
      // emp-101 has:
      // basic: 4000
      // hourly rate: 4000 / 160 = 25/hr
      // 8 hrs OT (from mock attendance) -> 8 * 25 * 1.5 = 300
      // service charge share: 500 (from mock service charge pool)
      // total earnings = 4000 + 300 + 500 = 4800
      // 10% statutory tax deduction = 400
      // loan repayment deduction = 250
      // total deductions = 650
      // net salary = 4800 - 650 = 4150
      const payrollRun = await payrollService.runMonthlyPayroll('tenant-1', {
        salaryMonth: '2026-10',
      });

      expect(payrollRun.processedEmployeesCount).toBe(1);
      expect(payrollRun.totalPayrollDisbursed).toBe(4150);
      expect(payrollRun.payslips[0].netSalary).toBe(4150);
      expect(payrollRun.payslips[0].overtimePay).toBe(300);
      expect(payrollRun.payslips[0].serviceChargeShare).toBe(500);
      expect(payrollRun.payslips[0].loanDeduction).toBe(250);
      expect(mockPrisma.loanRepayment.create).toHaveBeenCalled();
      expect(mockPrisma.loan.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            remainingAmt: 250, // 500 - 250 = 250
            status: 'active',
          }),
        }),
      );
    });
  });

  describe('5. Recruitment ATS Pipeline & Certifications', () => {
    it('should create job post, accept application, and advance stages on Kanban', async () => {
      const job = await recruitmentService.createJobPost({
        title: 'Master Sommelier',
        category: 'Food & Beverage',
        positionsCount: 1,
        description: 'Lead wine curator for 5-star fine dining establishment.',
      });
      expect(job.title).toBe('Master Sommelier');

      const app = await recruitmentService.submitJobApplication({
        jobId: job.id,
        name: 'Sophia Miller',
        email: 'sophia.m@somm.org',
        phone: '+1-305-555-7788',
        resumeUrl: 'https://cdn.omnistay.com/resumes/sophia.pdf',
      });
      expect(app.stage).toBe('applied');

      const advanced = await recruitmentService.updateApplicationStage(app.id, {
        stage: 'screening',
      });
      expect(advanced.stage).toBe('screening');
    });

    it('should schedule Zoom video interview and automatically update applicant stage', async () => {
      const interview = await recruitmentService.scheduleInterview({
        applicationId: 'app-1',
        scheduledDate: '2026-10-25T14:00:00Z',
        roundType: 'zoom_video',
      });

      expect(interview.roundType).toBe('zoom_video');
      expect(interview.zoomJoinUrl).toContain('https://zoom.us/j/');
      expect(mockPrisma.jobApplication.update).toHaveBeenCalledWith({
        where: { id: 'app-1' },
        data: { stage: 'interview' },
      });
    });

    it('should submit 360 employee appraisal performance review score', async () => {
      const review = await recruitmentService.submitAppraisal({
        employeeId: 'emp-101',
        ratingScore: 4.8,
        reviewPeriod: 'Q3 2026',
        feedback: 'Exemplary culinary leadership during high-season banquets.',
      });

      expect(review.ratingScore).toBe(4.8);
      expect(review.reviewPeriod).toBe('Q3 2026');
    });

    it('should register HACCP food safety certification', async () => {
      const cert = await recruitmentService.registerHaccpCertification(
        'Alexander Wright',
        'HACCP Level 3 Advanced Food Safety Management',
      );

      expect(cert.certName).toBe('HACCP Level 3 Advanced Food Safety Management');
      expect(cert.issuedBy).toBe('ServSafe / National Hospitality Safety Board');
    });
  });
});
