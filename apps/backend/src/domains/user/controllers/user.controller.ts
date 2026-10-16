import {
  Body,
  Controller,
  Get,
  Patch,
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
import { UserService } from '../services/user.service.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUserPayload } from '../../../common/decorators/current-user.decorator.js';

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
  ) {
    const targetOrgId = queryOrgId || user.organizationId;
    return this.userService.getTenantUsers(targetOrgId || '', user);
  }
}

export const UsersController = UserController;
