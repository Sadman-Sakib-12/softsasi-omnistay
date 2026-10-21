import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { VendorApplicationService } from '../../application/services/vendor.application-service.js';
import {
  AddVendorTeamMemberDto,
  CreateVendorPlanDto,
  RegisterVendorDto,
  SubmitKycDto,
} from '../dto/vendor.dto.js';

@ApiTags('Marketplace - Hosts, Vendors & KYC')
@Controller('api/v1/marketplace/vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorApplicationService) {}

  @Post('plans')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin')
  @ApiOperation({ summary: 'Create platform vendor host tier / plan' })
  createPlan(@Body() dto: CreateVendorPlanDto) {
    return this.vendorService.createVendorPlan(dto);
  }

  @Get('plans')
  @ApiOperation({ summary: 'List available vendor membership plans' })
  getPlans() {
    return this.vendorService.getVendorPlans();
  }

  @Post('register')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Register current user as a third-party host / vendor' })
  registerVendor(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: RegisterVendorDto,
  ) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.vendorService.registerVendor(tenantId, user.userId, dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM')
  @ApiOperation({ summary: 'List all marketplace vendors for tenant' })
  getVendors(@CurrentUser() user: AuthenticatedUserPayload) {
    const tenantId = user.organizationId || '00000000-0000-0000-0000-000000000001';
    return this.vendorService.getVendors(tenantId);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current logged in host vendor profile' })
  getMyVendorProfile(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.vendorService.getVendorByUserId(user.userId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get vendor profile by ID' })
  getVendorById(@Param('id') id: string) {
    return this.vendorService.getVendorById(id);
  }

  @Post(':id/kyc')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit KYC identity & hospitality license documents' })
  submitKyc(@Param('id') id: string, @Body() dto: SubmitKycDto) {
    return this.vendorService.submitKyc(id, dto);
  }

  @Patch('kyc/:kycId/review')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM')
  @ApiOperation({ summary: 'Review and approve/reject host KYC documents' })
  reviewKyc(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Param('kycId') kycId: string,
    @Body('status') status: 'verified' | 'rejected',
  ) {
    return this.vendorService.reviewKyc(kycId, user.userId, status);
  }

  @Post(':id/team')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Assign team member to vendor organization' })
  addTeamMember(@Param('id') id: string, @Body() dto: AddVendorTeamMemberDto) {
    return this.vendorService.addTeamMember(id, dto);
  }

  @Get(':id/team')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List vendor operational team members' })
  getTeamMembers(@Param('id') id: string) {
    return this.vendorService.getTeamMembers(id);
  }
}
