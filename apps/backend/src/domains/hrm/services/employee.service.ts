import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import {
  CreateBranchDto,
  CreateDepartmentDto,
  CreateDesignationDto,
  CreateEmployeeDto,
} from '../dto/employee.dto.js';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async createBranch(tenantId: string, dto: CreateBranchDto) {
    return this.prisma.branch.create({
      data: {
        tenantId,
        name: dto.name,
        address: dto.address,
      },
      include: { departments: true },
    });
  }

  async getBranches(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenantId },
      include: {
        departments: {
          include: { designations: true },
        },
      },
    });
  }

  async createDepartment(dto: CreateDepartmentDto) {
    return this.prisma.department.create({
      data: {
        branchId: dto.branchId,
        name: dto.name,
      },
    });
  }

  async createDesignation(dto: CreateDesignationDto) {
    return this.prisma.designation.create({
      data: {
        departmentId: dto.departmentId,
        name: dto.name,
      },
    });
  }

  async createEmployee(tenantId: string, dto: CreateEmployeeDto) {
    const existing = await this.prisma.employee.findUnique({
      where: {
        tenantId_employeeCode: {
          tenantId,
          employeeCode: dto.employeeCode,
        },
      },
    });
    if (existing) {
      throw new ConflictException(`Employee with code ${dto.employeeCode} already exists`);
    }

    const employee = await this.prisma.employee.create({
      data: {
        tenantId,
        branchId: dto.branchId,
        departmentId: dto.departmentId,
        designationId: dto.designationId,
        employeeCode: dto.employeeCode,
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        joiningDate: new Date(dto.joiningDate),
        salaryBasic: dto.salaryBasic,
        status: 'active',
      },
      include: {
        branch: true,
        department: true,
        designation: true,
      },
    });

    // Automatically initialize basic salary setup
    await this.prisma.setSalary.create({
      data: {
        employeeId: employee.id,
        basicSalary: dto.salaryBasic,
        payslipType: 'monthly',
      },
    });

    return employee;
  }

  async getEmployees(tenantId: string) {
    return this.prisma.employee.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        branch: true,
        department: true,
        designation: true,
        documents: true,
        salaries: true,
      },
    });
  }

  async getEmployeeById(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
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
    if (!employee) throw new NotFoundException(`Employee ${employeeId} not found`);
    return employee;
  }

  async generateDocumentLetter(
    employeeId: string,
    type: 'offer' | 'joining' | 'experience',
    content?: string,
  ) {
    const emp = await this.getEmployeeById(employeeId);
    const date = new Date();

    if (type === 'offer') {
      return this.prisma.offerLetter.create({
        data: {
          employeeId,
          letterDate: date,
          content: content || `Offer of Employment extended to ${emp.fullName} for position in ${emp.department?.name || 'Operations'} with basic salary $${emp.salaryBasic}.`,
        },
      });
    }

    if (type === 'joining') {
      return this.prisma.joiningLetter.create({
        data: {
          employeeId,
          letterDate: date,
          content: content || `Joining Acceptance Letter: ${emp.fullName} officially reported to duty on ${emp.joiningDate.toISOString().split('T')[0]}.`,
        },
      });
    }

    return this.prisma.experienceCertificate.create({
      data: {
        employeeId,
        letterDate: date,
        content: content || `Certificate of Service: ${emp.fullName} served with distinction as ${emp.designation?.name || 'Staff'} at OmniStay 360.`,
      },
    });
  }
}
