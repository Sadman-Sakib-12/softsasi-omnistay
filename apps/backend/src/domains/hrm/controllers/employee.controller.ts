import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { EmployeeService } from '../services/employee.service.js';
import {
  CreateBranchDto,
  CreateDepartmentDto,
  CreateDesignationDto,
  CreateEmployeeDto,
} from '../dto/employee.dto.js';

@ApiTags('HRM - Employees & Organization Structure')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/hrm/employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post('branches')
  @Roles('SuperAdmin', 'Company Owner/GM', 'HR Director')
  @ApiOperation({ summary: 'Create new branch / property depot' })
  createBranch(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: CreateBranchDto,
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.employeeService.createBranch(tenantId, dto);
  }

  @Get('branches')
  @ApiOperation({ summary: 'List all branches with departments & designations' })
  getBranches(@CurrentUser() user: AuthenticatedUserPayload) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.employeeService.getBranches(tenantId);
  }

  @Post('departments')
  @Roles('SuperAdmin', 'Company Owner/GM', 'HR Director')
  @ApiOperation({ summary: 'Create department (Front Office, Culinary, Housekeeping)' })
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.employeeService.createDepartment(dto);
  }

  @Post('designations')
  @Roles('SuperAdmin', 'Company Owner/GM', 'HR Director')
  @ApiOperation({ summary: 'Create designation / staff title' })
  createDesignation(@Body() dto: CreateDesignationDto) {
    return this.employeeService.createDesignation(dto);
  }

  @Post()
  @Roles('SuperAdmin', 'Company Owner/GM', 'HR Director')
  @ApiOperation({ summary: 'Register employee & initialize personnel dossier' })
  createEmployee(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: CreateEmployeeDto,
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.employeeService.createEmployee(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all staff members for tenant' })
  getEmployees(@CurrentUser() user: AuthenticatedUserPayload) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.employeeService.getEmployees(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee complete personnel file' })
  getEmployeeById(@Param('id') id: string) {
    return this.employeeService.getEmployeeById(id);
  }

  @Post(':id/letters/:type')
  @Roles('SuperAdmin', 'Company Owner/GM', 'HR Director')
  @ApiOperation({ summary: 'Generate digital letter (offer, joining, or experience certificate)' })
  generateDocumentLetter(
    @Param('id') id: string,
    @Param('type') type: 'offer' | 'joining' | 'experience',
    @Body('content') content?: string,
  ) {
    return this.employeeService.generateDocumentLetter(id, type, content);
  }
}
