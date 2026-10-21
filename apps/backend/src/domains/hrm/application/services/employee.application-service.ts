import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  HRM_REPOSITORY_TOKEN,
  type IHrmRepository,
} from '../../domain/repositories/hrm.repository.interface.js';
import type {
  CreateBranchDto,
  CreateDepartmentDto,
  CreateDesignationDto,
  CreateEmployeeDto,
} from '../../presentation/dto/employee.dto.js';

@Injectable()
export class EmployeeApplicationService {
  constructor(
    @Inject(HRM_REPOSITORY_TOKEN)
    private readonly repo: IHrmRepository,
  ) {}

  async createBranch(tenantId: string, dto: CreateBranchDto) {
    return this.repo.createBranch({
      tenantId,
      name: dto.name,
      address: dto.address,
    });
  }

  async getBranches(tenantId: string) {
    return this.repo.findBranches(tenantId);
  }

  async createDepartment(dto: CreateDepartmentDto) {
    return this.repo.createDepartment({
      branchId: dto.branchId,
      name: dto.name,
    });
  }

  async createDesignation(dto: CreateDesignationDto) {
    return this.repo.createDesignation({
      departmentId: dto.departmentId,
      name: dto.name,
    });
  }

  async createEmployee(tenantId: string, dto: CreateEmployeeDto) {
    const existing = await this.repo.findEmployeeByCode(tenantId, dto.employeeCode);
    if (existing) {
      throw new ConflictException(`Employee code ${dto.employeeCode} is already assigned`);
    }

    const employee = await this.repo.createEmployee({
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
    });

    await this.repo.upsertSalary({
      employeeId: employee.id,
      basicSalary: dto.salaryBasic,
      payslipType: 'monthly',
    });

    return employee;
  }

  async getEmployees(tenantId: string) {
    return this.repo.findEmployees(tenantId);
  }

  async getEmployeeById(id: string) {
    const emp = await this.repo.findEmployeeById(id);
    if (!emp) throw new NotFoundException(`Employee ${id} not found`);
    return emp;
  }

  async terminateEmployee(id: string, reason = 'Resignation / Discharge') {
    return this.repo.updateEmployee(id, {
      status: 'terminated',
      deletedAt: new Date(),
      exitReason: reason,
    });
  }

  async generateDocumentLetter(
    employeeId: string,
    type: 'offer' | 'joining' | 'experience',
    content?: string,
  ) {
    const emp = await this.getEmployeeById(employeeId);
    const date = new Date();

    if (type === 'offer') {
      return this.repo.createDocumentLetter('offer', {
        employeeId,
        letterDate: date,
        content:
          content ||
          `Offer of Employment extended to ${emp.fullName} for position in ${
            emp.department?.name || 'Operations'
          } with basic salary $${emp.salaryBasic}.`,
      });
    }

    if (type === 'joining') {
      const joiningStr = emp.joiningDate instanceof Date ? emp.joiningDate.toISOString().split('T')[0] : String(emp.joiningDate).split('T')[0];
      return this.repo.createDocumentLetter('joining', {
        employeeId,
        letterDate: date,
        content:
          content ||
          `Joining Acceptance Letter: ${emp.fullName} officially reported to duty on ${joiningStr}.`,
      });
    }

    return this.repo.createDocumentLetter('experience', {
      employeeId,
      letterDate: date,
      content:
        content ||
        `Certificate of Service: ${emp.fullName} served with distinction as ${
          emp.designation?.name || 'Staff'
        } at OmniStay 360.`,
    });
  }
}
