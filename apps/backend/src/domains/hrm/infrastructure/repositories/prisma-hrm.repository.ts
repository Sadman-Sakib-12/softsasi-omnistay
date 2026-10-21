import { Injectable } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IHrmRepository } from '../../domain/repositories/hrm.repository.interface.js';

@Injectable()
export class PrismaHrmRepository implements IHrmRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Branches, Departments & Employees
  async createBranch(data: any): Promise<any> {
    return this.prisma.branch.create({
      data,
      include: { departments: true },
    });
  }

  async findBranches(tenantId: string): Promise<any[]> {
    return this.prisma.branch.findMany({
      where: { tenantId },
      include: {
        departments: {
          include: { designations: true },
        },
      },
    });
  }

  async createDepartment(data: any): Promise<any> {
    return this.prisma.department.create({ data });
  }

  async createDesignation(data: any): Promise<any> {
    return this.prisma.designation.create({ data });
  }

  async findEmployeeByCode(tenantId: string, employeeCode: string): Promise<any | null> {
    return this.prisma.employee.findUnique({
      where: {
        tenantId_employeeCode: {
          tenantId,
          employeeCode,
        },
      },
    });
  }

  async findEmployeeById(id: string): Promise<any | null> {
    return this.prisma.employee.findUnique({
      where: { id },
      include: {
        branch: true,
        department: true,
        designation: true,
        documents: true,
        joiningLetters: true,
        offerLetters: true,
        experienceCerts: true,
        salaries: true,
        loans: { include: { repayments: true } },
        appraisals: true,
      },
    });
  }

  async createEmployee(data: any): Promise<any> {
    return this.prisma.employee.create({
      data,
      include: {
        branch: true,
        department: true,
        designation: true,
      },
    });
  }

  async findEmployees(tenantId: string): Promise<any[]> {
    return this.prisma.employee.findMany({
      where: { tenantId, status: 'active', deletedAt: null },
      include: {
        branch: true,
        department: true,
        designation: true,
        documents: true,
        salaries: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateEmployee(id: string, data: Record<string, any>): Promise<any> {
    return this.prisma.employee.update({ where: { id }, data });
  }

  async createDocumentLetter(type: 'offer' | 'joining' | 'experience', data: any): Promise<any> {
    if (type === 'offer') {
      return this.prisma.offerLetter.create({ data });
    }
    if (type === 'joining') {
      return this.prisma.joiningLetter.create({ data });
    }
    return this.prisma.experienceCertificate.create({ data });
  }

  // Attendance & Shifts
  async findEmployeeByCodeSimple(employeeCode: string): Promise<any | null> {
    return this.prisma.employee.findFirst({
      where: { employeeCode },
    });
  }

  async findAttendanceByDate(employeeId: string, date: Date): Promise<any | null> {
    return this.prisma.attendanceEmployee.findUnique({
      where: { employeeId_date: { employeeId, date } },
    });
  }

  async createAttendance(data: any): Promise<any> {
    return this.prisma.attendanceEmployee.create({ data });
  }

  async updateAttendance(id: string, data: Record<string, any>): Promise<any> {
    return this.prisma.attendanceEmployee.update({ where: { id }, data });
  }

  async createShiftSchedule(data: any): Promise<any> {
    return this.prisma.shiftSchedule.create({ data });
  }

  async findShiftSchedules(): Promise<any[]> {
    return this.prisma.shiftSchedule.findMany({
      orderBy: { startTime: 'asc' },
    });
  }

  async findEmployeeAttendances(employeeId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return this.prisma.attendanceEmployee.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  // Leaves
  async createLeaveType(data: any): Promise<any> {
    return this.prisma.leaveType.create({ data });
  }

  async findLeaveTypes(tenantId?: string): Promise<any[]> {
    const where: any = tenantId ? { tenantId } : {};
    return this.prisma.leaveType.findMany({ where });
  }

  async findLeaveTypeById(id: string): Promise<any | null> {
    return this.prisma.leaveType.findUnique({ where: { id } });
  }

  async createLeaveApplication(data: any): Promise<any> {
    return this.prisma.leaveApplication.create({
      data,
      include: { leaveType: true, employee: true },
    });
  }

  async findLeaveApplications(employeeId?: string): Promise<any[]> {
    return this.prisma.leaveApplication.findMany({
      where: employeeId ? { employeeId } : undefined,
      include: { employee: true, leaveType: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findLeaveApplicationById(id: string): Promise<any | null> {
    return this.prisma.leaveApplication.findUnique({
      where: { id },
      include: { employee: true, leaveType: true },
    });
  }

  async updateLeaveApplication(id: string, data: Record<string, any>): Promise<any> {
    return this.prisma.leaveApplication.update({ where: { id }, data });
  }

  // Payroll & Loans
  async upsertSalary(data: any): Promise<any> {
    return this.prisma.setSalary.upsert({
      where: { id: data.employeeId },
      update: { basicSalary: data.basicSalary, payslipType: data.payslipType || 'monthly' },
      create: {
        employeeId: data.employeeId,
        basicSalary: data.basicSalary,
        payslipType: data.payslipType || 'monthly',
      },
    });
  }

  async upsertServiceChargePool(data: any): Promise<any> {
    return this.prisma.serviceChargePool.upsert({
      where: { month: data.month },
      update: {
        totalPool: data.totalPool,
        paxStaff: data.paxStaff,
        sharePerPax: data.sharePerPax,
      },
      create: {
        month: data.month,
        totalPool: data.totalPool,
        paxStaff: data.paxStaff,
        sharePerPax: data.sharePerPax,
      },
    });
  }

  async findServiceChargePool(month: string): Promise<any | null> {
    return this.prisma.serviceChargePool.findUnique({ where: { month } });
  }

  async findActiveEmployeesForPayroll(tenantId: string): Promise<any[]> {
    return this.prisma.employee.findMany({
      where: { tenantId, status: 'active', deletedAt: null },
      include: {
        salaries: true,
        loans: { where: { status: 'active', remainingAmt: { gt: 0 } } },
      },
    });
  }

  async createLoanRepayment(data: any): Promise<any> {
    return this.prisma.loanRepayment.create({ data });
  }

  async updateLoan(id: string, data: Record<string, any>): Promise<any> {
    return this.prisma.loan.update({ where: { id }, data });
  }

  async upsertPaySlip(data: any): Promise<any> {
    return this.prisma.paySlip.upsert({
      where: {
        employeeId_salaryMonth: {
          employeeId: data.employeeId,
          salaryMonth: data.salaryMonth,
        },
      },
      update: {
        basicSalary: data.basicSalary,
        netSalary: data.netSalary,
        status: data.status || 'paid',
        pdfUrl: data.pdfUrl,
      },
      create: {
        employeeId: data.employeeId,
        salaryMonth: data.salaryMonth,
        basicSalary: data.basicSalary,
        netSalary: data.netSalary,
        status: data.status || 'paid',
        pdfUrl: data.pdfUrl,
      },
    });
  }

  async createOvertimeRecord(data: any): Promise<any> {
    return this.prisma.overtimeRecord.create({ data });
  }

  async createAllowance(data: any): Promise<any> {
    return this.prisma.allowance.create({ data });
  }

  async createDeduction(data: any): Promise<any> {
    return this.prisma.saturationDeduction.create({ data });
  }

  async findEmployeePaySlips(employeeId: string): Promise<any[]> {
    return this.prisma.paySlip.findMany({
      where: { employeeId },
      include: {
        allowances: true,
        deductions: true,
        overtimes: true,
      },
      orderBy: { salaryMonth: 'desc' },
    });
  }

  async findPaySlips(tenantId: string, month: string): Promise<any[]> {
    return this.prisma.paySlip.findMany({
      where: {
        salaryMonth: month,
        employee: { tenantId },
      },
      include: {
        employee: {
          include: { department: true, designation: true },
        },
      },
    });
  }

  // Recruitment
  async createJob(data: any): Promise<any> {
    return this.prisma.job.create({ data });
  }

  async findJobs(tenantId?: string): Promise<any[]> {
    const where: any = { status: 'active' };
    if (tenantId) where.tenantId = tenantId;
    return this.prisma.job.findMany({
      where,
      include: {
        applications: {
          select: { id: true, stage: true, name: true, email: true },
        },
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findJobById(id: string): Promise<any | null> {
    return this.prisma.job.findUnique({ where: { id } });
  }

  async createJobApplication(data: any): Promise<any> {
    return this.prisma.jobApplication.create({
      data,
      include: { job: true },
    });
  }

  async findJobApplicationById(id: string): Promise<any | null> {
    return this.prisma.jobApplication.findUnique({
      where: { id },
      include: { job: true },
    });
  }

  async updateJobApplication(id: string, data: Record<string, any>): Promise<any> {
    return this.prisma.jobApplication.update({
      where: { id },
      data,
      include: { job: true, interviews: true },
    });
  }

  async createInterviewSchedule(data: any): Promise<any> {
    return this.prisma.interviewSchedule.create({ data });
  }

  async createAppraisal(data: any): Promise<any> {
    return this.prisma.appraisal.create({
      data,
      include: { employee: true },
    });
  }

  async createEmployeeCertification(data: any): Promise<any> {
    return this.prisma.employeeCertification.create({ data });
  }
}
