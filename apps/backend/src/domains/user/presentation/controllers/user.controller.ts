import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from '../../application/services/user.service.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { JwtAuthGuard, Public } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Users & Identity')
@ApiBearerAuth('JWT-Auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves profile of the authenticated user without leaking credentials or secrets.',
  })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.userService.getProfile(user.userId);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Updates display name and/or password for the authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Profile successfully updated' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(user.userId, dto);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List tenant users',
    description: 'Lists all users within the scoped tenant organization with role information.',
  })
  @ApiQuery({ name: 'organizationId', required: false, description: 'Tenant UUID filter' })
  @ApiResponse({ status: 200, description: 'List of tenant users' })
  @ApiResponse({ status: 403, description: 'Cross-tenant access forbidden' })
  async getTenantUsers(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Query('organizationId') queryOrgId?: string,
    @Headers('x-tenant-id') headerOrgId?: string,
  ) {
    const targetOrgId = queryOrgId || headerOrgId || user?.organizationId;
    return this.userService.getTenantUsers(targetOrgId || '', user);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get user profile by ID',
    description: 'Retrieves user profile and role details by user UUID.',
  })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Public()
  @Post('invite')
  @ApiOperation({
    summary: 'Invite staff user',
    description: 'Provisions a new staff user and assigns role membership in the organization.',
  })
  @ApiResponse({ status: 201, description: 'Staff user invited successfully' })
  async inviteUser(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: { email: string; name?: string; role?: string; password?: string; organizationId?: string },
    @Query('organizationId') queryOrgId?: string,
    @Headers('x-tenant-id') headerOrgId?: string,
  ) {
    const targetOrgId = dto.organizationId || queryOrgId || headerOrgId || user?.organizationId;
    return this.userService.inviteUser(dto, targetOrgId, user);
  }

  @Public()
  @Post()
  @ApiOperation({
    summary: 'Create staff user',
    description: 'Provisions a new staff user and assigns role membership in the organization.',
  })
  @ApiResponse({ status: 201, description: 'Staff user created successfully' })
  async createUser(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() dto: { email: string; name?: string; role?: string; password?: string; organizationId?: string },
    @Query('organizationId') queryOrgId?: string,
    @Headers('x-tenant-id') headerOrgId?: string,
  ) {
    const targetOrgId = dto.organizationId || queryOrgId || headerOrgId || user?.organizationId;
    return this.userService.inviteUser(dto, targetOrgId, user);
  }

  @Public()
  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile/role/status' })
  async updateUser(@Param('id') id: string, @Body() dto: any) {
    return this.userService.updateUserAdmin(id, dto);
  }

  @Public()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete or deactivate user' })
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUserAdmin(id);
  }
}

export const UsersController = UserController;
