import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateDistanceMeters,
  calculatePayrollSalary,
  calculateWorkedHoursAndOvertime,
  checkPeakHolidayBlackout,
  isWithinGeofence,
} from './domain/rules/hrm.rule.js';
import { EmployeeApplicationService } from './application/services/employee.application-service.js';
import { AttendanceApplicationService } from './application/services/attendance.application-service.js';
import { LeaveApplicationService } from './application/services/leave.application-service.js';
import { PayrollApplicationService } from './application/services/payroll.application-service.js';
import { RecruitmentApplicationService } from './application/services/recruitment.application-service.js';
import type { IHrmRepository } from './domain/repositories/hrm.repository.interface.js';
import { BadRequestException } from '@nestjs/common';

describe('HRM Domain — Clean Architecture & DDD Test Suite', () => {
  describe('Domain Rules (Pure Business Logic)', () => {
    it('calculateDistanceMeters & isWithinGeofence: should calculate Haversine distance correctly', () => {
      const lat = 25.7617;
      const lng = -80.1918;
      // Exact location -> distance 0
      const atResort = isWithinGeofence(lat, lng, lat, lng, 50.0);
      expect(atResort.isWithin).toBe(true);
      expect(atResort.distanceMeters).toBe(0);

      // Far away location (e.g. 1 degree away is ~111km)
      const farAway = isWithinGeofence(lat + 1.0, lng, lat, lng, 50.0);
      expect(farAway.isWithin).toBe(false);
      expect(farAway.distanceMeters).toBeGreaterThan(1000);
    });

    it('calculateWorkedHoursAndOvertime: should compute working hours and overtime over 8 hours', () => {
      const clockIn = new Date('2026-10-21T08:00:00Z');
      const clockOutNormal = new Date('2026-10-21T16:00:00Z'); // 8 hours
      expect(calculateWorkedHoursAndOvertime(clockIn, clockOutNormal, 8)).toEqual({
        totalWorkedHours: 8,
        overtimeHours: 0,
      });

      const clockOutOvertime = new Date('2026-10-21T18:30:00Z'); // 10.5 hours
      expect(calculateWorkedHoursAndOvertime(clockIn, clockOutOvertime, 8)).toEqual({
        totalWorkedHours: 10.5,
        overtimeHours: 2.5,
      });
    });

    it('calculatePayrollSalary: should accurately compute OT, service charge, taxes, loan deduction, and net pay', () => {
      // Basic 4000, 10 hrs OT, allowances 200, loan 300
      const calc = calculatePayrollSalary(4000, 10, 25, 200, 300, 0.1);
      // Hourly rate = 25
      // OT = 10 * 25 * 1.5 = 375
      // Tax = 4000 * 0.1 = 400
      // Gross = 4000 + 375 + 200 = 4575
      // Deductions = 400 + 300 = 700
      // Net = 4575 - 700 = 3875
      expect(calc.otAmount).toBe(375);
      expect(calc.taxDeduction).toBe(400);
      expect(calc.totalEarnings).toBe(4575);
      expect(calc.totalDeductions).toBe(700);
      expect(calc.netSalary).toBe(3875);
    });

    it('checkPeakHolidayBlackout: should detect Christmas/New Year blackout dates', () => {
      expect(checkPeakHolidayBlackout('2026-12-25', '2026-12-28', false)).toBe(true);
      expect(checkPeakHolidayBlackout('2026-12-20', '2026-12-22', false)).toBe(false);
      expect(checkPeakHolidayBlackout('2026-12-25', '2026-12-28', true)).toBe(false); // emergency/sick exempt
    });
  });

  describe('Application Services & Repository Orchestration', () => {
    let mockRepo: IHrmRepository;
    let employeeService: EmployeeApplicationService;
    let attendanceService: AttendanceApplicationService;
    let leaveService: LeaveApplicationService;
    let payrollService: PayrollApplicationService;
    let recruitmentService: RecruitmentApplicationService;

    beforeEach(() => {
      mockRepo = {
        createBranch: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'branch-1', ...data })),
        findBranches: vi.fn().mockResolvedValue([{ id: 'branch-1', name: 'Miami Luxury Resort' }]),
        createDepartment: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'dept-1', ...data })),
        createDesignation: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'desig-1', ...data })),
        findEmployeeByCode: vi.fn().mockImplementation((tenantId, code) => {
          if (code === 'EXISTING-001') return Promise.resolve({ id: 'emp-ex', employeeCode: code });
          return Promise.resolve(null);
        }),
        findEmployeeById: vi.fn().mockImplementation((id) => {
          if (id === 'emp-101') {
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
        createEmployee: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'emp-101', ...data })),
        findEmployees: vi.fn().mockResolvedValue([{ id: 'emp-101', fullName: 'Alexander Wright' }]),
        updateEmployee: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
        createDocumentLetter: vi.fn().mockImplementation((type, data) => Promise.resolve({ id: 'let-1', type, ...data })),

        findEmployeeByCodeSimple: vi.fn().mockImplementation((code) => {
          if (code === 'EMP-101') return Promise.resolve({ id: 'emp-101', fullName: 'Alexander Wright', employeeCode: code });
          return Promise.resolve(null);
        }),
        findAttendanceByDate: vi.fn().mockResolvedValue({
          id: 'att-1',
          employeeId: 'emp-101',
          clockIn: new Date('2026-10-21T07:00:00Z'),
        }),
        createAttendance: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'att-1', ...data })),
        updateAttendance: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
        createShiftSchedule: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'shift-1', ...data })),
        findShiftSchedules: vi.fn().mockResolvedValue([{ id: 'shift-1', shiftName: 'Morning Shift' }]),
        findEmployeeAttendances: vi.fn().mockResolvedValue([
          { id: 'att-1', overtimeHours: 2.0 },
          { id: 'att-2', overtimeHours: 3.5 },
        ]),

        createLeaveType: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'lt-1', ...data })),
        findLeaveTypes: vi.fn().mockResolvedValue([{ id: 'lt-1', title: 'Annual Leave' }]),
        findLeaveTypeById: vi.fn().mockImplementation((id) => {
          if (id === 'lt-annual') return Promise.resolve({ id: 'lt-annual', title: 'Annual Paid Vacation' });
          if (id === 'lt-sick') return Promise.resolve({ id: 'lt-sick', title: 'Emergency Sick Leave' });
          return Promise.resolve(null);
        }),
        createLeaveApplication: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'la-1', ...data })),
        findLeaveApplications: vi.fn().mockResolvedValue([]),
        findLeaveApplicationById: vi.fn().mockResolvedValue({ id: 'la-1', status: 'pending' }),
        updateLeaveApplication: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),

        upsertSalary: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'sal-1', ...data })),
        upsertServiceChargePool: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'pool-1', ...data })),
        findServiceChargePool: vi.fn().mockResolvedValue({ id: 'pool-1', sharePerPax: 250.0 }),
        findActiveEmployeesForPayroll: vi.fn().mockResolvedValue([
          {
            id: 'emp-101',
            employeeCode: 'EMP-101',
            fullName: 'Alexander Wright',
            salaryBasic: 4000.0,
            loans: [{ id: 'ln-1', monthlyDeduct: 200.0, remainingAmt: 1000.0 }],
          },
        ]),
        createLoanRepayment: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'lr-1', ...data })),
        updateLoan: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
        upsertPaySlip: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'ps-1', ...data })),
        createOvertimeRecord: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'ot-1', ...data })),
        createAllowance: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'al-1', ...data })),
        createDeduction: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'ded-1', ...data })),
        findEmployeePaySlips: vi.fn().mockResolvedValue([{ id: 'ps-1', basicSalary: 4000.0 }]),
        findPaySlips: vi.fn().mockResolvedValue([]),

        createJob: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'job-1', ...data })),
        findJobs: vi.fn().mockResolvedValue([{ id: 'job-1', title: 'Executive Chef' }]),
        findJobById: vi.fn().mockResolvedValue({ id: 'job-1', title: 'Executive Chef' }),
        createJobApplication: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'app-1', ...data })),
        findJobApplicationById: vi.fn().mockResolvedValue({ id: 'app-1', name: 'John Doe', stage: 'applied' }),
        updateJobApplication: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
        createInterviewSchedule: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'int-1', ...data })),
        createAppraisal: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'appr-1', ...data })),
        createEmployeeCertification: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'cert-1', ...data })),
      };

      employeeService = new EmployeeApplicationService(mockRepo);
      attendanceService = new AttendanceApplicationService(mockRepo);
      leaveService = new LeaveApplicationService(mockRepo);
      payrollService = new PayrollApplicationService(mockRepo);
      recruitmentService = new RecruitmentApplicationService(mockRepo);
    });

    it('employeeService: should register employee, create branches, and generate document letters', async () => {
      const branch = await employeeService.createBranch('tenant-1', { name: 'Main Resort' });
      expect(branch.id).toBe('branch-1');

      const emp = await employeeService.createEmployee('tenant-1', {
        employeeCode: 'EMP-101',
        fullName: 'Alexander Wright',
        email: 'alex@omnistay.com',
        joiningDate: '2026-01-15',
        salaryBasic: 4000,
      });
      expect(emp.id).toBe('emp-101');
      expect(mockRepo.upsertSalary).toHaveBeenCalled();

      const letter = await employeeService.generateDocumentLetter('emp-101', 'offer');
      expect(letter.id).toBe('let-1');
      expect(letter.type).toBe('offer');
    });

    it('attendanceService: should log biometric clock-out and reject out-of-geofence clock-in', async () => {
      const clockOut = await attendanceService.recordBiometricPunch({
        deviceId: 'BIO-01',
        employeeCode: 'EMP-101',
        punchTime: '2026-10-21T17:00:00Z',
        punchType: 'clock_out',
      });
      expect(clockOut.employeeCode).toBe('EMP-101');
      expect(mockRepo.updateAttendance).toHaveBeenCalled();

      // Geofenced clock in far away
      await expect(
        attendanceService.recordMobileGeofencedClockIn({
          employeeCode: 'EMP-101',
          latitude: 40.7128, // New York instead of Miami
          longitude: -74.006,
          punchType: 'clock_in',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('leaveService: should enforce blackout restriction for holiday dates', async () => {
      await expect(
        leaveService.applyForLeave({
          employeeId: 'emp-101',
          leaveTypeId: 'lt-annual',
          startDate: '2026-12-25',
          endDate: '2026-12-28',
          reason: 'Holiday vacation',
        }),
      ).rejects.toThrow(BadRequestException);

      const validLeave = await leaveService.applyForLeave({
        employeeId: 'emp-101',
        leaveTypeId: 'lt-annual',
        startDate: '2026-11-10',
        endDate: '2026-11-14',
        reason: 'Family event',
      });
      expect(validLeave.id).toBe('la-1');
    });

    it('payrollService: should run monthly payroll with OT, service charge, and loan deductions', async () => {
      const payrollRun = await payrollService.runMonthlyPayroll('tenant-1', {
        salaryMonth: '2026-10',
      });
      expect(payrollRun.success).toBe(true);
      expect(payrollRun.processedEmployeesCount).toBe(1);
      expect(mockRepo.upsertPaySlip).toHaveBeenCalled();
      expect(mockRepo.createLoanRepayment).toHaveBeenCalled();
    });

    it('recruitmentService: should manage job application, transition stage, and schedule interview', async () => {
      const job = await recruitmentService.createJobPost({
        title: 'Lead Concierge',
        category: 'Front Office',
        positionsCount: 1,
        description: 'Manage VIP arrivals',
      });
      expect(job.id).toBe('job-1');

      const app = await recruitmentService.submitJobApplication({
        jobId: 'job-1',
        name: 'Jane Smith',
        email: 'jane@example.com',
      });
      expect(app.id).toBe('app-1');

      const interview = await recruitmentService.scheduleInterview({
        applicationId: 'app-1',
        scheduledDate: '2026-11-05T10:00:00Z',
        roundType: 'zoom_video',
      });
      expect(interview.id).toBe('int-1');
      expect(interview.zoomJoinUrl).toContain('zoom.us');
    });
  });
});
