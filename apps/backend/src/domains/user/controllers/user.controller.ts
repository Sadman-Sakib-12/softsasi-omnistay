import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from '../services/user.service.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUserPayload } from '../../../common/decorators/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getProfile(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.userService.getProfile(user.userId);
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(user.userId, dto);
  }

  @Get()
  async getTenantUsers(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Query('organizationId') queryOrgId?: string,
  ) {
    const targetOrgId = queryOrgId || user.organizationId;
    return this.userService.getTenantUsers(targetOrgId || '', user);
  }
}

export const UsersController = UserController;
